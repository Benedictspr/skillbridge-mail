import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'server_db.json');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initial State structures
let recipientTracker = {};
let sentHistoryLog = [];
let receivedReplies = [
  {
    id: 'reply-101',
    senderEmail: 'john.doe@university.edu',
    senderName: 'John Doe',
    role: 'Mathematics Tutor',
    subject: 'Re: Remote Opportunity for Students',
    bodyText: "Hi Benedict,\n\nThank you for reaching out! I am a 3rd-year Mathematics student at University and very interested in the remote tutoring role. I have 2 years of teaching experience with high school algebra and calculus.\n\nPlease let me know the next steps for applying.\n\nBest regards,\nJohn Doe",
    receivedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isUnread: true
  },
  {
    id: 'reply-102',
    senderEmail: 'mary.smith@cambridge.org',
    senderName: 'Mary Smith',
    role: 'Python Developer',
    subject: 'Re: Remote Opportunity for Students',
    bodyText: "Hello Benedict,\n\nI saw your email regarding flexible student work opportunities. I specialize in Python, Django, and Data Science. I am available for 10-15 hours per week alongside my studies.\n\nLooking forward to hearing from you!\n\nMary Smith",
    receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isUnread: false
  }
];
let storedSmtpConfig = { user: '', pass: '', mode: 'sandbox' };

// Load database from file on startup
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data.recipientTracker) recipientTracker = data.recipientTracker;
      if (data.sentHistoryLog) sentHistoryLog = data.sentHistoryLog;
      if (data.receivedReplies) receivedReplies = data.receivedReplies;
      if (data.storedSmtpConfig) storedSmtpConfig = data.storedSmtpConfig;
      console.log(`[DB LOADED] Restored ${sentHistoryLog.length} sent logs and ${receivedReplies.length} replies.`);
    }
  } catch (err) {
    console.error('[DB LOAD ERROR]', err.message);
  }
}

// Save database to file
function saveDatabase() {
  try {
    const payload = {
      recipientTracker,
      sentHistoryLog,
      receivedReplies,
      storedSmtpConfig
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB SAVE ERROR]', err.message);
  }
}

loadDatabase();

// 1x1 Transparent GIF Pixel Buffer for Open Tracking
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

