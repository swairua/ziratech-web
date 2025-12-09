import { createClient } from '@supabase/supabase-js'

// For Lovable projects with native Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Check if we have the required credentials
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.error('Supabase URL not found. Please ensure Supabase is properly connected to your Lovable project.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.error('Supabase Anon Key not found. Please ensure Supabase is properly connected to your Lovable project.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface ContactInquiry {
  id: string
  name: string
  email: string
  phone?: string
  service_interest: string
  message: string
  status: 'new' | 'in_review' | 'responded' | 'closed'
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  name: string
  email: string
  phone?: string
  position: string
  experience_level: string
  portfolio_url?: string
  github_url?: string
  cv_file_url?: string
  message: string
  status: 'new' | 'reviewing' | 'interview' | 'hired' | 'rejected'
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: 'SystemAdmin' | 'HR' | 'SupportAgent'
  created_at: string
}

// Service functions
export const contactService = {
  async create(data: Omit<ContactInquiry, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data: result, error } = await supabase
      .from('contact_inquiries')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async getAll() {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: ContactInquiry['status']) {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const jobApplicationService = {
  async create(data: Omit<JobApplication, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data: result, error } = await supabase
      .from('job_applications')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async getAll() {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: JobApplication['status']) {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const userRoleService = {
  async getUserRole(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data?.role || null
  },

  async assignRole(userId: string, role: UserRole['role']) {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const fileUploadService = {
  async uploadCV(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('cv-uploads')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('cv-uploads')
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  async deleteCV(url: string) {
    const fileName = url.split('/').pop()
    if (!fileName) return

    const { error } = await supabase.storage
      .from('cv-uploads')
      .remove([fileName])

    if (error) throw error
  }
}