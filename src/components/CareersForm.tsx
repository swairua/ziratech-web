import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Send, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const CareersForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    portfolio: "",
    github: "",
    message: ""
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document",
          variant: "destructive"
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setCvFile(file);
    }
  };

  const uploadCV = async (file: File): Promise<string | null> => {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get secure upload URL from edge function with authentication
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('secure-cv-upload', {
        body: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          userId: session?.user?.id || null
        },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`
        } : {}
      });

      if (uploadError || !uploadData?.uploadUrl) {
        throw new Error(uploadData?.error || 'Failed to get upload URL');
      }

      // Upload file using signed URL
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Return the file path (not public URL for security)
      return uploadData.filePath;
    } catch (error) {
      console.error('Error uploading CV:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let cvFileUrl = null;
      
      // Upload CV if provided
      if (cvFile) {
        cvFileUrl = await uploadCV(cvFile);
        if (!cvFileUrl) {
          throw new Error('Failed to upload CV');
        }
      }

      // Save to form_submissions table
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_type: 'career_application',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          position: formData.position,
          cv_file_url: cvFileUrl,
          form_data: {
            experience: formData.experience,
            portfolio: formData.portfolio,
            github: formData.github
          }
        });

      if (error) throw error;

      // Send emails via edge function
      try {
        const emailResponse = await supabase.functions.invoke('send-form-emails', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            position: formData.position,
            experience: formData.experience,
            portfolio: formData.portfolio,
            github: formData.github,
            message: formData.message,
            cv_file_url: cvFileUrl,
            form_type: 'career_application'
          }
        });

        if (emailResponse.error) {
          console.error('Email sending failed:', emailResponse.error);
        }
      } catch (emailError) {
        console.error('Error calling email function:', emailError);
        // Don't fail the form submission if email fails
      }

      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest in joining Zira Technologies. We'll review your application and get back to you within 5 business days."
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        portfolio: "",
        github: "",
        message: ""
      });
      setCvFile(null);

    } catch (error) {
      console.error("Error submitting career application:", error);
      toast({
        title: "Error",
        description: "There was an issue submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-brand-navy to-brand-navy-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-brand-navy">Apply to Join Our Team</CardTitle>
              <CardDescription className="text-lg">
                Submit your application and let's start building the future of African technology together.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="career-name" className="text-brand-navy font-medium">Full Name *</Label>
                    <Input 
                      id="career-name" 
                      value={formData.name} 
                      onChange={e => handleInputChange("name", e.target.value)} 
                      placeholder="Your full name" 
                      className="border-2 focus:border-brand-orange" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="career-email" className="text-brand-navy font-medium">Email *</Label>
                    <Input 
                      id="career-email" 
                      type="email" 
                      value={formData.email} 
                      onChange={e => handleInputChange("email", e.target.value)} 
                      placeholder="your@email.com" 
                      className="border-2 focus:border-brand-orange" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="career-phone" className="text-brand-navy font-medium">Phone Number</Label>
                    <Input 
                      id="career-phone" 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => handleInputChange("phone", e.target.value)} 
                      placeholder="+254 7XX XXX XXX" 
                      className="border-2 focus:border-brand-orange" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="career-position" className="text-brand-navy font-medium">Position of Interest *</Label>
                    <Select value={formData.position} onValueChange={value => handleInputChange("position", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-stack-developer">Full Stack Developer</SelectItem>
                        <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                        <SelectItem value="backend-developer">Backend Developer</SelectItem>
                        <SelectItem value="mobile-developer">Mobile App Developer</SelectItem>
                        <SelectItem value="devops-engineer">DevOps Engineer</SelectItem>
                        <SelectItem value="data-engineer">Data Engineer</SelectItem>
                        <SelectItem value="product-manager">Product Manager</SelectItem>
                        <SelectItem value="business-development">Business Development</SelectItem>
                        <SelectItem value="marketing-specialist">Marketing Specialist</SelectItem>
                        <SelectItem value="customer-success">Customer Success</SelectItem>
                        <SelectItem value="sales-representative">Sales Representative</SelectItem>
                        <SelectItem value="other">Other Position</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="career-experience" className="text-brand-navy font-medium">Years of Experience *</Label>
                  <Select value={formData.experience} onValueChange={value => handleInputChange("experience", value)}>
                    <SelectTrigger className="border-2 focus:border-brand-orange">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years (Entry Level)</SelectItem>
                      <SelectItem value="1-3">1-3 years (Junior)</SelectItem>
                      <SelectItem value="3-5">3-5 years (Mid-Level)</SelectItem>
                      <SelectItem value="5-8">5-8 years (Senior)</SelectItem>
                      <SelectItem value="8+">8+ years (Lead/Principal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="career-portfolio" className="text-brand-navy font-medium">Portfolio URL</Label>
                    <Input 
                      id="career-portfolio" 
                      type="url" 
                      value={formData.portfolio} 
                      onChange={e => handleInputChange("portfolio", e.target.value)} 
                      placeholder="https://yourportfolio.com" 
                      className="border-2 focus:border-brand-orange" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="career-github" className="text-brand-navy font-medium">GitHub/LinkedIn Profile</Label>
                    <Input 
                      id="career-github" 
                      type="url" 
                      value={formData.github} 
                      onChange={e => handleInputChange("github", e.target.value)} 
                      placeholder="https://github.com/yourusername" 
                      className="border-2 focus:border-brand-orange" 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="career-cv" className="text-brand-navy font-medium">Upload CV/Resume</Label>
                  <div className="mt-2">
                    <label 
                      htmlFor="career-cv" 
                      className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-orange transition-colors"
                    >
                      <div className="text-center">
                        {cvFile ? (
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="h-8 w-8 text-brand-orange" />
                            <div>
                              <p className="text-sm font-medium text-brand-navy">{cvFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload your CV/Resume</p>
                            <p className="text-xs text-muted-foreground">PDF or Word format, max 5MB</p>
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      id="career-cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="career-message" className="text-brand-navy font-medium">Cover Letter / Message *</Label>
                  <Textarea 
                    id="career-message" 
                    value={formData.message} 
                    onChange={e => handleInputChange("message", e.target.value)} 
                    placeholder="Tell us why you're interested in this position and what you can bring to our team..." 
                    rows={6} 
                    className="border-2 focus:border-brand-orange" 
                    required 
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  We review all applications carefully and will get back to you within 5 business days.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CareersForm;