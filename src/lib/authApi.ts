const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api.php';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  status: string;
  role: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

// Simple crypto for hashing (browser implementation)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Simple session token generation
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const status = response.status;
  const ok = response.ok;

  // Clone response immediately to avoid "body stream already read" errors
  let safeResponse: Response;
  try {
    safeResponse = response.clone();
  } catch (e) {
    console.error('Response body already consumed:', status);
    throw new Error(`API Error: ${status}`);
  }

  const contentType = safeResponse.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    let text;
    try {
      text = await safeResponse.text();
    } catch (e) {
      console.error('Failed to read non-JSON response body', e);
      throw new Error(`API Error: ${status}`);
    }
    const snippet = text.slice(0, 300).replace(/\s+/g, ' ');
    console.error('API returned non-JSON response:', snippet);
    if (snippet.trim().startsWith('<?php') || snippet.trim().startsWith('<html') || snippet.trim().startsWith('<!DOCTYPE')) {
      throw new Error('Invalid JSON response from API — server returned HTML/PHP. Ensure the PHP backend is running and API_URL is correct.');
    }
    throw new Error('API Error: Invalid response format');
  }

  let data;
  try {
    data = await safeResponse.json();
  } catch (parseError) {
    console.error('Failed to parse response as JSON:', parseError, 'Status:', status);
    throw new Error(`API Error: Invalid response format (${status})`);
  }

  if (!ok) {
    console.error(`API Error ${status}:`, data);
    throw new Error(`API Error: ${status}`);
  }

  if (!data) {
    throw new Error('Empty response from API');
  }

  if (data.error) {
    console.error('API Error:', data.error);
    throw new Error(data.error);
  }

  return data;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthSession> {
    const passwordHash = await hashPassword(password);
    const normalizedEmail = (email || '').trim().toLowerCase();

    // Fetch users
    const response = await fetch(`${API_BASE}?table=users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const usersJson = await handleResponse<any>(response);
    const users: any[] = Array.isArray(usersJson)
      ? usersJson
      : Array.isArray(usersJson?.data)
      ? usersJson.data
      : Array.isArray(usersJson?.rows)
      ? usersJson.rows
      : [];

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('Invalid email or password');
    }

    // Find user by email (case-insensitive)
    const user = users.find((u: any) => (u.email || '').toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password hash matches
    if ((user.password_hash || '') !== passwordHash) {
      throw new Error('Invalid email or password');
    }

    // Get user role
    const roleResponse = await fetch(`${API_BASE}?table=user_roles`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const rolesJson = await handleResponse<any>(roleResponse);
    const roles: any[] = Array.isArray(rolesJson)
      ? rolesJson
      : Array.isArray(rolesJson?.data)
      ? rolesJson.data
      : Array.isArray(rolesJson?.rows)
      ? rolesJson.rows
      : [];

    const userIdNum = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const userRole = roles.find((r: any) => {
      const rid = typeof r.user_id === 'string' ? parseInt(r.user_id, 10) : r.user_id;
      return rid === userIdNum;
    });

    // Update last login (best-effort)
    await fetch(`${API_BASE}?table=users&id=${userIdNum}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ last_login_at: new Date().toISOString() }),
    }).catch(err => console.warn('Failed to update last login:', err));

    // Audit log (best-effort)
    await fetch(`${API_BASE}?table=activity_logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userIdNum,
        action: 'login',
        table_name: 'users',
        record_id: userIdNum,
        description: JSON.stringify({ email: user.email })
      }),
    }).catch(err => console.warn('Failed to write login log:', err));

    const token = generateToken();

    // Store session
    const session: AuthSession = {
      user: {
        id: userIdNum,
        email: user.email,
        full_name: user.full_name,
        status: user.status,
        role: (userRole?.role || 'user').toLowerCase(),
      },
      token,
    };

    localStorage.setItem('auth_session', JSON.stringify(session));
    localStorage.setItem('auth_token', token);

    return session;
  },

  async logout(): Promise<void> {
    try {
      const session = await this.getSession();
      if (session?.user?.id) {
        await fetch(`${API_BASE}?table=activity_logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: session.user.id,
            action: 'logout',
            table_name: 'users',
            record_id: session.user.id,
            description: JSON.stringify({ email: session.user.email })
          }),
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('auth_session');
      localStorage.removeItem('auth_token');
    }
  },

  async getSession(): Promise<AuthSession | null> {
    const sessionStr = localStorage.getItem('auth_session');
    const token = localStorage.getItem('auth_token');

    if (!sessionStr || !token) {
      return null;
    }

    try {
      const session = JSON.parse(sessionStr) as AuthSession;
      // Verify token matches
      if (session.token !== token) {
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  async isAdmin(): Promise<boolean> {
    const session = await this.getSession();
    return (session?.user.role || '').toLowerCase() === 'admin';
  },

  async signup(email: string, password: string, fullName: string): Promise<AuthSession> {
    const passwordHash = await hashPassword(password);

    // Create user
    const createResponse = await fetch(`${API_BASE}?table=users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        status: 'active',
      }),
    });

    const userResult = await handleResponse<{ id: number }>(createResponse);

    if (!userResult.id) {
      throw new Error('Failed to create user');
    }

    // Assign default user role
    await fetch(`${API_BASE}?table=user_roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userResult.id,
        role: 'user',
      }),
    }).catch(err => console.warn('Failed to assign role:', err));

    // Login with the new account
    return this.login(email, password);
  },

  async resetPassword(email: string): Promise<{ success: boolean }> {
    // This is a placeholder - in production, send reset email
    // For now, just return a success message
    console.warn('Password reset not implemented. Contact support.');
    return { success: false };
  },
};
