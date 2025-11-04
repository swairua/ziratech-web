const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api.php';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  count?: number;
}

async function apiCall<T>(
  table: string,
  method: string = "GET",
  params?: Record<string, any>,
  body?: any
): Promise<ApiResponse<T>> {
  try {
    // Build a URL handling both absolute and relative API_BASE values
    let url: URL;
    try {
      url = /^https?:\/\//i.test(API_BASE) ? new URL(API_BASE) : new URL(API_BASE, window.location.origin);
    } catch (e) {
      // Fallback to string construction if URL() fails
      const baseStr = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
      const urlStr = `${baseStr}?table=${table}`;
      // Use the URL constructor with origin to ensure a valid URL object
      url = new URL(urlStr, window.location.origin);
    }

    // Ensure the table param is set
    url.searchParams.set('table', table);

    if (method === "GET" && params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), options);
    } catch (fetchErr) {
      console.error('Fetch failed:', fetchErr);
      return { error: `API call failed: ${fetchErr instanceof Error ? fetchErr.message : 'Network error'}` };
    }

    // Get headers BEFORE attempting to read body (headers don't consume the stream)
    const status = response.status;
    const ok = response.ok;
    const contentType = response.headers.get('content-type') || '';

    // Read response body with fallback for stream consumption issues
    let text: string = '';
    try {
      text = await response.text();
    } catch (readErr) {
      // Body stream already consumed by middleware/interceptor - gracefully handle
      console.warn('Could not read response body (stream consumed):', readErr);
      // Return error based on status code
      if (!ok) {
        return { error: `API Error: ${status}` };
      }
      // If status is OK but we can't read body, treat as success with empty data
      return { data: null };
    }

    const snippet = (text || '').slice(0, 1000).replace(/\s+/g, ' ');

    // Check if response is ok first
    if (!ok) {
      console.error(`API Error ${status}: ${snippet}`);
      return { error: `API Error: ${status}` };
    }

    // If text is empty, return success with null data
    if (!text || text.trim() === '') {
      console.warn('Empty response body from API');
      return { data: null };
    }

    // If content-type is missing or says JSON, try to parse
    const isJsonContent = !contentType || contentType.includes('application/json') || contentType.includes('text/plain');

    if (!isJsonContent) {
      console.error('Non-JSON API response content-type:', contentType, 'Snippet:', snippet);
      if (snippet.trim().startsWith('<?php') || snippet.trim().startsWith('<html') || snippet.trim().startsWith('<!DOCTYPE')) {
        return { error: 'Invalid JSON response from API — server returned HTML/PHP. Ensure the PHP backend is running and API_URL is correct.' };
      }
      return { error: `Invalid response format from API (${contentType})` };
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError?.toString(), 'Text:', text.slice(0, 200));
      return { error: 'Invalid JSON response from API' };
    }

    // Check if response contains error property
    if (data.error) {
      return { error: data.error };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error('API call error:', errorMsg);
    return {
      error: errorMsg,
    };
  }
}

// Activity Logs
export const activityLogsApi = {
  async list(params?: Record<string, any>) {
    return apiCall("activity_logs", "GET", params);
  },

  async create(data: any) {
    return apiCall("activity_logs", "POST", undefined, data);
  },
};

// Blog Categories
export const blogCategoriesApi = {
  async list() {
    return apiCall("blog_categories", "GET");
  },

  async get(id: string) {
    return apiCall("blog_categories", "GET", { id });
  },

  async create(data: any) {
    return apiCall("blog_categories", "POST", undefined, data);
  },

  async update(id: string, data: any) {
    return apiCall("blog_categories", "PUT", { id }, data);
  },

  async delete(id: string) {
    return apiCall("blog_categories", "DELETE", { id });
  },
};

// Blog Posts
export const blogPostsApi = {
  async list(params?: Record<string, any>) {
    return apiCall("blog_posts", "GET", params);
  },

  async get(id: string) {
    return apiCall("blog_posts", "GET", { id });
  },

  async getBySlug(slug: string) {
    return apiCall("blog_posts", "GET", { slug });
  },

  async create(data: any) {
    return apiCall("blog_posts", "POST", undefined, data);
  },

  async update(id: string, data: any) {
    return apiCall("blog_posts", "PUT", { id }, data);
  },

  async delete(id: string) {
    return apiCall("blog_posts", "DELETE", { id });
  },

  async incrementViewCount(id: string) {
    return apiCall("blog_posts", "PUT", { id, action: "increment_views" });
  },
};

// Company Settings
export const companySettingsApi = {
  async get(key: string) {
    return apiCall("company_settings", "GET", { setting_key: key });
  },

  async list() {
    return apiCall("company_settings", "GET");
  },

  async set(key: string, value: any) {
    return apiCall("company_settings", "POST", undefined, {
      setting_key: key,
      setting_value: value,
    });
  },

  async update(id: string, data: any) {
    return apiCall("company_settings", "PUT", { id }, data);
  },
};

