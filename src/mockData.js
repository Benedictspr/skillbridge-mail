// Multi-Tenant Organizations Schema
export const INITIAL_ORGANIZATIONS = [
  {
    id: 'org_sendaat_1001',
    name: 'Sendaat Enterprise',
    domain: 'sendaat.io',
    plan: 'Enterprise Deliverability',
    reputationScore: 99,
    hourlyQuota: 2500,
    dailyQuota: 50000,
    sentToday: 1240,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'REJECT_100',
    scrapedGuardEnabled: true,
    createdDate: '2026-01-15'
  },
  {
    id: 'org_acme_2042',
    name: 'Acme Outreach Corp',
    domain: 'acmeoutreach.com',
    plan: 'Business Pro',
    reputationScore: 94,
    hourlyQuota: 1000,
    dailyQuota: 10000,
    sentToday: 850,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'QUARANTINE',
    scrapedGuardEnabled: true,
    createdDate: '2026-03-10'
  },
  {
    id: 'org_techstart_3099',
    name: 'TechStart AI Labs',
    domain: 'techstart.io',
    plan: 'Developer Growth',
    reputationScore: 97,
    hourlyQuota: 500,
    dailyQuota: 5000,
    sentToday: 320,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'NONE',
    scrapedGuardEnabled: true,
    createdDate: '2026-05-20'
  }
];

// Initial Suppression & Blacklist Data (Scraped Address Shield, Bounces & Complaints)
export const INITIAL_SUPPRESSION_LIST = [
  { id: 'sup-1', email: 'spamtrap@badlist-detector.net', reason: 'Spam Trap Hit', type: 'COMPLAINT', addedAt: '2026-08-01', organization_id: 'org_skillbridge_1001' },
  { id: 'sup-2', email: 'invalid.user.bounce99@invalid-domain.xyz', reason: 'Hard Bounce 550 User Unknown', type: 'HARD_BOUNCE', addedAt: '2026-08-03', organization_id: 'org_skillbridge_1001' },
  { id: 'sup-3', email: 'scraped.dump.lead501@disposable-temp.com', reason: 'Scraped Address Shield Triggered', type: 'SCRAPED_GUARD', addedAt: '2026-08-05', organization_id: 'org_skillbridge_1001' },
  { id: 'sup-4', email: 'unsubscribe.user@corp-client.org', reason: 'RFC-8058 One-Click Unsubscribe', type: 'UNSUBSCRIBE', addedAt: '2026-08-06', organization_id: 'org_skillbridge_1001' }
];

// Default initial recipients state is CLEAN and EMPTY (No hardcoded emails)
export const INITIAL_RECIPIENTS = [];

// SkillBridge Students Sample Dataset (Available on-demand via Load Sample button)
export const SKILLBRIDGE_STUDENTS = [
  { id: 'sb-1', email: 'john.doe@university.edu', firstName: 'John', lastName: 'Doe', company: 'SkillBridge Network', role: 'Mathematics Tutor', status: 'Ready', organization_id: 'org_skillbridge_1001' },
  { id: 'sb-2', email: 'mary.smith@cambridge.org', firstName: 'Mary', lastName: 'Smith', company: 'SkillBridge Network', role: 'Python Developer', status: 'Ready', organization_id: 'org_skillbridge_1001' },
  { id: 'sb-3', email: 'peter.jones@mit.edu', firstName: 'Peter', lastName: 'Jones', company: 'SkillBridge Network', role: 'UI/UX Designer', status: 'Ready', organization_id: 'org_skillbridge_1001' },
  { id: 'sb-4', email: 'sarah.connor@stanford.edu', firstName: 'Sarah', lastName: 'Connor', company: 'SkillBridge Network', role: 'English Tutor', status: 'Ready', organization_id: 'org_skillbridge_1001' },
  { id: 'sb-5', email: 'alex.chen@berkeley.edu', firstName: 'Alex', lastName: 'Chen', company: 'SkillBridge Network', role: 'Data Analyst', status: 'Ready', organization_id: 'org_skillbridge_1001' }
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
    organization_id: 'org_skillbridge_1001'
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
    organization_id: 'org_skillbridge_1001'
  }
];

export const INITIAL_CAMPAIGN = {
  id: 'cmp-101',
  organization_id: 'org_skillbridge_1001',
  title: 'SkillBridge Student Remote Opportunity Campaign',
  senderName: 'Benedict',
  senderEmail: 'outreach@skillbridge.org',
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

