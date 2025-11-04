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

  // Read full response body as text first to avoid clone errors
  let text: string;
  try {
    text = await response.text();
  } catch (e) {
    console.error('Failed to read response body:', e);
    throw new Error(`API Error: ${status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const snippet = (text || '').slice(0, 1000).replace(/\s+/g, ' ');

  // If not JSON, detect PHP/HTML and return helpful error
  if (!contentType.includes('application/json')) {
    console.error('API returned non-JSON response:', snippet);
    if (snippet.trim().startsWith('<?php') || snippet.trim().startsWith('<!DOCTYPE') || snippet.trim().startsWith('<html')) {
      throw new Error('Invalid JSON response from API — server returned HTML/PHP. Ensure the PHP backend is running and API_URL is correct.');
    }
    throw new Error('Invalid JSON response from API');
  }

  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (parseError) {
    console.error('Failed to parse response as JSON:', parseError, 'Snippet:', snippet);
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
    const response = await fetch(`${API_BASE}?table=products&action=featured`, { method: "GET" });
    const data = await handleResponse<any>(response);
    const list: Product[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
    return list.sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
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
