// Supabase has been replaced with mysqli-based API (api.php)
// All database operations now use src/lib/apiClient.ts instead
// This file is kept for backward compatibility but should not be used

export const supabase = null as any;

console.warn('Supabase client is disabled. Using apiClient instead.');

// Placeholder for any functions that were using this - they should be updated to use apiClient
export const database = {
  async submitContactInquiry() {
    throw new Error('Use api.formSubmissions.create() instead');
  },
  async getContactInquiries() {
    throw new Error('Use api.formSubmissions.list() instead');
  },
  async updateInquiryStatus() {
    throw new Error('Use api.formSubmissions.updateStatus() instead');
  },
  async submitJobApplication() {
    throw new Error('Use api.formSubmissions.create() instead');
  },
  async getJobApplications() {
    throw new Error('Use api.formSubmissions.list() instead');
  },
  async updateApplicationStatus() {
    throw new Error('Use api.formSubmissions.updateStatus() instead');
  },
  async getUserRole() {
    throw new Error('Use api.userRoles.getRole() instead');
  },
  async setUserRole() {
    throw new Error('Use api.userRoles.upsert() instead');
  },
};