// Form Submissions
export const formSubmissionsApi = {
  async list(params?: Record<string, any>) {
    return apiCall("form_submissions", "GET", params);
  },

  async get(id: string) {
    return apiCall("form_submissions", "GET", { id });
  },

  async create(data: any) {
    return apiCall("form_submissions", "POST", undefined, data);
  },

  async update(id: string, data: any) {
    return apiCall("form_submissions", "PUT", { id }, data);
  },

  async updateStatus(id: string, status: string) {
    return apiCall("form_submissions", "PUT", { id }, { status });
  },

  async delete(id: string) {
    return apiCall("form_submissions", "DELETE", { id });
  },

  async getStats() {
    return apiCall("form_submissions", "GET", { action: "stats" });
  },
};

// Profiles
export const profilesApi = {
  async list(params?: Record<string, any>) {
    return apiCall("profiles", "GET", params);
  },

  async get(userId: string) {
    return apiCall("profiles", "GET", { user_id: userId });
  },

  async create(data: any) {
    return apiCall("profiles", "POST", undefined, data);
  },

  async update(userId: string, data: any) {
    return apiCall("profiles", "PUT", { user_id: userId }, data);
  },

  async count() {
    return apiCall("profiles", "GET", { action: "count" });
  },
};

// User Roles
export const userRolesApi = {
  async list(params?: Record<string, any>) {
    return apiCall("user_roles", "GET", params);
  },

  async get(userId: string) {
    return apiCall("user_roles", "GET", { user_id: userId });
  },

  async getRole(userId: string) {
    return apiCall("user_roles", "GET", { user_id: userId, action: "get_role" });
  },

  async create(data: any) {
    return apiCall("user_roles", "POST", undefined, data);
  },

  async update(userId: string, data: any) {
    return apiCall("user_roles", "PUT", { user_id: userId }, data);
  },

  async upsert(data: any) {
    return apiCall("user_roles", "POST", { action: "upsert" }, data);
  },

  async delete(userId: string) {
    return apiCall("user_roles", "DELETE", { user_id: userId });
  },
};

// Products
export const productsApi = {
  async list(params?: Record<string, any>) {
    return apiCall("products", "GET", params);
  },

  async get(id: string) {
    return apiCall("products", "GET", { id });
  },

  async getFeatured() {
    return apiCall("products", "GET", { is_featured: true, action: "featured" });
  },

  async create(data: any) {
    return apiCall("products", "POST", undefined, data);
  },

  async update(id: string, data: any) {
    return apiCall("products", "PUT", { id }, data);
  },

  async delete(id: string) {
    return apiCall("products", "DELETE", { id });
  },

  async count() {
    return apiCall("products", "GET", { action: "count" });
  },
};

// Email Templates
export const emailTemplatesApi = {
  async list(params?: Record<string, any>) {
    return apiCall("email_templates", "GET", params);
  },

  async get(id: string) {
    return apiCall("email_templates", "GET", { id });
  },

  async create(data: any) {
    return apiCall("email_templates", "POST", undefined, data);
  },

  async update(id: string, data: any) {
    return apiCall("email_templates", "PUT", { id }, data);
  },

  async delete(id: string) {
    return apiCall("email_templates", "DELETE", { id });
  },
};

// Automation Rules
export const automationRulesApi = {
  async list(params?: Record<string, any>) {
    return apiCall("automation_rules", "GET", params);
  },

  async get(id: string) {
    return apiCall("automation_rules", "GET", { id });
  },

  async create(data: any) {
    return apiCall("automation_rules", "POST", undefined, data);
  },

  async update(id: string, data: any) {
    return apiCall("automation_rules", "PUT", { id }, data);
  },

  async delete(id: string) {
    return apiCall("automation_rules", "DELETE", { id });
  },

  async toggle(id: string, isActive: boolean) {
    return apiCall("automation_rules", "PUT", { id }, { is_active: isActive });
  },
};

// App Settings
export const appSettingsApi = {
  async list() {
    return apiCall("app_settings", "GET");
  },

  async get(key: string) {
    return apiCall("app_settings", "GET", { setting_key: key });
  },

  async set(key: string, value: any) {
    return apiCall("app_settings", "POST", undefined, {
      setting_key: key,
      setting_value: value,
    });
  },

  async update(id: string, data: any) {
    return apiCall("app_settings", "PUT", { id }, data);
  },

  async delete(id: string) {
    return apiCall("app_settings", "DELETE", { id });
  },
};

// Notification Settings
export const notificationSettingsApi = {
  async list() {
    return apiCall("notification_settings", "GET");
  },

  async get(userId: string) {
    return apiCall("notification_settings", "GET", { user_id: userId });
  },

  async create(data: any) {
    return apiCall("notification_settings", "POST", undefined, data);
  },

  async update(userId: string, data: any) {
    return apiCall("notification_settings", "PUT", { user_id: userId }, data);
  },

  async delete(userId: string) {
    return apiCall("notification_settings", "DELETE", { user_id: userId });
  },
};

// Export a unified API object for convenience
export const api = {
  activityLogs: activityLogsApi,
  blogCategories: blogCategoriesApi,
  blogPosts: blogPostsApi,
  companySettings: companySettingsApi,
  formSubmissions: formSubmissionsApi,
  profiles: profilesApi,
  userRoles: userRolesApi,
  products: productsApi,
  emailTemplates: emailTemplatesApi,
  automationRules: automationRulesApi,
  appSettings: appSettingsApi,
  notificationSettings: notificationSettingsApi,
};

export default api;
