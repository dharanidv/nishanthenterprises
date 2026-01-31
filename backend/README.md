# Slick Email Server Backend

## Overview
This is the backend server for the Slick T-Shirts email functionality. It handles quote request emails using Gmail SMTP with professional HTML templates and includes rate limiting to prevent abuse.

## Project Structure
```
backend/
├── email_server.py          # Main Flask server
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (credentials)
├── README.md               # This file
└── templates/              # HTML email templates
    ├── customer_email.html  # Customer confirmation template
    └── owner_email.html     # Owner notification template
```

## Features
- ✅ Gmail SMTP integration
- ✅ Separate HTML email templates
- ✅ Environment variable configuration
- ✅ Professional email design
- ✅ Mobile-responsive templates
- ✅ CORS support for frontend
- ✅ Error handling and logging
- ✅ Health check endpoint
- ✅ Template testing endpoint
- ✅ **Rate limiting protection**
- ✅ **IP-based request tracking**

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Edit the `.env` file with your credentials:

```env
# Gmail SMTP Configuration
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Business Configuration
OWNER_EMAIL=owner@slick.com
COMPANY_NAME=Slick T-Shirts
WEBSITE_URL=https://slick.com

# Rate Limiting Configuration
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MINUTES=2

# Server Configuration
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
HOST=0.0.0.0
```

### 3. Gmail Setup
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account → Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and your device
   - Copy the 16-character password

### 4. Run the Server
```bash
python email_server.py
```

The server will start on `http://localhost:5000`

## Rate Limiting

### Configuration
The server includes rate limiting to prevent abuse:

- **Default Limit**: 5 requests per 2 minutes per IP address
- **Configurable**: Set via environment variables in `.env` file
- **IP-based**: Tracks requests by client IP address

### Environment Variables
```env
RATE_LIMIT_MAX_REQUESTS=5      # Maximum requests allowed
RATE_LIMIT_WINDOW_MINUTES=2    # Time window in minutes
```

### Rate Limit Response
When rate limit is exceeded, the server returns:

```json
{
  "success": false,
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Please try again after 2 minutes.",
  "limit_info": {
    "max_requests": 5,
    "window_minutes": 2,
    "retry_after": 120
  }
}
```

### Frontend Integration
The frontend automatically handles rate limit errors and displays user-friendly messages with retry information.

## API Endpoints

### POST /api/send-quote-email
Sends quote request emails to both customer and owner.

**Rate Limited**: Yes (5 requests per 2 minutes per IP)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "message": "I need 100 custom t-shirts for my company event."
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Emails sent successfully"
}
```

**Rate Limit Response (429):**
```json
{
  "success": false,
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Please try again after 2 minutes.",
  "limit_info": {
    "max_requests": 5,
    "window_minutes": 2,
    "retry_after": 120
  }
}
```

### GET /health
Health check endpoint with template status and rate limiting info.

**Response:**
```json
{
  "status": "healthy",
  "service": "Slick Email Server",
  "version": "1.0.0",
  "rate_limiting": {
    "max_requests": 5,
    "window_minutes": 2
  },
  "templates_loaded": {
    "customer": true,
    "owner": true
  }
}
```

### GET /test-email
Test endpoint to preview email templates with sample data.

## Email Templates

### Customer Email Template (`templates/customer_email.html`)
- Professional confirmation email
- Black and white theme with blue accents
- Customer details and company stats
- Mobile-responsive design

### Owner Email Template (`templates/owner_email.html`)
- Alert-style notification email
- Red header for urgency
- Complete customer information
- Quick response template
- Action buttons

## Template Variables

Both templates support these variables:
- `{{name}}` - Customer name
- `{{email}}` - Customer email
- `{{mobile}}` - Customer mobile number
- `{{message}}` - Customer message
- `{{company_name}}` - Company name (from .env)
- `{{website_url}}` - Website URL (from .env)

Additional variables for owner template:
- `{{request_date}}` - Formatted request date/time
- `{{owner_email}}` - Owner email address

## Security Notes

1. **Never commit `.env` file** to version control
2. **Use App Passwords** instead of regular Gmail password
3. **Enable 2-Factor Authentication** on Google account
4. **Use HTTPS** in production
5. **Rate limiting** prevents abuse and spam
6. **IP-based tracking** for request monitoring

## Development

### Testing Templates
Visit `http://localhost:5000/test-email` to preview email templates.

### Testing Rate Limiting
1. Send 5 requests quickly to trigger rate limit
2. Check response for rate limit error
3. Wait 2 minutes and try again

### Logs
The server logs all operations. Check console output for:
- Email sending success/failure
- Template loading status
- API request details
- Rate limiting events
- Error messages

### Customization

#### Email Templates
Edit the HTML files in `templates/` folder:
- `customer_email.html` - Customer confirmation
- `owner_email.html` - Owner notification

#### Rate Limiting
Adjust limits in `.env` file:
- `RATE_LIMIT_MAX_REQUESTS` - Number of allowed requests
- `RATE_LIMIT_WINDOW_MINUTES` - Time window for limits

#### Styling
Templates use inline CSS for maximum email client compatibility.

#### Branding
Update variables in `.env` file:
- `COMPANY_NAME` - Your company name
- `WEBSITE_URL` - Your website URL
- `OWNER_EMAIL` - Owner notification email

## Production Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 email_server:app
```

### Using Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "email_server.py"]
```

## Troubleshooting

### Common Issues

1. **Template Not Found**
   - Check if template files exist in `templates/` folder
   - Verify file permissions

2. **Authentication Error**
   - Ensure 2-Factor Authentication is enabled
   - Use App Password, not regular password
   - Check email and password in `.env` file

3. **Email Not Sending**
   - Check Gmail SMTP settings
   - Verify App Password is correct
   - Check server logs for errors

4. **Rate Limit Errors**
   - Check current rate limit configuration
   - Verify IP address tracking
   - Wait for rate limit window to reset

5. **CORS Error**
   - Server includes CORS headers
   - Ensure frontend URL is allowed

## Support

For issues or questions:
1. Check the server logs
2. Verify Gmail SMTP configuration
3. Test templates with `/test-email` endpoint
4. Check rate limiting configuration
5. Ensure all environment variables are set correctly 