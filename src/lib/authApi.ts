const API_BASE = "https://zira-tech.com/api.php";

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
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || `Auth Error: ${response.status}`);
  }

  return data;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthSession> {
    const passwordHash = await hashPassword(password);

    // Fetch user by email
    const response = await fetch(`${API_BASE}?table=users&email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const users = await handleResponse<any[]>(response);

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // Verify password
    if (user.password_hash !== passwordHash) {
      throw new Error('Invalid email or password');
    }

    // Get user role
    const roleResponse = await fetch(`${API_BASE}?table=user_roles`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const roles = await handleResponse<any[]>(roleResponse);
    const userRole = roles.find((r: any) => r.user_id === user.id);

    // Update last login
    await fetch(`${API_BASE}?table=users&id=${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ last_login_at: new Date().toISOString() }),
    }).catch(err => console.warn('Failed to update last login:', err));

    const token = generateToken();

    // Store session
    const session: AuthSession = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        status: user.status,
        role: userRole?.role || 'user',
      },
      token,
    };

    // Save to localStorage
    localStorage.setItem('auth_session', JSON.stringify(session));
    localStorage.setItem('auth_token', token);

    return session;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_session');
    localStorage.removeItem('auth_token');
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
    return session?.user.role === 'admin' || false;
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
