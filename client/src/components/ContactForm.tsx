import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { CheckCircle, AlertCircle, Send } from 'lucide-react';
// Using type-only import for the form input
import type { CreateContactFormInput } from '../../../server/src/schema';

export function ContactForm() {
  const [formData, setFormData] = useState<CreateContactFormInput>({
    name: '',
    email: '',
    subject: null,
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      await trpc.createContactForm.mutate(formData);
      
      // Reset form on successful submission
      setFormData({
        name: '',
        email: '',
        subject: null,
        message: ''
      });
      
      setSubmitStatus('success');
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Thank you for your message! I'll get back to you as soon as possible.
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === 'error' && (
          <Alert className="mb-6 border-red-200 bg-red-50" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage || 'Something went wrong. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateContactFormInput) => ({ 
                  ...prev, 
                  name: e.target.value 
                }))
              }
              placeholder="Your full name"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateContactFormInput) => ({ 
                  ...prev, 
                  email: e.target.value 
                }))
              }
              placeholder="your.email@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Subject Field */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <Input
              id="subject"
              type="text"
              value={formData.subject || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateContactFormInput) => ({ 
                  ...prev, 
                  subject: e.target.value || null 
                }))
              }
              placeholder="What's this about? (optional)"
              disabled={isSubmitting}
            />
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreateContactFormInput) => ({ 
                  ...prev, 
                  message: e.target.value 
                }))
              }
              placeholder="Tell me about your project, opportunity, or just say hello..."
              rows={5}
              required
              disabled={isSubmitting}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>

          {/* Required Fields Note */}
          <p className="text-xs text-gray-500 text-center">
            * Required fields
          </p>
        </form>
      </CardContent>
    </Card>
  );
}