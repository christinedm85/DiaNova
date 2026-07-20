// Hardcoded realistic demo data for the /demo route

export const demoSponsorships = {
  prospecting: [
    { id: 1, brand: 'Nike Running', amount: 4800, notes: 'Reached out via email. Interest in 2-part YouTube integration.', status: 'prospecting' },
    { id: 2, brand: 'Skillshare', amount: 3500, notes: 'Applied through their creator program. Waiting for response.', status: 'prospecting' },
  ],
  negotiating: [
    { id: 3, brand: 'Notion', amount: 6000, notes: 'Counter-offer sent. Discussing deliverables and timeline.', status: 'negotiating' },
    { id: 4, brand: 'Squarespace', amount: 4200, notes: 'Rate negotiation in progress. Their initial offer was $3,200.', status: 'negotiating' },
  ],
  confirmed: [
    { id: 5, brand: 'Adobe Creative Cloud', amount: 7500, notes: 'Contract signed! 3-month campaign starting next month.', status: 'confirmed' },
    { id: 6, brand: 'Epidemic Sound', amount: 2500, notes: 'One-off dedicated video. Brief received.', status: 'confirmed' },
  ],
  completed: [
    { id: 7, brand: 'Audible', amount: 5500, notes: 'Campaign wrap-up submitted. Performance report sent.', status: 'completed' },
    { id: 8, brand: 'Grammarly', amount: 3200, notes: '60-second integration delivered. Payment received.', status: 'completed' },
  ],
}

export const demoLeads = [
  { id: 1, name: 'Sarah Chen', email: 'sarah@brightco.com', source: 'Landing Page', captured: '2 hours ago' },
  { id: 2, name: 'Marcus Rivera', email: 'marcus@zenmedia.io', source: 'YouTube Bio', captured: '5 hours ago' },
  { id: 3, name: 'Emma Fitzgerald', email: 'emma@purebrands.com', source: 'Newsletter CTA', captured: '1 day ago' },
  { id: 4, name: 'James Okonkwo', email: 'james@frontier.gg', source: 'Instagram Link', captured: '2 days ago' },
  { id: 5, name: 'Lisa Park', email: 'lisa@elevate.co', source: 'Direct', captured: '3 days ago' },
  { id: 6, name: 'David Kim', email: 'david@nexusagency.com', source: 'Landing Page', captured: '4 days ago' },
]

export const demoFunnel = {
  visitors: 4280,
  signups: 1240,
  leads: 186,
  qualified: 42,
}

export const demoProducts = [
  { id: 1, title: 'Ultimate Lighting Presets', type: 'Presets', price: 29, sales: 312, revenue: 9048, trend: '+18%' },
  { id: 2, title: 'Content Calendar Template', type: 'Templates', price: 19, sales: 245, revenue: 4655, trend: '+12%' },
  { id: 3, title: 'Brand Pitch Deck Kit', type: 'Templates', price: 49, sales: 183, revenue: 8967, trend: '+22%' },
  { id: 4, title: 'Video Editing Guide', type: 'Guide', price: 34, sales: 156, revenue: 5304, trend: '+8%' },
  { id: 5, title: 'YouTube Growth Toolkit', type: 'Toolkit', price: 39, sales: 128, revenue: 4992, trend: '+15%' },
]

export const demoRevenueTrend = [
  { month: 'Jan', sponsorships: 3200, affiliates: 1200, products: 600 },
  { month: 'Feb', sponsorships: 3500, affiliates: 1350, products: 720 },
  { month: 'Mar', sponsorships: 4100, affiliates: 1500, products: 650 },
  { month: 'Apr', sponsorships: 3800, affiliates: 1600, products: 780 },
  { month: 'May', sponsorships: 4500, affiliates: 1750, products: 850 },
  { month: 'Jun', sponsorships: 4250, affiliates: 1840, products: 890 },
]

export const demoPipelineData = [
  { name: 'Prospecting', deals: 2 },
  { name: 'Negotiating', deals: 2 },
  { name: 'Confirmed', deals: 2 },
  { name: 'Completed', deals: 2 },
]

export const demoRevenueBreakdown = [
  { name: 'Sponsorships', value: 4250 },
  { name: 'Affiliates', value: 1840 },
  { name: 'Products', value: 890 },
  { name: 'Consulting', value: 500 },
]

export const demoRecentActivity = [
  { action: 'Deal moved to Completed', brand: 'Audible', amount: 5500 },
  { action: 'New affiliate signup', brand: 'Notion', amount: 0 },
  { action: 'Lead captured', brand: 'Sarah Chen (BrightCo)', amount: 0 },
  { action: 'Product sale', brand: 'Lighting Presets ×2', amount: 58 },
]
