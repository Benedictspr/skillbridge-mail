export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    return res.status(200).json({ success: true, message: 'Reply saved.' });
  }

  return res.status(200).json([
    {
      id: 'reply-101',
      senderEmail: 'john.doe@university.edu',
      senderName: 'John Doe',
      role: 'Mathematics Tutor',
      subject: 'Re: Remote Opportunity for Students',
      bodyText: "Hi Benedict,\n\nThank you for reaching out! I am a 3rd-year Mathematics student at University and very interested in the remote tutoring role. I have 2 years of teaching experience with high school algebra and calculus.\n\nPlease let me know the next steps for applying.\n\nBest regards,\nJohn Doe",
      receivedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      isUnread: true
    }
  ]);
}
