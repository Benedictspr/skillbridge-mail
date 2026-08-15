import nodemailer from 'nodemailer';

/**
 * Universal SMTP Transport Config Resolver
 * Resolves exact host, port, TLS, and auth settings for Gmail, Outlook, Yahoo, Zoho, & Custom SMTP.
 */
export function resolveSmtpTransportConfig({ provider, user, pass, host, port }) {
  const cleanUser = (user || '').trim();
  const cleanPass = (pass || '').trim().replace(/\s+/g, '');
  const provKey = (provider || '').toLowerCase();

  // Outlook / Office 365 / Hotmail / Live
  if (
    provKey === 'outlook' || 
    cleanUser.endsWith('@outlook.com') || 
    cleanUser.endsWith('@hotmail.com') || 
    cleanUser.endsWith('@live.com') ||
    cleanUser.endsWith('@office365.com')
  ) {
    return {
      host: host && provKey === 'custom' ? host.trim() : 'smtp.office365.com',
      port: 587,
      secure: false, // STARTTLS
      requireTLS: true,
      auth: { user: cleanUser, pass: cleanPass },
      tls: { ciphers: 'SSLv3', rejectUnauthorized: false }
    };
  }

  // Yahoo Mail
  if (provKey === 'yahoo' || cleanUser.endsWith('@yahoo.com') || cleanUser.endsWith('@myyahoo.com')) {
    return {
      host: host && provKey === 'custom' ? host.trim() : 'smtp.mail.yahoo.com',
      port: 465,
      secure: true,
      auth: { user: cleanUser, pass: cleanPass },
      tls: { rejectUnauthorized: false }
    };
  }

  // Zoho Mail
  if (provKey === 'zoho' || cleanUser.endsWith('@zoho.com')) {
    return {
      host: host && provKey === 'custom' ? host.trim() : 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: { user: cleanUser, pass: cleanPass },
      tls: { rejectUnauthorized: false }
    };
  }

  // Custom Host (SendGrid, Mailgun, AWS SES, Custom Domain)
  if (provKey === 'custom' && host) {
    const targetPort = Number(port) || 587;
    return {
      host: host.trim(),
      port: targetPort,
      secure: targetPort === 465,
      auth: { user: cleanUser, pass: cleanPass },
      tls: { rejectUnauthorized: false }
    };
  }

  // Default: Gmail / Google Workspace
  return {
    host: host && provKey === 'custom' ? host.trim() : 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: cleanUser, pass: cleanPass },
    tls: { rejectUnauthorized: false }
  };
}

export function createDynamicTransporter(smtpParams) {
  const config = resolveSmtpTransportConfig(smtpParams);
  return nodemailer.createTransport(config);
}
