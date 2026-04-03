import { useState } from 'react';
import { ArrowRight, Star, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendQuoteEmail, QuoteFormData, EmailResponse } from '@/lib/email';

const ContactCTA = () => {
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
    <section id="get-quote-section" className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Wave Background Graphics */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Wave 1 - Full Section */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-transparent transform -skew-y-3"></div>
        
        {/* Wave 2 - Full Section */}
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/6 to-transparent transform skew-y-2"></div>
        
        {/* Wave 3 - Full Section */}
        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent transform -skew-y-4"></div>
        
        {/* Wave 4 - Full Section */}
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/4 to-transparent transform skew-y-1"></div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse-delayed"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl animate-bounce"></div>

      {/* Animated Wave Shapes - Full Section Coverage */}
      <div className="absolute inset-0 w-full h-full">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".15" className="fill-blue-500/15"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".1" className="fill-purple-500/12"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-green-500/8"></path>
        </svg>
      </div>

      {/* Additional Full Section Wave */}
      <div className="absolute inset-0 w-full h-full">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="none" className="w-full h-full">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-blue-500/10"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-blue-400 mr-4"></div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">Get a Quote</h2>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-blue-400 ml-4"></div>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Ready to start your custom t-shirt project? Fill out the form below and we'll get back to you with a personalized quote.
            </p>
          </div>

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-4 bg-green-900/20 border border-green-400/30 rounded-lg backdrop-blur-sm">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-400">Quote Request Sent Successfully!</h3>
                  <p className="text-green-300 text-sm">
                    Thank you for your inquiry. We've sent a confirmation email to {formData.email} and will get back to you within 2-4 business hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rate Limit Error Message */}
          {submitStatus === 'rate_limit' && (
            <div className="mb-8 p-4 bg-orange-900/20 border border-orange-400/30 rounded-lg backdrop-blur-sm">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs">⏱️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-400 mb-2">Rate Limit Exceeded</h3>
                  <p className="text-orange-300 text-sm mb-3">
                    {errorMessage}
                  </p>
                  {rateLimitInfo && (
                    <div className="bg-orange-900/30 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-300 font-medium">Limit Details:</span>
                        <span className="text-orange-300">
                          {rateLimitInfo.max_requests} requests per {rateLimitInfo.window_minutes} minutes
                        </span>
                      </div>
                      <div className="text-orange-300">
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
            <div className="mb-8 p-4 bg-red-900/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✕</span>
          </div>
                <div>
                  <h3 className="font-semibold text-red-400">Something went wrong</h3>
                  <p className="text-red-300 text-sm">
                    {errorMessage || 'We couldn\'t send your quote request. Please try again or contact us directly.'}
              </p>
            </div>
              </div>
            </div>
          )}

          {/* Enhanced Quote Form with Curves and Highlights */}
          <div className="relative">
            {/* Form Background with Curves */}
            <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-sm rounded-3xl border border-white/30 p-8 md:p-12 relative overflow-hidden shadow-2xl">
              {/* Form Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>

              {/* Highlighting Curves */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-2xl"></div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-white/20 border-2 border-white/40 rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 disabled:opacity-50 text-white placeholder-white/70 group-hover:border-blue-400/50"
                        placeholder="Enter your full name"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                  <div className="relative group">
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-white/20 border-2 border-white/40 rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 disabled:opacity-50 text-white placeholder-white/70 group-hover:border-blue-400/50"
                        placeholder="Enter your email address"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="relative group">
                  <label htmlFor="mobile" className="block text-sm font-medium text-white mb-2">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      required
                      value={formData.mobile}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-white/20 border-2 border-white/40 rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 disabled:opacity-50 text-white placeholder-white/70 group-hover:border-blue-400/50"
                      placeholder="Enter your mobile number"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Message */}
                <div className="relative group">
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Project Details *
                  </label>
                  <div className="relative">
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-white/20 border-2 border-white/40 rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 resize-none disabled:opacity-50 text-white placeholder-white/70 group-hover:border-blue-400/50"
                      placeholder="Tell us about your project requirements, quantity, design preferences, timeline, etc."
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
            
                {/* Submit Button */}
                <div className="text-center pt-4">
                  <Button 
                    type="submit" 
                    disabled={true}
                    className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg min-w-[200px] opacity-50 cursor-not-allowed shadow-lg"
                  >
                    Submit Quote Request 
              </Button>
            </div>
            
                {/* Form Footer */}
                <div className="text-center text-sm text-gray-400 mt-4">
                  <p>By submitting this form, you agree to our privacy policy and terms of service.</p>
                  <p className="mt-2">We typically respond within 2-4 business hours.</p>
                </div>
              </form>
            </div>
              </div>

          {/* Simple Info Text */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-gray-300 text-sm">
              <span className="text-blue-400 font-medium">Quick Response:</span> Get a quote within 2-4 hours
            </p>
            <p className="text-gray-300 text-sm">
              <span className="text-green-400 font-medium">Free Consultation:</span> No cost for design consultation
            </p>
            <p className="text-gray-300 text-sm">
              <span className="text-purple-400 font-medium">Quality Guarantee:</span> Premium quality t-shirts guaranteed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;