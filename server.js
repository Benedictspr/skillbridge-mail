import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory status store for tracking sent & opened emails
const recipientTracker = {};

// In-memory received replies inbox
const receivedReplies = [
  {
    id: 'reply-101',
    senderEmail: 'john.doe@university.edu',
    senderName: 'John Doe',
    role: 'Mathematics Tutor',
    subject: 'Re: Remote Opportunity for Students',
    bodyText: "Hi Benedict,\n\nThank you for reaching out! I am a 3rd-year Mathematics student at University and very interested in the remote tutoring role. I have 2 years of teaching experience with high school algebra and calculus.\n\nPlease let me know the next steps for applying.\n\nBest regards,\nJohn Doe",
    receivedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    isUnread: true
  },
  {
    id: 'reply-102',
    senderEmail: 'mary.smith@cambridge.org',
    senderName: 'Mary Smith',
    role: 'Python Developer',
    subject: 'Re: Remote Opportunity for Students',
    bodyText: "Hello Benedict,\n\nI saw your email regarding flexible student work opportunities. I specialize in Python, Django, and Data Science. I am available for 10-15 hours per week alongside my studies.\n\nLooking forward to hearing from you!\n\nMary Smith",
    receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    isUnread: false
  }
];

// 1x1 Transparent GIF Pixel Buffer for Open Tracking
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

// 1. Send Email Endpoint (Gmail SMTP or Sandbox)
app.post('/api/send-email', async (req, res) => {
  try {
    const { recipientId, to, subject, html, smtpUser, smtpPass, mode } = req.body;

    if (!to || !recipientId) {
      return res.status(400).json({ error: 'Missing required recipient parameters.' });
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

      console.log(`[REAL GMAIL SENT] To: ${to} | MessageId: ${info.messageId}`);
      return res.json({ success: true, messageId: info.messageId, mode: 'gmail' });

    } else {
      recipientTracker[recipientId] = {
        status: 'Sent',
        sentAt: sentTimestamp,
        opened: false,
        messageId: `sandbox-${Date.now()}`
      };

      console.log(`[SANDBOX SENT] To: ${to} (Simulated delivery)`);
      return res.json({ success: true, simulated: true, mode: 'sandbox' });
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

  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': TRANSPARENT_GIF.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(TRANSPARENT_GIF);
});

// 3. Get Tracking Status for All Recipients
app.get('/api/recipient-statuses', (req, res) => {
  res.json(recipientTracker);
});

// 4. GET Received Replies Inbox Endpoint
app.get('/api/replies', (req, res) => {
  res.json(receivedReplies);
});

// 5. POST Add/Simulate Incoming Reply Endpoint
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
  console.log(`[NEW REPLY RECEIVED] From ${senderName} (${senderEmail})`);
  res.json({ success: true, reply: newReply });
});

// 6. Test Gmail Connection Endpoint
app.post('/api/test-gmail', async (req, res) => {
  try {
    const { smtpUser, smtpPass } = req.body;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass }
    });

    await transporter.verify();
    res.json({ success: true, message: 'Gmail SMTP authentication verified successfully!' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Gmail authentication failed. Please check app password.' });
  }
});

app.listen(PORT, () => {
  console.log(`[SkillBridge Mail Server] Running on http://localhost:${PORT}`);
});
