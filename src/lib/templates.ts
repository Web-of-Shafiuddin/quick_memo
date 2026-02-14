export interface Template {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  profession: string;
  heroHeading: string;
  heroSubheading: string;
  features: string[];
  ctaText: string;
  keywords: string[];
}

export const templates: Template[] = [
  {
    slug: "photography-receipt",
    title: "Photography Receipt Template",
    metaTitle: "Free Photography Receipt Maker | Digital Invoice for Photographers",
    metaDescription:
      "Create professional photography receipts and invoices in seconds. Free digital receipt maker designed for photographers. Track sessions, print proofs, and manage client payments.",
    profession: "Photographers",
    heroHeading: "Free Photography Receipt & Invoice Maker",
    heroSubheading:
      "Create professional receipts for photo sessions, print orders, and event photography. Send branded invoices to clients instantly.",
    features: [
      "Itemize photo session packages, prints, and editing fees",
      "Add your photography studio branding and logo",
      "Send digital receipts via email or WhatsApp",
      "Track client payments and outstanding balances",
      "Manage repeat clients with built-in customer database",
      "Works on any device — desktop, tablet, or phone",
    ],
    ctaText: "Create Photography Receipt Free",
    keywords: [
      "photography invoice maker",
      "photographer receipt template",
      "photo session invoice",
      "photography billing software",
    ],
  },
  {
    slug: "freelance-writer-invoice",
    title: "Freelance Writer Invoice Template",
    metaTitle: "Free Freelance Writer Invoice Maker | Professional Invoice Generator",
    metaDescription:
      "Generate professional invoices for freelance writing projects. Free invoice maker for content writers, copywriters, and bloggers. Track articles, word counts, and payments.",
    profession: "Freelance Writers",
    heroHeading: "Free Invoice Maker for Freelance Writers",
    heroSubheading:
      "Create professional invoices for articles, blog posts, and copywriting projects. Get paid faster with branded, itemized invoices.",
    features: [
      "Itemize articles, blog posts, and copywriting projects",
      "Track per-word or per-project rates automatically",
      "Add your freelance brand logo and contact details",
      "Send invoices directly to clients via email",
      "Monitor payment status and overdue invoices",
      "Export receipts as PDF for your records",
    ],
    ctaText: "Create Writer Invoice Free",
    keywords: [
      "freelance writer invoice",
      "content writer invoice template",
      "copywriter billing",
      "freelance invoice generator",
    ],
  },
  {
    slug: "bakery-order-form",
    title: "Bakery Order Form Template",
    metaTitle: "Free Bakery Order Form & Receipt Maker | Invoice for Bakers",
    metaDescription:
      "Create professional bakery order forms, receipts, and invoices. Perfect for home bakers, cake shops, and pastry businesses selling on social media.",
    profession: "Bakers & Pastry Shops",
    heroHeading: "Free Bakery Order Form & Receipt Maker",
    heroSubheading:
      "Manage cake orders, pastry deliveries, and bakery sales with professional order forms and digital receipts.",
    features: [
      "Create order forms for custom cakes and pastries",
      "Track delivery dates and special instructions",
      "Generate branded receipts for every bakery order",
      "Manage customer preferences and repeat orders",
      "Accept orders from social media and your online shop",
      "Inventory tracking for ingredients and finished products",
    ],
    ctaText: "Create Bakery Order Form Free",
    keywords: [
      "bakery order form",
      "cake order invoice",
      "baker receipt template",
      "pastry shop billing",
    ],
  },
  {
    slug: "handmade-crafts-invoice",
    title: "Handmade Crafts Invoice Template",
    metaTitle: "Free Handmade Crafts Invoice Maker | Receipt for Artisans",
    metaDescription:
      "Create beautiful invoices for handmade crafts, jewelry, and artisan products. Perfect for Etsy sellers, craft fair vendors, and social media artisans.",
    profession: "Artisans & Craft Sellers",
    heroHeading: "Free Invoice Maker for Handmade Crafts",
    heroSubheading:
      "Professional invoices and receipts for handmade jewelry, crafts, and artisan products. Perfect for Etsy, craft fairs, and social commerce.",
    features: [
      "Create branded invoices that match your artisan style",
      "Itemize materials, labor, and shipping costs",
      "Track custom orders and commissions",
      "Manage craft fair and online sales in one place",
      "Send receipts via WhatsApp, email, or social media DMs",
      "Customer database for repeat buyers and collectors",
    ],
    ctaText: "Create Crafts Invoice Free",
    keywords: [
      "handmade invoice template",
      "craft seller receipt",
      "artisan invoice maker",
      "Etsy seller invoice",
    ],
  },
  {
    slug: "tutoring-receipt",
    title: "Tutoring Receipt Template",
    metaTitle: "Free Tutoring Receipt & Invoice Maker | Tutor Billing Software",
    metaDescription:
      "Generate professional tutoring receipts and invoices. Track sessions, hours, and student payments. Free invoice maker for tutors and online educators.",
    profession: "Tutors & Educators",
    heroHeading: "Free Tutoring Receipt & Invoice Maker",
    heroSubheading:
      "Create professional receipts for tutoring sessions, online classes, and educational services. Track hours, students, and payments effortlessly.",
    features: [
      "Track tutoring sessions with date, time, and subject",
      "Calculate fees based on hourly or per-session rates",
      "Generate monthly invoices for recurring students",
      "Send receipts to parents or students instantly",
      "Manage multiple students and class schedules",
      "Export session reports and payment history",
    ],
    ctaText: "Create Tutoring Receipt Free",
    keywords: [
      "tutoring invoice maker",
      "tutor receipt template",
      "online tutor billing",
      "education invoice generator",
    ],
  },
  {
    slug: "fitness-trainer-invoice",
    title: "Fitness Trainer Invoice Template",
    metaTitle: "Free Fitness Trainer Invoice Maker | Personal Trainer Billing",
    metaDescription:
      "Create professional invoices for personal training sessions, gym memberships, and fitness coaching. Free receipt maker for fitness professionals.",
    profession: "Fitness Trainers",
    heroHeading: "Free Invoice Maker for Fitness Trainers",
    heroSubheading:
      "Professional invoices and receipts for personal training sessions, group classes, and fitness coaching packages.",
    features: [
      "Invoice for individual sessions or package deals",
      "Track client attendance and session history",
      "Generate monthly billing for recurring clients",
      "Add your fitness brand logo and certifications",
      "Send receipts via WhatsApp or email after sessions",
      "Manage client database with fitness goals and notes",
    ],
    ctaText: "Create Trainer Invoice Free",
    keywords: [
      "personal trainer invoice",
      "fitness trainer receipt",
      "gym billing software",
      "trainer billing template",
    ],
  },
  {
    slug: "beauty-salon-receipt",
    title: "Beauty Salon Receipt Template",
    metaTitle: "Free Beauty Salon Receipt Maker | Salon Invoice Generator",
    metaDescription:
      "Create professional salon receipts and invoices for hair, beauty, and spa services. Free receipt maker for salons and independent beauty professionals.",
    profession: "Beauty & Salon Professionals",
    heroHeading: "Free Beauty Salon Receipt & Invoice Maker",
    heroSubheading:
      "Professional receipts for hair styling, beauty treatments, and spa services. Build client trust with branded, itemized invoices.",
    features: [
      "Itemize services like haircut, color, manicure, and spa",
      "Add product sales to service invoices",
      "Track client appointment history and preferences",
      "Send digital receipts to clients instantly",
      "Manage walk-in and appointment-based billing",
      "Loyalty tracking for repeat customers",
    ],
    ctaText: "Create Salon Receipt Free",
    keywords: [
      "beauty salon invoice",
      "salon receipt template",
      "hair stylist billing",
      "spa invoice maker",
    ],
  },
  {
    slug: "food-delivery-receipt",
    title: "Food Delivery Receipt Template",
    metaTitle: "Free Food Delivery Receipt Maker | Restaurant Invoice Generator",
    metaDescription:
      "Create professional food delivery receipts and invoices. Perfect for home cooks, cloud kitchens, and restaurants selling on social media.",
    profession: "Food Delivery & Cloud Kitchens",
    heroHeading: "Free Food Delivery Receipt & Invoice Maker",
    heroSubheading:
      "Professional receipts and order forms for food delivery, catering, and cloud kitchen operations. Manage orders from social media in one place.",
    features: [
      "Create itemized receipts for food orders",
      "Track delivery addresses and special dietary requests",
      "Manage orders from Facebook, Instagram, and WhatsApp",
      "Generate daily and weekly sales reports",
      "Customer database with order preferences",
      "Menu management with pricing and availability",
    ],
    ctaText: "Create Food Delivery Receipt Free",
    keywords: [
      "food delivery invoice",
      "restaurant receipt maker",
      "cloud kitchen billing",
      "catering invoice template",
    ],
  },
];

export function getTemplateBySlug(slug: string): Template | undefined {
  return templates.find((t) => t.slug === slug);
}

export function getAllTemplateSlugs(): string[] {
  return templates.map((t) => t.slug);
}
