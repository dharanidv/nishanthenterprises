#!/usr/bin/env python3
"""
Slick T-Shirts Email Server
Backend server for handling quote request emails using Gmail SMTP
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Rate limiting configuration from environment variables
RATE_LIMIT_MAX_REQUESTS = int(os.getenv('RATE_LIMIT_MAX_REQUESTS', 5))
RATE_LIMIT_WINDOW_MINUTES = int(os.getenv('RATE_LIMIT_WINDOW_MINUTES', 2))

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[f"{RATE_LIMIT_MAX_REQUESTS} per {RATE_LIMIT_WINDOW_MINUTES} minutes"]
)

# Email configuration from environment variables
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv('GMAIL_EMAIL')
SENDER_PASSWORD = os.getenv('GMAIL_APP_PASSWORD')
OWNER_EMAIL = os.getenv('OWNER_EMAIL', 'vdharani40@gmail.com')
COMPANY_NAME = os.getenv('COMPANY_NAME', 'Nisanth T-Shirts')
WEBSITE_URL = os.getenv('WEBSITE_URL', 'https://example.com')

def load_email_template(template_name):
    """Load HTML email template from file"""
    try:
        template_path = os.path.join(os.path.dirname(__file__), 'templates', template_name)
        with open(template_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        logger.error(f"Template file not found: {template_name}")
        return None
    except Exception as e:
        logger.error(f"Error loading template {template_name}: {str(e)}")
        return None

def create_customer_email_template(name, email, mobile, message):
    """Create HTML email template for customer confirmation"""
    template = load_email_template('customer_email.html')
    if not template:
        return None
    
    # Replace template variables
    template = template.replace('{{name}}', name)
    template = template.replace('{{email}}', email)
    template = template.replace('{{mobile}}', mobile)
    template = template.replace('{{message}}', message)
    template = template.replace('{{company_name}}', COMPANY_NAME)
    template = template.replace('{{website_url}}', WEBSITE_URL)
    
    return template

def create_owner_email_template(name, email, mobile, message):
    """Create HTML email template for owner notification"""
    template = load_email_template('owner_email.html')
    if not template:
        return None
    
    # Replace template variables
    template = template.replace('{{name}}', name)
    template = template.replace('{{email}}', email)
    template = template.replace('{{mobile}}', mobile)
    template = template.replace('{{message}}', message)
    template = template.replace('{{request_date}}', datetime.now().strftime('%B %d, %Y at %I:%M %p'))
    template = template.replace('{{owner_email}}', OWNER_EMAIL)
    template = template.replace('{{company_name}}', COMPANY_NAME)
    template = template.replace('{{website_url}}', WEBSITE_URL)
    
    return template

def send_email(to_email, subject, html_content):
    """Send email using Gmail SMTP"""
    try:
        # Validate credentials
        if not SENDER_EMAIL or not SENDER_PASSWORD:
            logger.error("Gmail credentials not configured")
            return False
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Connect to SMTP server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        # Send email
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, to_email, text)
        server.quit()
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

@app.route('/api/send-quote-email', methods=['POST'])
@limiter.limit(f"{RATE_LIMIT_MAX_REQUESTS} per {RATE_LIMIT_WINDOW_MINUTES} minutes")
def send_quote_email():
    """API endpoint to handle quote request emails"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'mobile', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        name = data['name']
        email = data['email']
        mobile = data['mobile']
        message = data['message']
        
        # Create email templates
        customer_html = create_customer_email_template(name, email, mobile, message)
        owner_html = create_owner_email_template(name, email, mobile, message)
        
        if not customer_html or not owner_html:
            return jsonify({
                'success': False,
                'message': 'Failed to load email templates'
            }), 500
        
        # Send emails
        customer_sent = send_email(
            email,
            'Quote Request Confirmation - Slick T-Shirts',
            customer_html
        )
        
        owner_sent = send_email(
            OWNER_EMAIL,
            f'New Quote Request from {name}',
            owner_html
        )
        
        if customer_sent and owner_sent:
            return jsonify({
                'success': True,
                'message': 'Emails sent successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to send one or more emails'
            }), 500
            
    except Exception as e:
        logger.error(f"Error processing quote request: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded errors"""
    return jsonify({
        'success': False,
        'error': 'rate_limit_exceeded',
        'message': f'Rate limit exceeded. Please try again after {RATE_LIMIT_WINDOW_MINUTES} minutes.',
        'limit_info': {
            'max_requests': RATE_LIMIT_MAX_REQUESTS,
            'window_minutes': RATE_LIMIT_WINDOW_MINUTES,
            'retry_after': RATE_LIMIT_WINDOW_MINUTES * 60  # seconds
        }
    }), 429

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'service': 'Slick Email Server',
        'version': '1.0.0',
        'rate_limiting': {
            'max_requests': RATE_LIMIT_MAX_REQUESTS,
            'window_minutes': RATE_LIMIT_WINDOW_MINUTES
        },
        'templates_loaded': {
            'customer': load_email_template('customer_email.html') is not None,
            'owner': load_email_template('owner_email.html') is not None
        }
    }), 200

@app.route('/test-email', methods=['GET'])
def test_email():
    """Test endpoint to preview email templates"""
    try:
        test_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'mobile': '+1234567890',
            'message': 'This is a test message for the email template.'
        }
        
        customer_html = create_customer_email_template(**test_data)
        owner_html = create_owner_email_template(**test_data)
        
        return jsonify({
            'customer_template': customer_html,
            'owner_template': owner_html
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Check if required environment variables are set
    if not SENDER_EMAIL or SENDER_EMAIL == 'your-email@gmail.com':
        print("⚠️  Warning: Please set GMAIL_EMAIL in .env file")
        print("   Example: GMAIL_EMAIL=your-email@gmail.com")
    
    if not SENDER_PASSWORD or SENDER_PASSWORD == 'your-16-character-app-password':
        print("⚠️  Warning: Please set GMAIL_APP_PASSWORD in .env file")
        print("   Example: GMAIL_APP_PASSWORD=abcd efgh ijkl mnop")
    
    print("🚀 Starting Slick Email Server...")
    print(f"📧 Sender Email: {SENDER_EMAIL}")
    print(f"👤 Owner Email: {OWNER_EMAIL}")
    print(f"🏢 Company: {COMPANY_NAME}")
    print(f"⏱️  Rate Limit: {RATE_LIMIT_MAX_REQUESTS} requests per {RATE_LIMIT_WINDOW_MINUTES} minutes")
    print("🌐 Server running on http://localhost:5000")
    
    # Get port and host from environment
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    app.run(host=host, port=port, debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true') 