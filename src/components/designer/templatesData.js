// ----------------------------------------------------------------------
// Sendaat Enterprise Email Templates Library
// ----------------------------------------------------------------------

export const TEMPLATE_CATEGORIES = [
  'All',
  'Enterprise',
  'Outreach',
  'Welcome',
  'Password Reset',
  'Verification',
  'Newsletter',
  'Promotion',
  'Minimal'
];

export const TEMPLATES_LIST = [
  {
    id: 'sendaat-monochromatic-outreach',
    name: 'Sendaat Monochromatic Outreach',
    category: 'Enterprise',
    tags: ['Outreach', 'Enterprise', 'Recommended'],
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    description: 'Vantablack high-converting outreach email template.',
    body: { bg: '#FFFFFF', width: 640, fontFamily: 'Inter, system-ui, sans-serif' },
    sections: [
      {
        id: 'sec-body',
        bg: '#FFFFFF',
        paddingTop: 36,
        paddingBottom: 36,
        paddingLeft: 36,
        paddingRight: 36,
        rows: [
          {
            id: 'r-body-1',
            columns: [
              {
                id: 'c-body-1',
                width: '100%',
                components: [
                  { 
                    id: 'cmp-p1', 
                    type: 'text', 
                    content: 'Hi {{first_name}},', 
                    color: '#0F172A', 
                    size: 16, 
                    lineHeight: '1.6', 
                    align: 'left', 
                    paddingTop: 0,
                    paddingBottom: 16 
                  },
                  { 
                    id: 'cmp-p2', 
                    type: 'text', 
                    content: 'Based on your profile at {{company}}, we would love to introduce a remote role tailored to your background in {{role}}.', 
                    color: '#334155', 
                    size: 15, 
                    lineHeight: '1.7', 
                    align: 'left', 
                    paddingTop: 0,
                    paddingBottom: 16 
                  },
                  { 
                    id: 'cmp-p3', 
                    type: 'text', 
                    content: 'If you have basic skills and would like to earn extra income alongside your schedule, reply directly to this email or click the button below to connect with us.', 
                    color: '#334155', 
                    size: 15, 
                    lineHeight: '1.7', 
                    align: 'left', 
                    paddingTop: 0,
                    paddingBottom: 24 
                  },
                  { 
                    id: 'cmp-btn', 
                    type: 'button', 
                    text: 'View Opportunity Details →', 
                    url: 'https://sendaat.io', 
                    bg: '#050505', 
                    color: '#FFFFFF', 
                    align: 'center', 
                    borderRadius: 9999, 
                    paddingTop: 14, 
                    paddingBottom: 14, 
                    paddingLeft: 32, 
                    paddingRight: 32 
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
