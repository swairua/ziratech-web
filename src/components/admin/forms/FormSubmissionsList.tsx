import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Search, MoreHorizontal, Eye, Mail, Download, Archive, Clock } from 'lucide-react';

interface FormSubmission {
  id: string;
  form_type: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  position?: string;
  cv_file_url?: string;
  status: string;
  created_at: string;
  handled_by?: string;
  handled_at?: string;
  form_data?: any;
  data?: any;
  platform?: string;
}

interface FormSubmissionsListProps {
  formType: 'all' | 'contact' | 'career' | 'business' | 'platforms' | 'demo_booking' | 'start_journey' | 'zira_web' | 'zira_lock' | 'zira_sms' | 'partnership' | 'support';
  onUpdate?: () => void;
}

function parseJSON(val: any) {
  if (val == null) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(String(val));
  } catch {
    return null;
  }
}

function extractDetails(s: FormSubmission) {
  const details = parseJSON((s as any).form_data) || parseJSON((s as any).data) || {};
  return details || {};
}

export const FormSubmissionsList = ({ formType, onUpdate }: FormSubmissionsListProps) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [formType, searchQuery, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      const response = await api.formSubmissions.list();

      if (response.error) {
        throw new Error(response.error);
      }

      let list: any[] = Array.isArray(response.data) ? response.data : [];

      // Apply form type filter on client side
      if (formType !== 'all') {
        if (formType === 'business') {
          list = list.filter((s: any) => ['demo_booking', 'start_journey', 'partnership', 'support'].includes(s.form_type));
        } else if (formType === 'platforms') {
          list = list.filter((s: any) => ['zira_web', 'zira_lock', 'zira_sms'].includes(s.form_type));
        } else {
          list = list.filter((s: any) => s.form_type === formType);
        }
      }

      // Apply search filter on client side
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        list = list.filter((s: any) => {
          const d = extractDetails(s);
          return (
            s.name?.toLowerCase().includes(query) ||
            s.email?.toLowerCase().includes(query) ||
            s.company?.toLowerCase().includes(query) ||
            d?.name?.toLowerCase?.().includes(query) ||
            d?.email?.toLowerCase?.().includes(query) ||
            d?.company?.toLowerCase?.().includes(query)
          );
        });
      }

      // Apply status filter on client side
      if (statusFilter !== 'all') {
        list = list.filter((s: any) => s.status === statusFilter);
      }

      // Sort by created_at descending
      list.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setSubmissions(list as FormSubmission[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch form submissions: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    try {
      const response = await api.formSubmissions.updateStatus(submissionId, newStatus);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: `Submission marked as ${newStatus}`,
      });

      fetchSubmissions();
      onUpdate?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update submission: " + error.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      responded: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    } as const;

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getFormTypeBadge = (type: string) => {
    const colors = {
      contact: 'bg-blue-100 text-blue-800',
      career: 'bg-green-100 text-green-800',
      demo_booking: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      start_journey: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      zira_web: 'bg-green-500/10 text-green-600 border-green-500/20',
      zira_lock: 'bg-red-500/10 text-red-600 border-red-500/20',
      zira_sms: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      partnership: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
      support: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    } as const;

    const labels = {
      contact: 'Contact',
      career: 'Career',
      demo_booking: 'Demo Booking',
      start_journey: 'Business Consultation',
      zira_web: 'Zira Web',
      zira_lock: 'Zira Lock',
      zira_sms: 'Zira SMS',
      partnership: 'Partnership',
      support: 'Support'
    } as const;

    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'} variant="outline">
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Form Type', 'Status', 'Date', 'Message'];
    const csvContent = [
      headers.join(','),
      ...submissions.map(sub => {
        const d: any = extractDetails(sub);
        const name = sub.name || d?.name || '';
        const email = sub.email || d?.email || '';
        const phone = sub.phone || d?.phone || '';
        const company = sub.company || d?.company || '';
        const message = (sub.message || '').replace(/\"/g, '"');
        return [
          name,
          email,
          phone,
          company,
          sub.form_type,
          sub.status,
          new Date(sub.created_at).toLocaleDateString(),
          `"${message.replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `form_submissions_${formType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Form Submissions ({submissions.length})</CardTitle>
            <CardDescription>Manage and respond to form submissions</CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-gray-500">No submissions found</p>
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => {
                  const d: any = extractDetails(submission);
                  const name = submission.name || d?.name;
                  const email = submission.email || d?.email;
                  const phone = submission.phone || d?.phone;
                  const company = submission.company || d?.company;
                  const role = submission.position || d?.role;
                  const platform = submission.platform || d?.platform;
                  const challenges = d?.currentChallenges || d?.current_challenges;
                  const requirements = d?.requirements;
                  const timePref = d?.timePreference || d?.preferred_time;
                  const specificReq = d?.specificRequirements || d?.specific_requirements;
                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{name}</div>
                          <div className="text-sm text-gray-500">{email}</div>
                          {phone && (
                            <div className="text-sm text-gray-500">{phone}</div>
                          )}
                          {company && (
                            <div className="text-sm text-gray-500">{company}</div>
                          )}
                          {role && (
                            <div className="text-sm text-blue-600">
                              {submission.form_type === 'career' ? 'Position' : 'Role'}: {role}
                            </div>
                          )}
                          {platform && (
                            <div className="text-sm text-purple-600">Platform: {platform}</div>
                          )}
                          {d?.businessType && (
                            <div className="text-sm text-green-600">Business: {d.businessType}</div>
                          )}
                          {d?.businessSize && (
                            <div className="text-sm text-orange-600">Size: {d.businessSize}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getFormTypeBadge(submission.form_type)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission.status)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48 text-sm space-y-1">
                          {submission.message && (
                            <div className="truncate">{submission.message}</div>
                          )}
                          {challenges && (
                            <div className="truncate text-red-600">
                              <span className="font-medium">Challenges:</span> {challenges}
                            </div>
                          )}
                          {requirements && (
                            <div className="truncate text-blue-600">
                              <span className="font-medium">Requirements:</span> {requirements}
                            </div>
                          )}
                          {timePref && (
                            <div className="truncate text-green-600">
                              <span className="font-medium">Preferred Time:</span> {timePref}
                            </div>
                          )}
                          {specificReq && (
                            <div className="truncate text-purple-600">
                              <span className="font-medium">Needs:</span> {specificReq}
                            </div>
                          )}
                          {!submission.message && !challenges && !requirements && !timePref && !specificReq && (
                            <div className="text-gray-400">No message</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white z-50">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            {submission.cv_file_url && (
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download CV
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleStatusUpdate(submission.id, 'reviewed')}>
                              Mark as Reviewed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(submission.id, 'responded')}>
                              Mark as Responded
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(submission.id, 'archived')}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
