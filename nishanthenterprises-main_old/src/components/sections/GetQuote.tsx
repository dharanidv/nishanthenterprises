import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendQuoteEmail, QuoteFormData, EmailResponse } from '@/lib/email';

const GetQuote = () => {
  const [formData, setFormData] = useState<QuoteFormData>({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'rate_limit'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    max_requests: number;
    window_minutes: number;
    retry_after: number;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setRateLimitInfo(null);

    try {
      const response: EmailResponse = await sendQuoteEmail(formData);
      
      if (response.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', mobile: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        // Handle rate limiting specifically
        if (response.error === 'rate_limit_exceeded') {
          setSubmitStatus('rate_limit');
          setErrorMessage(response.message || 'Rate limit exceeded');
          setRateLimitInfo(response.limit_info || null);
        } else {
          setSubmitStatus('error');
          setErrorMessage(response.message || 'Something went wrong');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="w-8 h-px bg-gray-400 mr-4"></div>
              <h2 className="text-2xl font-bold text-black">Get a Quote</h2>
              <div className="w-8 h-px bg-gray-400 ml-4"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Ready to start your custom t-shirt project? Fill out the form below and we'll get back to you with a personalized quote.
            </p>
          </div>

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Quote Request Sent Successfully!</h3>
                  <p className="text-green-700 text-sm">
                    Thank you for your inquiry. We've sent a confirmation email to {formData.email} and will get back to you within 2-4 business hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rate Limit Error Message */}
          {submitStatus === 'rate_limit' && (
            <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs">⏱️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 mb-2">Rate Limit Exceeded</h3>
                  <p className="text-orange-700 text-sm mb-3">
                    {errorMessage}
                  </p>
                  {rateLimitInfo && (
                    <div className="bg-orange-100 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-800 font-medium">Limit Details:</span>
                        <span className="text-orange-700">
                          {rateLimitInfo.max_requests} requests per {rateLimitInfo.window_minutes} minutes
                        </span>
                      </div>
                      <div className="text-orange-700">
                        <span className="font-medium">Please wait:</span> {rateLimitInfo.window_minutes} minutes before trying again
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {submitStatus === 'error' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✕</span>
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Something went wrong</h3>
                  <p className="text-red-700 text-sm">
                    {errorMessage || 'We couldn\'t send your quote request. Please try again or contact us directly.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quote Form */}
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:opacity-50"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:opacity-50"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-black mb-2">
                  Mobile Number *
                </label>
                <Input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:opacity-50"
                  placeholder="Enter your mobile number"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                  Project Details *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none disabled:opacity-50"
                  placeholder="Tell us about your project requirements, quantity, design preferences, timeline, etc."
                />
              </div>

              {/* Submit Button */}
              <div className="text-center pt-4">
                <Button 
                  type="submit" 
                  disabled={true}
                  className="bg-gray-400 text-white px-8 py-4 rounded-lg transition-colors font-semibold text-lg min-w-[200px] opacity-50 cursor-not-allowed"
                >
                  Submit Quote Request
                </Button>
              </div>

              {/* Form Footer */}
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>By submitting this form, you agree to our privacy policy and terms of service.</p>
                <p className="mt-2">We typically respond within 2-4 business hours.</p>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Quick Response</h3>
              <p className="text-gray-600 text-sm">Get a quote within 2-4 hours</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">✓</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Free Consultation</h3>
              <p className="text-gray-600 text-sm">No cost for design consultation</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">★</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm">Premium quality t-shirts guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetQuote; 