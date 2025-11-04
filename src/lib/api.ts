const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api.php';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  category?: string;
  is_featured?: boolean;
  featured_order?: number;
  created_at?: string;
  updated_at?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const status = response.status;
  const ok = response.ok;

  // Check Content-Type before parsing
  const contentType = response.headers.get('content-type') || '';

  // If content-type isn't JSON, read text and provide a useful error
  if (!contentType.includes('application/json')) {
    let text;
    try {
      text = await response.text();
    } catch (e) {
      console.error('Failed to read non-JSON response body', e);
      throw new Error(`API returned non-JSON response (status ${status})`);
    }
    const snippet = text.slice(0, 300).replace(/\s+/g, ' ');
    console.error('API returned non-JSON response:', snippet);

    // Detect common case where PHP source is returned (PHP not executed) or HTML error page
    if (snippet.trim().startsWith('<?php') || snippet.trim().startsWith('<!DOCTYPE') || snippet.trim().startsWith('<html')) {
      throw new Error('Invalid JSON response from API — server returned HTML/PHP. Ensure the PHP backend is running and API_URL is correct.');
    }

    throw new Error('Invalid JSON response from API');
  }

  // Clone response immediately to avoid "body stream already read" errors
  let safeResponse: Response;
  try {
    safeResponse = response.clone();
  } catch (e) {
    console.error('Response body already consumed:', status);
    throw new Error(`API Error: ${status}`);
  }

  let data;
  try {
    data = await safeResponse.json();
  } catch (parseError) {
    console.error('Failed to parse response as JSON:', parseError, 'Status:', status);
    throw new Error(`Invalid JSON response from API (${status})`);
  }

  if (!ok) {
    console.error(`API Error ${status}:`, data);
    throw new Error(`API Error: ${status}`);
  }

  if (!data) {
    throw new Error('Empty response from API');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export const productsAPI = {
  async getAll(): Promise<Product[]> {
    const response = await fetch(`${API_BASE}?table=products`);
    const data = await handleResponse<any>(response);
    if (Array.isArray(data)) return data as Product[];
    if (Array.isArray(data?.data)) return data.data as Product[];
    if (Array.isArray(data?.rows)) return data.rows as Product[];
    return [];
  },

  async getFeatured(): Promise<Product[]> {
    const response = await fetch(`${API_BASE}?table=products`, { method: "GET" });
    const all = await handleResponse<any>(response);
    const list: Product[] = Array.isArray(all)
      ? all
      : Array.isArray(all?.data)
      ? all.data
      : Array.isArray(all?.rows)
      ? all.rows
      : [];
    return list
      .filter((p) => p.is_featured)
      .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
  },

  async getById(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE}?table=products&id=${id}`);
    const data = await handleResponse<any>(response);
    if (Array.isArray(data)) return data[0] as Product;
    if (Array.isArray(data?.data)) return data.data[0] as Product;
    if (data?.data && typeof data.data === 'object') return data.data as Product;
    return data as Product;
  },

  async create(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<{ success: boolean; id: number }> {
    const response = await fetch(`${API_BASE}?table=products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return handleResponse<{ success: boolean; id: number }>(response);
  },

  async update(id: number, updates: Partial<Product>): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}?table=products&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean }>(response);
  },

  async delete(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}?table=products&id=${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ success: boolean }>(response);
  },
};
