import nodemailer from 'nodemailer';
import { retry, retryableChecks } from './Retry';

/**
 * Email utility for Dean's Shipping Ltd
 * Uses connection pooling and retry with exponential backoff.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

// ============================================
// SINGLETON TRANSPORT (connection pooling)
// ============================================

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const config: any = {
    pool: true,          // Enable connection pooling
    maxConnections: 5,   // Max simultaneous connections
    maxMessages: 100,    // Max messages per connection before reconnect
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    // Timeouts
    connectionTimeout: 10_000,  // 10s to establish connection
    greetingTimeout: 10_000,    // 10s for SMTP greeting
    socketTimeout: 30_000,      // 30s for socket inactivity
  };

  // Gmail-specific: use service shorthand
  if (host.includes('gmail.com')) {
    delete config.host;
    delete config.port;
    delete config.secure;
    config.service = 'gmail';
  }

  _transporter = nodemailer.createTransport(config);
  return _transporter;
}

// ============================================
// SEND EMAIL (with retry)
// ============================================

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const from = process.env.EMAIL_FROM || '"Dean\'s Shipping Ltd" <noreply@deansshipping.com>';
  const transporter = getTransporter();

  // Fallback for unconfigured SMTP
  if (!transporter) {
    console.warn('SMTP is not configured. Email to', to, 'will not be sent.');
    console.log('Subject:', subject);

    if (process.env.NODE_ENV === 'development') {
      const payUrlMatch = html.match(/href="([^"]+paynow[^"]+)"/);
      if (payUrlMatch) {
        console.log('--- DEVELOPMENT PREVIEW ---');
        console.log('Payment Link:', payUrlMatch[1]);
        console.log('---------------------------');
      }
    }
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    const info = await retry(
      () => transporter.sendMail({ from, to, subject, html }),
      {
        maxAttempts: 3,
        initialDelayMs: 1_000,
        isRetryable: retryableChecks.email,
        onRetry: (attempt, err) => {
          console.warn(`[Email] Retry #${attempt} for ${to}:`, (err as Error).message);
        },
      }
    );

    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email after retries:', error);
    return { success: false, error };
  }
}