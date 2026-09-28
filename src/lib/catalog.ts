export type CategoryId =
  "customer-care" | "marketing" | "sales" | "operations" | "finance" | "people";
export type ArtKind =
  "message" | "calendar" | "document" | "checklist" | "report" | "people";
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  promise: string;
  price: number;
  kind: ArtKind;
  tone: string;
  format: "Guided workspace" | "Downloadable toolkit";
  outputTitle: string;
  outputLabel: string;
  outputLines: string[];
  deliverables: string[];
  input: string;
  audience: string;
  requirement: string;
};
export const categories: {
  id: CategoryId;
  name: string;
  short: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "customer-care",
    name: "Customer care",
    short: "Look after your customers.",
    description:
      "Thoughtful replies, clear answers, and a little more care in every conversation.",
    icon: "messages",
  },
  {
    id: "marketing",
    name: "Marketing & content",
    short: "Find the right words.",
    description:
      "Turn what makes your business special into something worth reading.",
    icon: "pen",
  },
  {
    id: "sales",
    name: "Sales & growth",
    short: "Make the next connection.",
    description: "Bring clarity to your offers and care to your follow-ups.",
    icon: "growth",
  },
  {
    id: "operations",
    name: "Everyday operations",
    short: "Give your day some order.",
    description:
      "Less loose information. More clear next steps for the work behind the work.",
    icon: "layers",
  },
  {
    id: "finance",
    name: "Money & admin",
    short: "Stay on top of the details.",
    description:
      "Organize the small administrative jobs that keep your business moving.",
    icon: "wallet",
  },
  {
    id: "people",
    name: "People & hiring",
    short: "Help your people thrive.",
    description:
      "Make joining, learning, and working together feel more considered.",
    icon: "people",
  },
];
type Seed = [
  string,
  CategoryId,
  string,
  number,
  ArtKind,
  string,
  string,
  string[],
  string,
];
const seeds: Seed[] = [
  [
    "Customer Reply Studio",
    "customer-care",
    "A thoughtful reply. In your voice.",
    39,
    "message",
    "sage",
    "A little care goes a long way.",
    [
      "Thanks for getting in touch, Alex.",
      "We’d be happy to find a time that works for you.",
      "How does Thursday afternoon sound?",
    ],
    "A customer message and a few notes about your business",
  ],
  [
    "Content Calendar",
    "marketing",
    "Turn your ideas into a month of content.",
    29,
    "calendar",
    "peach",
    "A month with a little more intention.",
    [
      "Behind the scenes",
      "A useful little tip",
      "Meet the people",
      "Something worth sharing",
    ],
    "Your business description, topics, and upcoming dates",
  ],
  [
    "Proposal Builder",
    "sales",
    "Put your best offer on the page.",
    49,
    "document",
    "sand",
    "Good work starts with a clear plan.",
    [
      "Prepared for Oak & Co.",
      "01  The opportunity",
      "02  Our approach",
      "03  Your investment",
    ],
    "A project brief, scope, and your pricing",
  ],
  [
    "Meeting to Action",
    "operations",
    "Good conversations. Clear next steps.",
    24,
    "checklist",
    "blue",
    "From conversation to action.",
    [
      "Send the revised outline",
      "Confirm the launch date",
      "Share the first draft",
    ],
    "Your meeting notes or a transcript",
  ],
  [
    "Invoice Follow-up",
    "finance",
    "A friendly nudge for outstanding invoices.",
    19,
    "message",
    "butter",
    "A gentle reminder.",
    [
      "Hi Morgan, a quick note from us.",
      "Just checking in on invoice #1042.",
      "Let us know if you need anything.",
    ],
    "Invoice details and your preferred tone",
  ],
  [
    "Welcome Kit",
    "people",
    "Make someone’s first day feel considered.",
    35,
    "people",
    "rose",
    "A good place to begin.",
    ["Welcome to the team", "Your first week", "The people to know"],
    "Your team information and onboarding checklist",
  ],
  [
    "FAQ Maker",
    "customer-care",
    "Clear answers to the questions you hear most.",
    24,
    "document",
    "sand",
    "Good questions. Clear answers.",
    ["How do bookings work?", "Can I change my order?", "What happens next?"],
    "Your common customer questions and business policies",
  ],
  [
    "Review Response Desk",
    "customer-care",
    "Respond to feedback with care.",
    19,
    "message",
    "rose",
    "Thank you for sharing.",
    [
      "We appreciate you taking the time.",
      "Your feedback helps us understand.",
      "Here’s how we can help.",
    ],
    "A customer review and the relevant context",
  ],
  [
    "Customer Welcome Notes",
    "customer-care",
    "Start every new relationship thoughtfully.",
    19,
    "message",
    "blue",
    "You’re in good hands.",
    [
      "A warm welcome from all of us.",
      "Here’s what happens next.",
      "We’re here if you need a hand.",
    ],
    "Your customer journey and welcome information",
  ],
  [
    "Newsletter Workshop",
    "marketing",
    "Something your customers will want to open.",
    35,
    "document",
    "sage",
    "A note from the studio.",
    ["The monthly edit", "Something new", "One useful idea", "Until next time"],
    "Your news, updates, and customer audience",
  ],
  [
    "Product Copy Studio",
    "marketing",
    "Give good products the words they deserve.",
    29,
    "document",
    "butter",
    "Made for the everyday.",
    ["The details that matter", "Thoughtfully designed", "A closer look"],
    "Product features, materials, and intended uses",
  ],
  [
    "Social Caption Kit",
    "marketing",
    "Find a fresh way to say it.",
    19,
    "calendar",
    "rose",
    "A small story, well told.",
    [
      "Share the process",
      "Spotlight a detail",
      "Start a conversation",
      "Keep it simple",
    ],
    "An image description, topic, and brand voice",
  ],
  [
    "Lead Follow-up",
    "sales",
    "Keep a good conversation moving.",
    29,
    "message",
    "blue",
    "Picking up where we left off.",
    [
      "It was lovely speaking with you.",
      "I’ve put together a few ideas.",
      "Shall we find a time to talk?",
    ],
    "Your conversation notes and proposed next step",
  ],
  [
    "Service Menu",
    "sales",
    "Make your services easy to choose.",
    29,
    "document",
    "peach",
    "Find your right fit.",
    ["The essentials", "A little more support", "The complete service"],
    "Your services, inclusions, and prices",
  ],
  [
    "Discovery Call Prep",
    "sales",
    "Walk into the conversation prepared.",
    19,
    "checklist",
    "sage",
    "Better questions. Better beginnings.",
    [
      "Understand the business",
      "Explore the opportunity",
      "Agree on the next step",
    ],
    "A prospect’s brief and your service information",
  ],
  [
    "Process Playbook",
    "operations",
    "Turn the way you work into a clear guide.",
    39,
    "checklist",
    "sand",
    "A better way, written down.",
    ["Before you begin", "The step-by-step", "A final check"],
    "Your process notes and desired outcome",
  ],
  [
    "Weekly Planner",
    "operations",
    "Make room for the work that matters.",
    19,
    "calendar",
    "sage",
    "A little space to focus.",
    [
      "The big priorities",
      "Room for deep work",
      "The everyday essentials",
      "Time to look ahead",
    ],
    "Your tasks, deadlines, and available time",
  ],
  [
    "Project Brief",
    "operations",
    "Get everyone starting on the same page.",
    24,
    "document",
    "rose",
    "One page. A shared direction.",
    ["What we’re making", "Who it’s for", "What success looks like"],
    "Your project goals, audience, scope, and constraints",
  ],
  [
    "Expense Organizer",
    "finance",
    "Bring a little order to your expenses.",
    25,
    "report",
    "sage",
    "Everything in its place.",
    ["Software & subscriptions", "Supplies & materials", "Travel & meetings"],
    "An expense list with dates, amounts, and descriptions",
  ],
  [
    "Business Week in Review",
    "finance",
    "See your week more clearly.",
    29,
    "report",
    "blue",
    "The week, at a glance.",
    ["What came in", "What went out", "What needs your attention"],
    "Your weekly business figures and notes",
  ],
  [
    "Subscription Checkup",
    "finance",
    "Know what you’re paying for.",
    19,
    "report",
    "peach",
    "A clearer picture of the small costs.",
    [
      "Your active subscriptions",
      "The upcoming renewals",
      "Worth another look",
    ],
    "A list of your subscriptions, costs, and renewal dates",
  ],
  [
    "Job Description Studio",
    "people",
    "Explain the role. Attract the right fit.",
    29,
    "document",
    "blue",
    "Good people start with a clear role.",
    ["About the role", "What you’ll do", "What we’re looking for"],
    "Role responsibilities, working arrangements, and pay range",
  ],
  [
    "Interview Companion",
    "people",
    "Give every conversation a clear purpose.",
    24,
    "checklist",
    "butter",
    "Make space for a good conversation.",
    [
      "A warm introduction",
      "Questions with purpose",
      "Room for their questions",
    ],
    "Your role description and assessment criteria",
  ],
  [
    "Team Update",
    "people",
    "Keep everyone in the picture.",
    19,
    "people",
    "sage",
    "A note to keep us connected.",
    ["This week’s focus", "A few things to know", "Coming up next"],
    "Your team news, decisions, and upcoming priorities",
  ],
];
export const products: Product[] = seeds.map((s, i) => ({
  id: `SDH-${String(i + 1).padStart(3, "0")}`,
  slug: s[0]
    .toLowerCase()
    .replaceAll("’", "")
    .replaceAll(/[^a-z0-9]+/g, "-"),
  name: s[0],
  category: s[1],
  promise: s[2],
  price: s[3],
  kind: s[4],
  tone: s[5],
  outputTitle: s[6],
  outputLabel: {
    message: "A thoughtful draft",
    calendar: "Your content, organized",
    document: "A clear starting point",
    checklist: "Ready for your next step",
    report: "A useful overview",
    people: "Made for your people",
  }[s[4]],
  outputLines: s[7],
  input: s[8],
  format: i % 5 === 0 ? "Downloadable toolkit" : "Guided workspace",
  deliverables:
    s[0] === "Customer Reply Studio"
      ? [
          "A reply draft tailored to your customer’s message",
          "Three tone options: warm, concise, and formal",
          "A reusable business-voice profile",
          "A simple review checklist before you send",
        ]
      : [
          `An editable ${s[0].toLowerCase()} output`,
          "A guided input worksheet",
          "An example to help you get started",
          "A final review checklist",
        ],
  audience: categories.find((c) => c.id === s[1])!.short,
  requirement:
    "A modern web browser and your business information. No coding required.",
}));
export const collections = [
  {
    slug: "a-lighter-workday",
    name: "A lighter workday.",
    eyebrow: "THE EVERYDAY EDIT",
    description:
      "A few well-chosen helpers for the jobs that quietly fill your day.",
    ids: [
      "customer-reply-studio",
      "meeting-to-action",
      "invoice-follow-up",
      "weekly-planner",
    ],
    tone: "sage",
  },
  {
    slug: "find-your-voice",
    name: "Find your voice.",
    eyebrow: "WORDS THAT WORK",
    description:
      "Clearer words. More of you. Thoughtful tools for telling your business’s story.",
    ids: [
      "newsletter-workshop",
      "product-copy-studio",
      "social-caption-kit",
      "content-calendar",
    ],
    tone: "peach",
  },
  {
    slug: "room-to-grow",
    name: "Room to grow.",
    eyebrow: "YOUR NEXT CHAPTER",
    description:
      "Put your best foot forward, from the first conversation to the first day.",
    ids: [
      "proposal-builder",
      "lead-follow-up",
      "welcome-kit",
      "job-description-studio",
    ],
    tone: "blue",
  },
];
export const categoryFor = (id: CategoryId) =>
  categories.find((c) => c.id === id)!;
