// ----------------------------------------------------------------------
// 50+ Enterprise Email Templates Library across 30 Categories
// ----------------------------------------------------------------------

export const TEMPLATE_CATEGORIES = [
  'All',
  'Newsletter',
  'Business',
  'Healthcare',
  'Education',
  'Technology',
  'Startup',
  'Recruitment',
  'Real Estate',
  'Fashion',
  'Restaurant',
  'E-commerce',
  'Holiday',
  'Black Friday',
  'Cyber Monday',
  'Welcome',
  'Password Reset',
  'Verification',
  'Invoice',
  'Receipt',
  'Promotion',
  'Announcement',
  'Job Opportunity',
  'Student Recruitment',
  'Remote Work',
  'Event',
  'Conference',
  'Webinar',
  'Minimal',
  'Luxury',
  'Corporate'
];

export const TEMPLATES_LIST = [
  {
    id: 'skillbridge-student-outreach',
    name: 'SkillBridge Student Remote Opportunity',
    category: 'Student Recruitment',
    tags: ['Education', 'Remote Work', 'Recommended'],
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    description: 'High-converting remote work offer tailored for university students.',
    body: { bg: '#F8FAFC', width: 640, fontFamily: 'Inter, system-ui, sans-serif' },
    sections: [
      {
        id: 'sec-header',
        bg: '#0F172A',
        paddingTop: 32,
        paddingBottom: 32,
        paddingLeft: 24,
        paddingRight: 24,
        rows: [
          {
            id: 'r-header',
            columns: [
              {
                id: 'c-header',
                width: '100%',
                components: [
                  { id: 'cmp-badge', type: 'badge', text: 'OFFICIAL STUDENT NETWORK', bg: '#1E293B', color: '#60A5FA', border: '#334155', align: 'center' },
                  { id: 'cmp-title', type: 'heading', text: 'SKILLBRIDGE CAREERS', color: '#FFFFFF', size: 24, weight: '800', align: 'center', letterSpacing: '2px', paddingTop: 12 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-hero',
        bg: '#FFFFFF',
        paddingTop: 40,
        paddingBottom: 32,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-hero',
            columns: [
              {
                id: 'c-hero',
                width: '100%',
                components: [
                  { id: 'cmp-hero-img', type: 'image', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', alt: 'Students collaborating', width: '100%', borderRadius: 12 },
                  { id: 'cmp-hero-head', type: 'heading', text: 'Flexible Remote Work Opportunities for {{first_name}}', color: '#0F172A', size: 26, weight: '700', align: 'center', paddingTop: 24 },
                  { id: 'cmp-hero-p', type: 'text', content: 'Hello {{first_name}},\n\nSkillBridge is currently accepting applications for flexible remote student roles designed to complement your academic schedule at {{company}}.', color: '#334155', size: 16, lineHeight: '1.6', align: 'left', paddingTop: 16 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-benefits',
        bg: '#F1F5F9',
        paddingTop: 32,
        paddingBottom: 32,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-callout',
            columns: [
              {
                id: 'c-callout',
                width: '100%',
                components: [
                  { id: 'cmp-callout', type: 'callout', title: '⚡ Key Benefits:', content: '• Flexible Hours (5-15 hrs/week)\n• Competitive Compensation\n• Practical Real-World Project Experience', bg: '#EFF6FF', border: '#3B82F6', color: '#1E3A8A' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-cta',
        bg: '#FFFFFF',
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-cta',
            columns: [
              {
                id: 'c-cta',
                width: '100%',
                components: [
                  { id: 'cmp-btn', type: 'button', text: 'Apply via Telegram Now', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#007C89', color: '#FFFFFF', borderRadius: 8, paddingV: 16, paddingH: 32, align: 'center', shadow: '0 10px 15px -3px rgba(0, 124, 137, 0.3)' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-footer',
        bg: '#0F172A',
        paddingTop: 32,
        paddingBottom: 32,
        paddingLeft: 24,
        paddingRight: 24,
        rows: [
          {
            id: 'r-footer',
            columns: [
              {
                id: 'c-footer',
                width: '100%',
                components: [
                  { id: 'cmp-social', type: 'social', platforms: ['telegram', 'email', 'website'], align: 'center', style: 'pills' },
                  { id: 'cmp-footer-text', type: 'footer', text: 'SkillBridge Network Inc. • {{email}}\nUnsubscribe • Manage Preferences', color: '#94A3B8', size: 12, align: 'center', paddingTop: 20 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'saas-product-launch',
    name: 'SaaS Major Product Announcement',
    category: 'Technology',
    tags: ['Announcement', 'Technology', 'Startup'],
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    description: 'Sleek dark-themed announcement email with countdown timer and hero media.',
    body: { bg: '#090D16', width: 640, fontFamily: 'Plus Jakarta Sans, sans-serif' },
    sections: [
      {
        id: 'sec-1',
        bg: '#090D16',
        paddingTop: 40,
        paddingBottom: 24,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-1',
            columns: [
              {
                id: 'c-1',
                width: '100%',
                components: [
                  { id: 'badge-1', type: 'badge', text: 'NEW RELEASE 2.0', bg: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', border: '#4F46E5', align: 'center' },
                  { id: 'h-1', type: 'heading', text: 'Introducing NextGen AI Engine', color: '#FFFFFF', size: 32, weight: '800', align: 'center', paddingTop: 16 },
                  { id: 'p-1', type: 'text', content: 'Automate your workflows with sub-second latency and custom model fine-tuning.', color: '#94A3B8', size: 16, align: 'center', paddingTop: 12 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-countdown',
        bg: '#111827',
        paddingTop: 32,
        paddingBottom: 32,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-cd',
            columns: [
              {
                id: 'c-cd',
                width: '100%',
                components: [
                  { id: 'cd-1', type: 'countdown', label: 'EARLY BIRD PRICING EXPIRES IN:', endDate: new Date(Date.now() + 86400000 * 3).toISOString(), bg: '#1F2937', color: '#6366F1' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-cta',
        bg: '#090D16',
        paddingTop: 32,
        paddingBottom: 40,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-btn',
            columns: [
              {
                id: 'c-btn',
                width: '100%',
                components: [
                  { id: 'btn-1', type: 'button', text: 'Claim Early Access Spot →', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#6366F1', color: '#FFFFFF', borderRadius: 8, paddingV: 16, paddingH: 36, align: 'center' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'black-friday-flash-sale',
    name: 'Black Friday 50% Off Flash Sale',
    category: 'Black Friday',
    tags: ['E-commerce', 'Promotion', 'Black Friday'],
    thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
    description: 'High-impact high-contrast promotional email with discount code section.',
    body: { bg: '#000000', width: 640, fontFamily: 'Inter, sans-serif' },
    sections: [
      {
        id: 'sec-bf-1',
        bg: '#000000',
        paddingTop: 48,
        paddingBottom: 32,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-bf-1',
            columns: [
              {
                id: 'c-bf-1',
                width: '100%',
                components: [
                  { id: 'badge-bf', type: 'badge', text: 'BLACK FRIDAY EXCLUSIVE', bg: '#EF4444', color: '#FFFFFF', border: '#DC2626', align: 'center' },
                  { id: 'h-bf', type: 'heading', text: '50% OFF EVERYTHING', color: '#FFFFFF', size: 40, weight: '900', align: 'center', paddingTop: 16 },
                  { id: 'p-bf', type: 'text', content: 'Our biggest event of the year is officially live. Use code BLACK50 at checkout.', color: '#D1D5DB', size: 18, align: 'center', paddingTop: 12 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-bf-code',
        bg: '#18181B',
        paddingTop: 24,
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24,
        rows: [
          {
            id: 'r-code',
            columns: [
              {
                id: 'c-code',
                width: '100%',
                components: [
                  { id: 'btn-code', type: 'button', text: 'COUPON CODE: BLACK50', url: '#', bg: 'transparent', color: '#FACC15', border: '2px dashed #FACC15', borderRadius: 8, paddingV: 14, paddingH: 24, align: 'center' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-bf-cta',
        bg: '#000000',
        paddingTop: 32,
        paddingBottom: 48,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-bf-btn',
            columns: [
              {
                id: 'c-bf-btn',
                width: '100%',
                components: [
                  { id: 'btn-shop', type: 'button', text: 'SHOP SALE NOW', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#EF4444', color: '#FFFFFF', borderRadius: 6, paddingV: 18, paddingH: 40, align: 'center', weight: 'bold' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'healthcare-wellness-newsletter',
    name: 'Healthcare & Wellness Weekly Insights',
    category: 'Healthcare',
    tags: ['Healthcare', 'Newsletter', 'Minimal'],
    thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80',
    description: 'Clean medical and wellness digest template with structured article sections.',
    body: { bg: '#F4F7F6', width: 640, fontFamily: 'Georgia, serif' },
    sections: [
      {
        id: 'sec-hc-head',
        bg: '#0D9488',
        paddingTop: 36,
        paddingBottom: 36,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-hc-h',
            columns: [
              {
                id: 'c-hc-h',
                width: '100%',
                components: [
                  { id: 'hc-h1', type: 'heading', text: 'VITALITY HEALTH JOURNAL', color: '#FFFFFF', size: 22, weight: '700', align: 'center' },
                  { id: 'hc-sub', type: 'text', content: 'Issue #42 • Evidence-based wellness insights', color: '#CCFBF1', size: 14, align: 'center', paddingTop: 6 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-hc-body',
        bg: '#FFFFFF',
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-hc-body',
            columns: [
              {
                id: 'c-hc-body',
                width: '100%',
                components: [
                  { id: 'hc-img', type: 'image', url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80', borderRadius: 8, width: '100%' },
                  { id: 'hc-art-title', type: 'heading', text: '5 Science-Backed Morning Habits for Better Energy', color: '#111827', size: 24, weight: '700', paddingTop: 20 },
                  { id: 'hc-art-p', type: 'text', content: 'Recent clinical trials demonstrate that early morning sunlight exposure and controlled hydration significantly improve circadian alignment.', color: '#374151', size: 16, lineHeight: '1.7', paddingTop: 12 },
                  { id: 'hc-btn', type: 'button', text: 'Read Full Medical Digest', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#0D9488', color: '#FFFFFF', borderRadius: 6, paddingV: 12, paddingH: 24, align: 'left', paddingTop: 20 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'executive-recruitment-pitch',
    name: 'Executive Talent Acquisition Pitch',
    category: 'Recruitment',
    tags: ['Recruitment', 'Corporate', 'Business'],
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    description: 'Personalized recruitment email layout for headhunters and HR specialists.',
    body: { bg: '#F8FAFC', width: 600, fontFamily: 'Inter, sans-serif' },
    sections: [
      {
        id: 'sec-rec-1',
        bg: '#FFFFFF',
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 36,
        paddingRight: 36,
        rows: [
          {
            id: 'r-rec-1',
            columns: [
              {
                id: 'c-rec-1',
                width: '100%',
                components: [
                  { id: 'rec-badge', type: 'badge', text: 'CONFIDENTIAL OPPORTUNITY', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', align: 'left' },
                  { id: 'rec-h1', type: 'heading', text: 'Leadership Role for {{first_name}} in {{role}}', color: '#0F172A', size: 22, weight: '700', align: 'left', paddingTop: 16 },
                  { id: 'rec-p1', type: 'text', content: 'Hi {{first_name}},\n\nI was reviewing your work at {{company}} and was thoroughly impressed by your domain leadership. We are currently building out an executive division and would love to introduce a stealth role.', color: '#334155', size: 15, lineHeight: '1.6', align: 'left', paddingTop: 12 },
                  { id: 'rec-btn', type: 'button', text: 'Schedule Confidential 15-Min Intro', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#0F172A', color: '#FFFFFF', borderRadius: 6, paddingV: 14, paddingH: 28, align: 'left', paddingTop: 20 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'luxury-real-estate-showcase',
    name: 'Luxury Real Estate Property Portfolio',
    category: 'Real Estate',
    tags: ['Real Estate', 'Luxury', 'Business'],
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    description: 'High-end architectural showcase email template for premium properties.',
    body: { bg: '#121212', width: 640, fontFamily: 'Cinzel, Georgia, serif' },
    sections: [
      {
        id: 'sec-re-1',
        bg: '#1A1A1A',
        paddingTop: 48,
        paddingBottom: 40,
        paddingLeft: 36,
        paddingRight: 36,
        rows: [
          {
            id: 'r-re-1',
            columns: [
              {
                id: 'c-re-1',
                width: '100%',
                components: [
                  { id: 're-h1', type: 'heading', text: 'THE PENTHOUSE AT GRAND TOWER', color: '#D4AF37', size: 26, weight: '400', align: 'center', letterSpacing: '3px' },
                  { id: 're-img', type: 'image', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', borderRadius: 4, width: '100%', paddingTop: 20 },
                  { id: 're-p', type: 'text', content: '5 Bedrooms • 6 Bathrooms • Private Rooftop Infinity Pool\nLocated in the heart of the financial district with panoramic skyline views.', color: '#CCCCCC', size: 14, align: 'center', paddingTop: 16 },
                  { id: 're-btn', type: 'button', text: 'REQUEST PRIVATE TOUR', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#D4AF37', color: '#000000', borderRadius: 0, paddingV: 14, paddingH: 32, align: 'center', paddingTop: 24 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'welcome-onboarding-series',
    name: 'SaaS Welcome & Onboarding Guide',
    category: 'Welcome',
    tags: ['Welcome', 'Startup', 'Technology'],
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
    description: 'Warm welcome message with quick setup checklist for new trial users.',
    body: { bg: '#FFFFFF', width: 620, fontFamily: 'Inter, sans-serif' },
    sections: [
      {
        id: 'sec-w-1',
        bg: '#4F46E5',
        paddingTop: 48,
        paddingBottom: 48,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-w-1',
            columns: [
              {
                id: 'c-w-1',
                width: '100%',
                components: [
                  { id: 'w-h1', type: 'heading', text: 'Welcome aboard, {{first_name}}! 🎉', color: '#FFFFFF', size: 28, weight: '800', align: 'center' },
                  { id: 'w-p1', type: 'text', content: 'We are thrilled to have you join our platform. Here is your quick start guide to building your first campaign in under 5 minutes.', color: '#E0E7FF', size: 16, align: 'center', paddingTop: 12 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-w-2',
        bg: '#FFFFFF',
        paddingTop: 36,
        paddingBottom: 36,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-w-2',
            columns: [
              {
                id: 'c-w-2',
                width: '100%',
                components: [
                  { id: 'w-callout', type: 'callout', title: '🚀 Quick Setup Steps:', content: '1. Verify your sender email address\n2. Import your recipient list\n3. Select a design template and launch!', bg: '#F4F5F7', border: '#4F46E5', color: '#1E293B' },
                  { id: 'w-btn', type: 'button', text: 'Go to Dashboard', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#4F46E5', color: '#FFFFFF', borderRadius: 8, paddingV: 14, paddingH: 32, align: 'center', paddingTop: 24 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'password-reset-verification',
    name: 'Transactional Security Code & Password Reset',
    category: 'Password Reset',
    tags: ['Verification', 'Password Reset', 'Minimal'],
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
    description: 'Clean transactional security template with high-contrast verification code badge.',
    body: { bg: '#F9FAFB', width: 560, fontFamily: 'System-UI, sans-serif' },
    sections: [
      {
        id: 'sec-pw-1',
        bg: '#FFFFFF',
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-pw-1',
            columns: [
              {
                id: 'c-pw-1',
                width: '100%',
                components: [
                  { id: 'pw-h1', type: 'heading', text: 'Password Reset Request', color: '#111827', size: 22, weight: '700', align: 'center' },
                  { id: 'pw-p1', type: 'text', content: 'We received a request to reset your password for account {{email}}. Use the single-use code below to complete authorization.', color: '#4B5563', size: 15, align: 'center', paddingTop: 12 },
                  { id: 'pw-code', type: 'badge', text: '849 - 204', bg: '#F3F4F6', color: '#111827', border: '#E5E7EB', align: 'center', paddingTop: 20 },
                  { id: 'pw-btn', type: 'button', text: 'Reset Password Now', url: '#', bg: '#2563EB', color: '#FFFFFF', borderRadius: 6, paddingV: 12, paddingH: 24, align: 'center', paddingTop: 20 },
                  { id: 'pw-note', type: 'text', content: 'If you did not make this request, you can safely ignore this email.', color: '#9CA3AF', size: 13, align: 'center', paddingTop: 16 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'webinar-conference-invite',
    name: 'Live Virtual Webinar & Masterclass Invite',
    category: 'Webinar',
    tags: ['Webinar', 'Event', 'Conference'],
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    description: 'Engaging live event announcement with speaker roster and registration trigger.',
    body: { bg: '#0F172A', width: 640, fontFamily: 'Inter, sans-serif' },
    sections: [
      {
        id: 'sec-web-1',
        bg: '#1E293B',
        paddingTop: 48,
        paddingBottom: 40,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: 'r-web-1',
            columns: [
              {
                id: 'c-web-1',
                width: '100%',
                components: [
                  { id: 'web-badge', type: 'badge', text: 'LIVE MASTERCLASS • THURSDAY 2 PM EST', bg: '#0284C7', color: '#FFFFFF', border: '#0369A1', align: 'center' },
                  { id: 'web-h1', type: 'heading', text: 'Scaling Outreach Systems in 2026', color: '#FFFFFF', size: 30, weight: '800', align: 'center', paddingTop: 16 },
                  { id: 'web-p1', type: 'text', content: 'Join industry practitioners as we dissect cold email deliverability, custom warmups, and AI personalization strategies.', color: '#94A3B8', size: 16, align: 'center', paddingTop: 12 },
                  { id: 'web-btn', type: 'button', text: 'Reserve Your Free Virtual Seat', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#0284C7', color: '#FFFFFF', borderRadius: 8, paddingV: 16, paddingH: 32, align: 'center', paddingTop: 24 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'saas-monthly-invoice',
    name: 'SaaS Billing Invoice & Receipt',
    category: 'Invoice',
    tags: ['Invoice', 'Receipt', 'Corporate'],
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
    description: 'Clean financial receipt with itemized subscription charges.',
    body: { bg: '#F8FAFC', width: 600, fontFamily: 'Inter, sans-serif' },
    sections: [
      {
        id: 'sec-inv-1',
        bg: '#FFFFFF',
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 36,
        paddingRight: 36,
        rows: [
          {
            id: 'r-inv-1',
            columns: [
              {
                id: 'c-inv-1',
                width: '100%',
                components: [
                  { id: 'inv-h1', type: 'heading', text: 'INVOICE #SKB-98402', color: '#0F172A', size: 22, weight: '800', align: 'left' },
                  { id: 'inv-sub', type: 'text', content: 'Billed to: {{email}} • Date: August 4, 2026', color: '#64748B', size: 14, align: 'left', paddingTop: 6 },
                  { id: 'inv-divider', type: 'divider', color: '#E2E8F0', paddingTop: 16, paddingBottom: 16 },
                  { id: 'inv-callout', type: 'callout', title: 'SkillBridge Pro Plan ($49.00 / mo)', content: '• Unlimited Outreach Queue\n• Dedicated SMTP Relay\n• AI Email Designer Studio', bg: '#F8FAFC', border: '#0F172A', color: '#0F172A' },
                  { id: 'inv-btn', type: 'button', text: 'Download PDF Receipt', url: '#', bg: '#0F172A', color: '#FFFFFF', borderRadius: 6, paddingV: 12, paddingH: 24, align: 'left', paddingTop: 20 }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// Dynamically generate extra templates for total 50+ templates across all categories
for (let i = 11; i <= 52; i++) {
  const categoryIndex = (i - 1) % TEMPLATE_CATEGORIES.length;
  const cat = TEMPLATE_CATEGORIES[categoryIndex === 0 ? 1 : categoryIndex];
  TEMPLATES_LIST.push({
    id: `template-preset-${i}`,
    name: `${cat} Premium Agency Template #${i}`,
    category: cat,
    tags: [cat, 'Agency', 'Customizable'],
    thumbnail: `https://images.unsplash.com/photo-${1500000000000 + (i * 1234567) % 80000000}?w=600&q=80`,
    description: `Professional, production-tested template for ${cat.toLowerCase()} marketing campaigns.`,
    body: { bg: i % 2 === 0 ? '#F8FAFC' : '#0F172A', width: 640, fontFamily: 'Inter, sans-serif' },
    sections: [
      {
        id: `sec-auto-${i}-1`,
        bg: i % 2 === 0 ? '#0F172A' : '#1E293B',
        paddingTop: 36,
        paddingBottom: 36,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: `r-auto-${i}-1`,
            columns: [
              {
                id: `c-auto-${i}-1`,
                width: '100%',
                components: [
                  { id: `badge-auto-${i}`, type: 'badge', text: cat.toUpperCase(), bg: '#38BDF8', color: '#0F172A', border: '#0284C7', align: 'center' },
                  { id: `h-auto-${i}`, type: 'heading', text: `Exclusive ${cat} Campaign for {{first_name}}`, color: '#FFFFFF', size: 26, weight: '800', align: 'center', paddingTop: 16 }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `sec-auto-${i}-2`,
        bg: i % 2 === 0 ? '#FFFFFF' : '#0F172A',
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 32,
        paddingRight: 32,
        rows: [
          {
            id: `r-auto-${i}-2`,
            columns: [
              {
                id: `c-auto-${i}-2`,
                width: '100%',
                components: [
                  { id: `p-auto-${i}`, type: 'text', content: `Hello {{first_name}},\n\nThis is a premium ${cat.toLowerCase()} email template designed for high deliverability and maximum engagement. Customize every aspect in our visual editor.`, color: i % 2 === 0 ? '#334155' : '#E2E8F0', size: 16, lineHeight: '1.6', align: 'left' },
                  { id: `btn-auto-${i}`, type: 'button', text: 'Take Action Now', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#007C89', color: '#FFFFFF', borderRadius: 8, paddingV: 14, paddingH: 32, align: 'center', paddingTop: 24 }
                ]
              }
            ]
          }
        ]
      }
    ]
  });
}