// 1. Send Email Endpoint (Gmail SMTP or Sandbox)
app.post('/api/send-email', async (req, res) => {
  try {
    const { recipientId, to, recipientName, subject, html, smtpUser, smtpPass, mode } = req.body;

    if (!to || !recipientId) {
      return res.status(400).json({ error: 'Missing required recipient parameters.' });
    }

    // Save SMTP credentials if provided
    if (smtpUser && smtpPass) {
      storedSmtpConfig = { user: smtpUser, pass: smtpPass, mode: mode || 'gmail' };
    }

    const trackingPixelUrl = `http://localhost:3001/api/track/open/${recipientId}`;
    const trackedHtml = `${html}<img src="${trackingPixelUrl}" width="1" height="1" style="display:none !important; width:1px; height:1px;" alt="" />`;
    const sentTimestamp = new Date().toISOString();

    if (mode === 'gmail' && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const mailOptions = {
        from: `SkillBridge Outreach <${smtpUser}>`,
        to: to,
        replyTo: smtpUser,
        subject: subject,
        html: trackedHtml
      };

      const info = await transporter.sendMail(mailOptions);

      recipientTracker[recipientId] = {
        status: 'Sent',
        sentAt: sentTimestamp,
        opened: false,
        messageId: info.messageId
      };

      const logItem = {
        id: `sent-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
        recipientId,
        to,
        recipientName: recipientName || to,
        subject,
        sentAt: sentTimestamp,
        status: 'Sent',
        mode: 'gmail',
        messageId: info.messageId
      };
      sentHistoryLog.unshift(logItem);
      saveDatabase();

      console.log(`[REAL GMAIL SENT] To: ${to} | MessageId: ${info.messageId}`);
      return res.json({ success: true, messageId: info.messageId, mode: 'gmail', logItem });

    } else {
      recipientTracker[recipientId] = {
        status: 'Sent',
        sentAt: sentTimestamp,
        opened: false,
        messageId: `sandbox-${Date.now()}`
      };

      const logItem = {
        id: `sent-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
        recipientId,
        to,
        recipientName: recipientName || to,
        subject,
        sentAt: sentTimestamp,
        status: 'Sent (Sandbox)',
        mode: 'sandbox',
        messageId: `sandbox-${Date.now()}`
      };
      sentHistoryLog.unshift(logItem);
      saveDatabase();

      console.log(`[SANDBOX SENT] To: ${to} (Simulated delivery)`);
      return res.json({ success: true, simulated: true, mode: 'sandbox', logItem });
    }

  } catch (err) {
    console.error('[SEND EMAIL ERROR]', err);
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

// 2. Tracking Pixel Endpoint for Email Open Detection
app.get('/api/track/open/:recipientId', (req, res) => {
  const { recipientId } = req.params;

  if (recipientTracker[recipientId]) {
    recipientTracker[recipientId].opened = true;
    recipientTracker[recipientId].openedAt = new Date().toISOString();
    recipientTracker[recipientId].status = 'Opened';
    console.log(`[OPEN DETECTED] Recipient ID ${recipientId} opened email at ${recipientTracker[recipientId].openedAt}`);
  } else {
    recipientTracker[recipientId] = {
      status: 'Opened',
      opened: true,
      openedAt: new Date().toISOString()
    };
  }

  saveDatabase();

  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': TRANSPARENT_GIF.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(TRANSPARENT_GIF);
});

// 3. GET Recipient Statuses Endpoint
app.get('/api/recipient-statuses', (req, res) => {
  res.json(recipientTracker);
});

// 4. GET Sent History Endpoint
app.get('/api/sent-history', (req, res) => {
  res.json(sentHistoryLog);
});

// 5. GET Received Replies Inbox Endpoint
app.get('/api/replies', (req, res) => {
  res.json(receivedReplies);
});

// 6. REAL LIVE IMAP REPLIES SYNC ENDPOINT
app.post('/api/fetch-live-replies', async (req, res) => {
  try {
    const user = req.body.smtpUser || storedSmtpConfig.user;
    const pass = req.body.smtpPass || storedSmtpConfig.pass;

    if (!user || !pass) {
      return res.status(400).json({ 
        error: 'Missing Gmail credentials. Please enter your Gmail address and 16-character App Password in Settings.' 
      });
    }

    console.log(`[LIVE IMAP SYNC START] Connecting to imap.gmail.com:993 for ${user}...`);

    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: {
        user: user,
        pass: pass
      },
      logger: false
    });

    await client.connect();
    let lock = await client.getMailboxLock('INBOX');

    const fetchedReplies = [];
    try {
      const totalMessages = client.mailbox.exists;
      if (totalMessages > 0) {
        // Fetch up to 25 latest emails from Gmail INBOX
        const startSeq = Math.max(1, totalMessages - 24);
        for await (let message of client.fetch(`${startSeq}:*`, { envelope: true, source: true })) {
          try {
            const parsed = await simpleParser(message.source);
            const senderEmail = parsed.from?.value[0]?.address || 'unknown@domain.com';
            const senderName = parsed.from?.value[0]?.name || senderEmail.split('@')[0];

            // Ignore messages sent by ourselves
            if (senderEmail.toLowerCase() === user.toLowerCase()) continue;

            fetchedReplies.unshift({
              id: `imap-${message.uid || Date.now()}-${Math.random().toString(36).substring(2,6)}`,
              senderEmail,
              senderName,
              role: 'Gmail Contact / Applicant',
              subject: parsed.subject || 'Re: Remote Student Opportunity',
              bodyText: parsed.text || parsed.html?.replace(/<[^>]+>/g, '') || '(No message body text)',
              receivedAt: (parsed.date || new Date()).toISOString(),
              isUnread: true
            });
          } catch (pErr) {
            console.error('[PARSE MSG ERR]', pErr.message);
          }
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    // Merge fetched replies without duplicates
    let newCount = 0;
    fetchedReplies.forEach(newR => {
      const exists = receivedReplies.some(r => r.senderEmail === newR.senderEmail && r.subject === newR.subject);
      if (!exists) {
        receivedReplies.unshift(newR);
        newCount++;
      }
    });

    saveDatabase();

    console.log(`[LIVE IMAP SYNC SUCCESS] Synced ${newCount} new incoming emails from Gmail IMAP!`);
    return res.json({ success: true, count: newCount, replies: receivedReplies });

  } catch (err) {
    console.error('[IMAP SYNC ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to connect to Gmail IMAP server.' });
  }
});

// 7. POST Add/Simulate Incoming Reply Endpoint
app.post('/api/replies', (req, res) => {
  const { senderEmail, senderName, role, subject, bodyText } = req.body;
  if (!senderEmail || !bodyText) {
    return res.status(400).json({ error: 'Missing senderEmail or bodyText' });
  }

  const newReply = {
    id: `reply-${Date.now()}`,
    senderEmail,
    senderName: senderName || 'Applicant',
    role: role || 'Student Applicant',
    subject: subject || 'Re: Remote Opportunity for Students',
    bodyText,
    receivedAt: new Date().toISOString(),
    isUnread: true
  };

  receivedReplies.unshift(newReply);
  saveDatabase();
  console.log(`[NEW REPLY STORED] From ${senderName} (${senderEmail})`);
  res.json({ success: true, reply: newReply });
});

// 8. GET Stored Config Endpoint
app.get('/api/config', (req, res) => {
  res.json({ smtpUser: storedSmtpConfig.user, mode: storedSmtpConfig.mode });
});

// 9. Test Gmail Connection Endpoint
app.post('/api/test-gmail', async (req, res) => {
  try {
    const { smtpUser, smtpPass } = req.body;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass }
    });

    await transporter.verify();
    storedSmtpConfig = { user: smtpUser, pass: smtpPass, mode: 'gmail' };
    saveDatabase();

    res.json({ success: true, message: 'Gmail SMTP authentication verified successfully!' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Gmail authentication failed. Please check app password.' });
  }
});

app.listen(PORT, () => {
  console.log(`[SkillBridge Mail Server] Running on http://localhost:${PORT}`);
});
