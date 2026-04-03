# Email Setup Guide for GetQuote Form

## Current Implementation
The GetQuote form currently uses a mock email service that logs email details to the console. To implement actual email sending, you have several options:

## Option 1: EmailJS (Recommended for Frontend)
EmailJS allows you to send emails directly from the frontend without a backend server.

### Setup Steps:
1. **Sign up for EmailJS** at https://www.emailjs.com/
2. **Create an Email Service** (Gmail, Outlook, etc.)
3. **Create Email Templates** for:
   - Owner notification email
   - User confirmation email
4. **Install EmailJS package:**
   ```bash
   npm install @emailjs/browser
   ```
5. **Update environment variables:**
   ```env
   REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id
   REACT_APP_EMAILJS_TEMPLATE_ID_OWNER=your_owner_template_id
   REACT_APP_EMAILJS_TEMPLATE_ID_USER=your_user_template_id
   REACT_APP_OWNER_EMAIL=owner@Nisanth T-shirts.com
   ```
6. **Replace the mock implementation** in `src/lib/email.ts` with the EmailJS code.

## Option 2: Backend API
Create a backend API endpoint to handle email sending.

### Setup Steps:
1. **Create a backend server** (Node.js/Express, Python/Flask, etc.)
2. **Set up email service** (Nodemailer, SendGrid, etc.)
3. **Create API endpoint** `/api/send-quote-email`
4. **Update the frontend** to use `sendQuoteEmailViaAPI` function

## Option 3: Form Services
Use form services like Formspree, Netlify Forms, or similar.

### Setup Steps:
1. **Sign up for a form service**
2. **Update the form action** to point to the service URL
3. **Configure email templates** in the service dashboard

## Email Templates

### Owner Notification Email:
```
Subject: New Quote Request from [Name]

Name: [Name]
Email: [Email]
Mobile: [Mobile]
Message: [Message]

Please respond within 2-4 business hours.
```

### User Confirmation Email:
```
Subject: Quote Request Received - Nisanth T-shirts T-Shirts

Dear [Name],

Thank you for your quote request. We have received your inquiry and will get back to you within 2-4 business hours.

Your request details:
Name: [Name]
Email: [Email]
Mobile: [Mobile]
Message: [Message]

Best regards,
The Nisanth T-shirts Team
```

## Current Mock Implementation
The current implementation logs email details to the browser console. You can see these logs in the browser's developer tools when you submit the form.

## Testing
1. Fill out the GetQuote form
2. Submit the form
3. Check the browser console for email logs
4. Verify success/error messages appear on the page

## Next Steps
Choose one of the email service options above and replace the mock implementation in `src/lib/email.ts` with the actual email sending code. 