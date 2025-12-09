
import { supabase } from "@/integrations/supabase/client";

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description?: string;
  client?: string;
  industry?: string;
  country?: string;
  year?: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  featured_order?: number;
  cover_image_url?: string;
  gallery_urls?: string[];
  live_url?: string;
  repo_url?: string;
  results_summary?: string;
  metrics?: any;
  technologies?: string[];
  tags?: string[];
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export const portfolioService = {
  async getPublishedProjects(): Promise<PortfolioProject[]> {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('featured_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching portfolio projects:', error);
      throw error;
    }
    
    return data || [];
  },

  async getFeaturedProjects(): Promise<PortfolioProject[]> {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .order('featured_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching featured projects:', error);
      throw error;
    }
    
    return data || [];
  },

  async getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching project by slug:', error);
      throw error;
    }
    
    return data;
  },

  async getAllProjects(): Promise<PortfolioProject[]> {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all projects:', error);
      throw error;
    }
    
    return data || [];
  },

  async createProject(project: Omit<PortfolioProject, 'id' | 'created_at' | 'updated_at'>): Promise<PortfolioProject> {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .insert([project])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }
    
    return data;
  },

  async updateProject(id: string, updates: Partial<PortfolioProject>): Promise<PortfolioProject> {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
    
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('portfolio_projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};
