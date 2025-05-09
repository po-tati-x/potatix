import { Resend } from 'resend';

// Define common email types for better type safety
export type EmailType = 'sign-in' | 'email-verification' | 'password-reset' | 'account-locked';

// Fixed mapping between email types and template names
const EMAIL_TYPE_TO_TEMPLATE: Record<EmailType, string> = {
  'sign-in': 'sign-in-otp',
  'email-verification': 'verify-email',
  'password-reset': 'reset-password',
  'account-locked': 'account-locked'
};

// Fixed mapping between email types and subject lines
const EMAIL_TYPE_TO_SUBJECT: Record<EmailType, string> = {
  'sign-in': 'Sign in to Potatix',
  'email-verification': 'Verify your Potatix account',
  'password-reset': 'Reset your Potatix password',
  'account-locked': 'Security Alert: Account Temporarily Locked'
};

// Base email interface
interface BaseEmailParams {
  to: string;
  siteName?: string;
}

// OTP email interface
interface OTPEmailParams extends BaseEmailParams {
  emailType: Exclude<EmailType, 'account-locked'>;
  otp: string;
  expiresIn?: string;
}

// Account locked email interface
interface AccountLockedEmailParams extends BaseEmailParams {
  emailType: 'account-locked';
  lockDuration: string;
}

// Legacy interface for backward compatibility
interface SendEmailParams {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
}

// Use a getter for the Resend client to defer initialization
// This prevents errors when the app is just initializing
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  
  // In development, we can use a mock client
  if (process.env.NODE_ENV === 'development' && !apiKey) {
    console.warn('No RESEND_API_KEY found, using mock email client in development');
    return {
      emails: {
        send: async (params: any) => ({ 
          data: { id: 'mock-email-id' }, 
          error: null 
        })
      }
    };
  }
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured in environment variables');
  }
  
  return new Resend(apiKey);
};

/**
 * Send an OTP verification email with proper template
 */
export async function sendOTPEmail({
  to,
  emailType,
  otp,
  siteName = 'Potatix',
  expiresIn = '5 minutes'
}: OTPEmailParams): Promise<void> {
  // Get the correct template and subject for this email type
  const template = EMAIL_TYPE_TO_TEMPLATE[emailType];
  const subject = EMAIL_TYPE_TO_SUBJECT[emailType];
  
  // Log OTP in development for testing
  if (process.env.NODE_ENV === 'development') {
    console.log('\n==== DEV MODE: VERIFICATION CODE ====');
    console.log(`Email: ${to}`);
    console.log(`Type: ${emailType}`);
    console.log(`OTP: ${otp}`);
    console.log('=====================================\n');
  }
  
  return sendEmail({
    to,
    subject,
    template,
    variables: {
      otp,
      email: to,
      siteName,
      expiresIn
    }
  });
}

/**
 * Send an account locked notification email
 */
export async function sendAccountLockedEmail({
  to,
  emailType,
  lockDuration,
  siteName = 'Potatix'
}: AccountLockedEmailParams): Promise<void> {
  return sendEmail({
    to,
    subject: EMAIL_TYPE_TO_SUBJECT[emailType],
    template: EMAIL_TYPE_TO_TEMPLATE[emailType],
    variables: {
      email: to,
      siteName,
      lockDuration
    }
  });
}

/**
 * Send an email using the appropriate template
 * @deprecated Use the specialized email functions instead
 */
