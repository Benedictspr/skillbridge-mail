// Default initial recipients state is CLEAN and EMPTY (No hardcoded emails)
export const INITIAL_RECIPIENTS = [];

// SkillBridge Students Sample Dataset (Available on-demand via Load Sample button)
export const SKILLBRIDGE_STUDENTS = [
  { id: 'sb-1', email: 'john.doe@university.edu', firstName: 'John', lastName: 'Doe', company: 'SkillBridge Network', role: 'Mathematics Tutor', status: 'Ready' },
  { id: 'sb-2', email: 'mary.smith@cambridge.org', firstName: 'Mary', lastName: 'Smith', company: 'SkillBridge Network', role: 'Python Developer', status: 'Ready' },
  { id: 'sb-3', email: 'peter.jones@mit.edu', firstName: 'Peter', lastName: 'Jones', company: 'SkillBridge Network', role: 'UI/UX Designer', status: 'Ready' },
  { id: 'sb-4', email: 'sarah.connor@stanford.edu', firstName: 'Sarah', lastName: 'Connor', company: 'SkillBridge Network', role: 'English Tutor', status: 'Ready' },
  { id: 'sb-5', email: 'alex.chen@berkeley.edu', firstName: 'Alex', lastName: 'Chen', company: 'SkillBridge Network', role: 'Data Analyst', status: 'Ready' }
];

// Professional Student Outreach Email Templates
export const EMAIL_TEMPLATES = [
  {
    id: 'option-1-best',
    name: 'Option 1 - Student Remote Opportunity (Telegram)',
    subject: 'Remote Opportunity for Students',
    bodyText: `Hi {{first_name}},

I'm looking for students interested in flexible remote work they can do alongside their studies.

If you have basic skills such as teaching, IT, or similar, and would like to earn extra income, click the Telegram link below to message us directly or reply to this email.

I'll share the full details with interested applicants.

Thank you.`,
    headerLogoText: 'SKILLBRIDGE CAREERS',
    buttonText: 'Reply to Apply Now',
    buttonUrl: 'https://t.me/+AB0OloYpE7I1NTVk',
    signatureText: 'Benedict\nDirector of Student Outreach | SkillBridge Network',
  },
  {
    id: 'option-2-fellowship',
    name: 'SkillBridge Fellowship & Research Roles',
    subject: 'Flexible Student Opportunities at {{company}}',
    bodyText: `Hello {{first_name}},

We noticed your background in {{role}}. SkillBridge is currently accepting applications for flexible remote student roles designed to complement your academic schedule.

Positions offer flexible hours (5 to 15 hours weekly) and direct practical experience.

If you are interested in exploring available roles, click the link below to apply on Telegram or reply to this email.`,
    headerLogoText: 'SKILLBRIDGE CAREERS',
    buttonText: 'Reply to Apply Now',
    buttonUrl: 'https://t.me/+AB0OloYpE7I1NTVk',
    signatureText: 'Benedict\nStudent Recruitment Lead',
  }
];

export const INITIAL_CAMPAIGN = {
  id: 'cmp-101',
  title: 'SkillBridge Student Remote Opportunity Campaign',
  senderName: 'Benedict',
  senderEmail: '',
  intervalSeconds: 5,
  useJitter: true,
  dailyLimit: 200,
  templateId: 'option-1-best',
  subject: 'Remote Opportunity for Students',
  bodyText: EMAIL_TEMPLATES[0].bodyText,
  headerLogoText: EMAIL_TEMPLATES[0].headerLogoText,
  buttonText: EMAIL_TEMPLATES[0].buttonText,
  buttonUrl: EMAIL_TEMPLATES[0].buttonUrl,
  signatureText: EMAIL_TEMPLATES[0].signatureText,
};
