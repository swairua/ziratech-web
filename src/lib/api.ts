const API_BASE = "https://zira-tech.com/api.php";

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

  let data;
  try {
    data = await response.json();
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
    const data = await handleResponse<Product[]>(response);
    return Array.isArray(data) ? data : [];
  },

  async getFeatured(): Promise<Product[]> {
    const response = await fetch(
      `${API_BASE}?table=products`,
      {
        method: "GET",
      }
    );
    const allProducts = await handleResponse<Product[]>(response);
    return Array.isArray(allProducts)
      ? allProducts
          .filter((p) => p.is_featured)
          .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0))
      : [];
  },

  async getById(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE}?table=products&id=${id}`);
    const data = await handleResponse<Product[]>(response);
    return Array.isArray(data) ? data[0] : (data as Product);
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
