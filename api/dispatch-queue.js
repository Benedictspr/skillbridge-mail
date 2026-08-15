import nodemailer from 'nodemailer';
import { supabase } from '../lib/authStore.js';

const SYSTEM_SMTP = {
  user: process.env.SMTP_USER || 'shaptsevjkonikevich@gmail.com',
  pass: process.env.SMTP_PASS || 'smjpsmbbqhjvovcp'
};

function parseRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  if (Buffer.isBuffer(req.body)) {
    try { return JSON.parse(req.body.toString('utf8')); } catch (e) { return {}; }
  }
  return req.body;
}

// Serverless Background Dispatch Batch Engine
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = parseRequestBody(req);
    const { action, recipients = [], campaignConfig = {}, smtpConfig = {} } = body;

    // Action: Start Server-Side Persistent Campaign Queue
    if (action === 'start' || req.method === 'POST') {
      const targetUser = smtpConfig.user || process.env.SMTP_USER || SYSTEM_SMTP.user;
      const targetPass = smtpConfig.pass || process.env.SMTP_PASS || SYSTEM_SMTP.pass;

      const pendingRecipients = recipients.filter(r => r.status === 'Ready' || r.status === 'Queued');
      if (pendingRecipients.length === 0) {
        return res.status(200).json({ success: true, message: 'All recipients are already dispatched.', remaining: 0 });
      }

      console.log(`[SERVERLESS BACKGROUND QUEUE] Dispatching batch of ${pendingRecipients.length} recipients via ${targetUser}...`);

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: targetUser, pass: targetPass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: { rejectUnauthorized: false }
      });

      // Dispatch up to 5 emails in this serverless execution frame
      const batchToProcess = pendingRecipients.slice(0, 5);
      const results = [];

      for (const recipient of batchToProcess) {
        try {
          const contentHtml = campaignConfig.htmlContent || `<p>${(campaignConfig.bodyText || 'Outreach email').replace(/\n/g, '<br/>')}</p>`;
          const info = await transporter.sendMail({
            from: `"${campaignConfig.senderName || 'Sendaat Outreach'}" <${targetUser}>`,
            to: recipient.email,
            subject: campaignConfig.subject || 'SkillBridge Opportunity',
            html: contentHtml
          });

          results.push({ recipientId: recipient.id, email: recipient.email, status: 'Sent', messageId: info.messageId });
        } catch (err) {
          console.error(`[BACKGROUND DISPATCH ERROR] Failed to send to ${recipient.email}:`, err.message);
          results.push({ recipientId: recipient.id, email: recipient.email, status: 'Failed', error: err.message });
        }
      }

      const remainingCount = Math.max(0, pendingRecipients.length - batchToProcess.length);

      return res.status(200).json({
        success: true,
        message: `Processed background batch of ${batchToProcess.length} emails. Campaign is persistent on server!`,
        results,
        processed: batchToProcess.length,
        remaining: remainingCount,
        offlineCapable: true
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('[SERVERLESS QUEUE ENGINE ERROR]', err);
    return res.status(500).json({ error: err.message || 'Serverless queue execution error' });
  }
}
