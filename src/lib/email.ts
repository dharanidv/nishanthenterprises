// Email utility for sending quote requests via Python backend
// Make sure the Python email server is running on localhost:5000

export interface QuoteFormData {
  name: string;
  email: string;
  mobile: string;
  message: string;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  limit_info?: {
    max_requests: number;
    window_minutes: number;
    retry_after: number;
  };
}

// Send email using Python backend server
export const sendQuoteEmail = async (formData: QuoteFormData): Promise<EmailResponse> => {
  try {
    const response = await fetch('http://localhost:5000/api/send-quote-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        return {
          success: false,
          error: 'rate_limit_exceeded',
          message: result.message || 'Rate limit exceeded. Please try again later.',
          limit_info: result.limit_info
        };
      }
      
      // Handle other errors
      return {
        success: false,
        error: 'request_failed',
        message: result.message || `Request failed with status ${response.status}`
      };
    }

    return {
      success: true,
      message: result.message || 'Emails sent successfully'
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: 'network_error',
      message: 'Network error. Please check your connection and try again.'
    };
  }
};

// Fallback mock implementation (for development/testing)
export const sendQuoteEmailMock = async (formData: QuoteFormData): Promise<EmailResponse> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log the email details (in real implementation, this would send actual emails)
    console.log('📧 Email to Owner:', {
      to: 'owner@Nisanth T-shirts.com',
      subject: `New Quote Request from ${formData.name}`,
      from: formData.email,
      content: {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        message: formData.message
      }
    });

    console.log('📧 Confirmation Email to User:', {
      to: formData.email,
      subject: 'Quote Request Received - Nisanth T-shirts T-Shirts',
      content: `Thank you for your quote request. We have received your inquiry and will get back to you within 2-4 business hours.`
    });

    // Simulate successful email sending
    return {
      success: true,
      message: 'Mock email sent successfully'
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: 'mock_error',
      message: 'Mock email sending failed'
    };
  }
};

// Alternative: Simple fetch-based email sending (if you have a different backend API)
export const sendQuoteEmailViaAPI = async (formData: QuoteFormData): Promise<EmailResponse> => {
  try {
    const response = await fetch('/api/send-quote-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: 'api_error',
        message: result.message || 'API request failed'
      };
    }

    return {
      success: true,
      message: result.message || 'Email sent successfully'
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: 'network_error',
      message: 'Network error. Please check your connection and try again.'
    };
  }
};