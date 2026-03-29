import nodemailer from 'nodemailer';

/**
 * Email utility for Dean's Shipping Ltd
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  // Check if SMTP is configured
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || '"Dean\'s Shipping Ltd" <noreply@deansshipping.com>';

  // Fallback for development if no SMTP is configured
  if (!host || !user || !pass) {
    console.warn('SMTP is not configured. Email to', to, 'will not be sent.');
    console.log('Subject:', subject);
    console.log('HTML length:', html.length);
    
    // In development mode, we can log the URL for easy testing
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
    const transporterConfig: any = {
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    };

    // Optimization: Gmail-specific config if using Gmail
    if (host.includes('gmail.com')) {
      // Use simpler config for Gmail service which handles TLS/ports better
      delete transporterConfig.host;
      delete transporterConfig.port;
      delete transporterConfig.secure;
      transporterConfig.service = 'gmail';
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