export async function sendEmail({ to, subject, template, variables }: SendEmailParams): Promise<void> {
  // Log emails in development mode to debug
  if (process.env.NODE_ENV === 'development') {
    console.log('==== DEV MODE: EMAIL ====');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Template: ${template}`);
    console.log('Variables:', variables);
    console.log('API Key present:', !!process.env.RESEND_API_KEY);
    console.log('=========================');
    
    // In development without API key, just log and return
    if (!process.env.RESEND_API_KEY) {
      console.log('Email would have been sent with HTML:', getEmailTemplate(template, variables));
      return;
    }
  }

  // Get HTML template
  const html = getEmailTemplate(template, variables);
  
  try {
    // Get the Resend client (will be initialized here)
    const resend = getResendClient();
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Potatix <noreply@mail.potatix.com>', // Improved sender format
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(error.message || 'Email delivery failed');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Email sent successfully:', data);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Email delivery failed');
  }
}

/**
 * Get the HTML content for a specific email template
 */
function getEmailTemplate(template: string, variables: Record<string, any>): string {
  const { otp, email, siteName = 'Potatix', lockDuration } = variables;
  
  // Email subject based on template type
  const subject = 
    template === 'sign-in-otp' ? 'Sign in to your account' :
    template === 'verify-email' ? 'Verify your email address' :
    template === 'reset-password' ? 'Reset your password' :
    template === 'account-locked' ? 'Account Security Alert' :
    'Your verification code';
  
  // Shared header and footer for consistent branding
  const baseStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #333; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { padding: 20px 0; text-align: center; border-bottom: 1px solid #f0f0f0; margin-bottom: 30px; }
    .logo { font-weight: 700; font-size: 24px; color: #06A28B; text-decoration: none; }
    .content { background: white; border-radius: 12px; padding: 30px; border: 1px solid #eaeaea; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .title { font-size: 20px; font-weight: 600; color: #111; margin-top: 0; margin-bottom: 24px; }
    .code-container { background-color: #f8f8f8; border-radius: 8px; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #06A28B; margin: 24px 0; font-family: monospace; }
    .code { user-select: all; }
    .footer { text-align: center; font-size: 13px; color: #777; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
    .text { font-size: 15px; margin-bottom: 20px; color: #444; }
    .note { font-size: 13px; color: #666; margin-top: 24px; font-style: italic; }
    .button { display: inline-block; padding: 12px 24px; background-color: #06A28B; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; margin-top: 16px; }
    .alert { background-color: #FFF4F4; border-left: 4px solid #D32F2F; padding: 16px; margin-bottom: 24px; }
  `;
  
  const header = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="logo">${siteName}</span>
        </div>
        <div class="content">
  `;
  
  const footer = `
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  let content = '';
  
  switch (template) {
    case 'sign-in-otp':
      content = `
        <h1 class="title">Sign in to your account</h1>
        <p class="text">Use the verification code below to sign in to your ${siteName} account.</p>
        <div class="code-container"><span class="code">${otp}</span></div>
        <p class="text">If you didn't request this code, you can safely ignore this email.</p>
        <p class="note">This code will expire in ${variables.expiresIn || '5 minutes'} and can only be used once.</p>
      `;
      break;
      
    case 'verify-email':
      content = `
        <h1 class="title">Verify your email address</h1>
        <p class="text">Thanks for signing up with ${siteName}. Use the verification code below to complete your registration.</p>
        <div class="code-container"><span class="code">${otp}</span></div>
        <p class="text">If you didn't create an account with us, you can safely ignore this email.</p>
        <p class="note">This code will expire in ${variables.expiresIn || '5 minutes'} and can only be used once.</p>
      `;
      break;
      
    case 'reset-password':
      content = `
        <h1 class="title">Reset your password</h1>
        <p class="text">We received a request to reset your password. Use the verification code below to continue with the password reset process.</p>
        <div class="code-container"><span class="code">${otp}</span></div>
        <p class="text">If you didn't request a password reset, you can safely ignore this email.</p>
        <p class="note">This code will expire in ${variables.expiresIn || '5 minutes'} and can only be used once.</p>
      `;
      break;

    case 'account-locked':
      content = `
        <h1 class="title">Account Security Alert</h1>
        <div class="alert">
          <p class="text">Your account has been temporarily locked due to multiple failed sign-in attempts.</p>
        </div>
        <p class="text">For your security, we've locked your account for ${lockDuration}.</p>
        <p class="text">If this wasn't you, please consider updating your password when you regain access.</p>
        <p class="note">If you need immediate assistance, please contact support.</p>
      `;
      break;
      
    default:
      content = `
        <h1 class="title">Your verification code</h1>
        <p class="text">Use the code below to complete your request.</p>
        <div class="code-container"><span class="code">${otp}</span></div>
        <p class="note">This code will expire in ${variables.expiresIn || '5 minutes'} and can only be used once.</p>
      `;
  }
  
  return header + content + footer;
} 