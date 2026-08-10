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
  { id: 'sup-1', email: 'spamtrap@badlist-detector.net', reason: 'Spam Trap Hit', type: 'COMPLAINT', addedAt: '2026-08-01', organization_id: 'org_sendaat_1001' },
  { id: 'sup-2', email: 'invalid.user.bounce99@invalid-domain.xyz', reason: 'Hard Bounce 550 User Unknown', type: 'HARD_BOUNCE', addedAt: '2026-08-03', organization_id: 'org_sendaat_1001' },
  { id: 'sup-3', email: 'scraped.dump.lead501@disposable-temp.com', reason: 'Scraped Address Shield Triggered', type: 'SCRAPED_GUARD', addedAt: '2026-08-05', organization_id: 'org_sendaat_1001' },
  { id: 'sup-4', email: 'unsubscribe.user@corp-client.org', reason: 'RFC-8058 One-Click Unsubscribe', type: 'UNSUBSCRIBE', addedAt: '2026-08-06', organization_id: 'org_sendaat_1001' }
];

// Default initial recipients state is CLEAN and EMPTY (No hardcoded emails)
export const INITIAL_RECIPIENTS = [];

// Sendaat Candidates Sample Dataset (Available on-demand via Load Sample button)
export const SENDAAT_STUDENTS = [
  { id: 'sb-1', email: 'john.doe@university.edu', firstName: 'John', lastName: 'Doe', company: 'Sendaat Network', role: 'Mathematics Tutor', status: 'Ready', organization_id: 'org_sendaat_1001' },
  { id: 'sb-2', email: 'mary.smith@cambridge.org', firstName: 'Mary', lastName: 'Smith', company: 'Sendaat Network', role: 'Python Developer', status: 'Ready', organization_id: 'org_sendaat_1001' },
  { id: 'sb-3', email: 'peter.jones@mit.edu', firstName: 'Peter', lastName: 'Jones', company: 'Sendaat Network', role: 'UI/UX Designer', status: 'Ready', organization_id: 'org_sendaat_1001' },
  { id: 'sb-4', email: 'sarah.connor@stanford.edu', firstName: 'Sarah', lastName: 'Connor', company: 'Sendaat Network', role: 'English Tutor', status: 'Ready', organization_id: 'org_sendaat_1001' },
  { id: 'sb-5', email: 'alex.chen@berkeley.edu', firstName: 'Alex', lastName: 'Chen', company: 'Sendaat Network', role: 'Data Analyst', status: 'Ready', organization_id: 'org_sendaat_1001' }
];
export const SKILLBRIDGE_STUDENTS = SENDAAT_STUDENTS;

// Professional Candidate Outreach Email Templates
export const EMAIL_TEMPLATES = [];

export const INITIAL_CAMPAIGN = {
  id: 'cmp-101',
  organization_id: 'org_sendaat_1001',
  title: 'New Outreach Campaign',
  senderName: 'Sendaat Admin',
  senderEmail: 'outreach@sendaat.io',
  intervalSeconds: 5,
  useJitter: true,
  dailyLimit: 200,
  templateId: '',
  subject: '',
  bodyText: '',
  headerLogoText: 'SENDAAT CAREERS',
  buttonText: 'Reply to Apply Now',
  buttonUrl: '',
  signatureText: ''
};
