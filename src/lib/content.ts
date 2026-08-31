export type Charity = {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  iconKey: string;
};

export type ProductEntry = {
  id: string;
  name: string;
  price: string;
  entries: string;
  imageUrl: string;
  productUrl: string;
};

export type SiteContent = {
  nav: {
    aboutLabel: string;
    howItWorksLabel: string;
    moreEntriesLabel: string;
    beyondLabel: string;
    rulesLabel: string;
    enterButton: string;
  };
  moreEntries: {
    heading: string;
    subheading: string;
    description: string;
    freeEntryNote: string;
    disclosure: string;
    products: ProductEntry[];
  };
  rules: {
    lastUpdated: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    viewCarText: string;
    note: string;
    heroImage: string;
  };
  moreThanDriving: {
    staticPrefix: string;
    cyclingWords: string[];
    closingLine: string;
    viewCarText: string;
    backgroundImage: string;
  };
  howItWorks: {
    heading: string;
    steps: { num: string; title: string; text: string }[];
  };
  giveaway: {
    heading: string;
    subheading: string;
    viewCarText: string;
    vehicleImage: string;
  };
  car: {
    title: string;
    subtitle: string;
    specs: { label: string; value: string }[];
    features: string[];
    gallery: { src: string; label: string }[];
    enterCtaText: string;
  };
  causes: {
    badgeText: string;
    heading: string;
    subheading: string;
    charityBadge: string;
    charityHeading: string;
    charityDescription: string;
    charityCtaText: string;
    charities: Charity[];
    donationDisclaimer: string;
  };
  donateCar: {
    badgeText: string;
    heading: string;
    description: string;
    ctaText: string;
    submitButtonText: string;
    successTitle: string;
    successMessage: string;
    requirements: string[];
  };
  nextMile: {
    introText: string;
    words: string[];
  };
  closing: {
    headline: string;
    subheadline: string;
    ctaText: string;
    brandName: string;
    brandTagline: string;
    closingImage: string;
  };
  branding: {
    brandName: string;
    brandTagline: string;
    footerNote: string;
    copyright: string;
    logoUrl: string;
  };
};

export const CHARITY_ICONS: Record<string, string> = {
  PawPrint: 'PawPrint',
  Baby: 'Baby',
  Home: 'Home',
  Ribbon: 'Ribbon',
  Users: 'Users',
  GraduationCap: 'GraduationCap',
  Heart: 'Heart',
  Leaf: 'Leaf',
  Stethoscope: 'Stethoscope',
  Globe: 'Globe',
  HandHeart: 'HandHeart',
  Droplet: 'Droplet',
};

export const DEFAULT_CONTENT: SiteContent = {
  nav: {
    aboutLabel: 'About',
    howItWorksLabel: 'How It Works',
    moreEntriesLabel: 'Extra Entries',
    beyondLabel: 'Beyond the Giveaway',
    rulesLabel: 'Official Rules',
    enterButton: 'ENTER THE GIVEAWAY',
  },
  moreEntries: {
    heading: 'CLAIM YOUR FREE DAILY ENTRY',
    subheading: 'Want extra entries?',
    description: 'Browse products below. Each purchase earns additional entries into the giveaway.',
    freeEntryNote: 'Everyone receives one free entry per giveaway — no purchase required.',
    disclosure: 'No purchase necessary. Free entry is available to eligible participants. See Official Rules for complete entry details.',
    products: [
      { id: 'power-bank', name: 'POWER BANK', price: '$54.91', entries: '549 ENTRIES', imageUrl: '', productUrl: '' },
      { id: 'trekker-tent', name: 'TREKKER TENT 2.2', price: '$75–$125', entries: '750–1,250 ENTRIES', imageUrl: '', productUrl: '' },
      { id: 'fenix-cl26r', name: 'FENIX CL26R PRO', price: '$79.95', entries: '799 ENTRIES', imageUrl: '', productUrl: '' },
      { id: 'car-jump-starter', name: 'CAR JUMP STARTER', price: '$149.99', entries: '1,499 ENTRIES', imageUrl: '', productUrl: '' },
    ],
  },
  rules: {
    lastUpdated: 'August 2026',
  },
  hero: {
    headline: 'NEXT MILE',
    subheadline: "here's to getting there.",
    ctaText: 'Enter the Giveaway',
    note: 'No purchase necessary.',
    heroImage: 'https://images.pexels.com/photos/7824262/pexels-photo-7824262.jpeg?auto=compress&cs=tinysrgb&w=1920',
    viewCarText: 'View',
  },
  moreThanDriving: {
    staticPrefix: "IT'S",
    cyclingWords: ['OPPORTUNITY', 'POSSIBILITY', 'PURPOSE', 'HOPE', 'DIRECTION', 'MOMENTUM'],
    closingLine: 'Your next mile is within reach.',
    viewCarText: 'View',
    backgroundImage: 'https://images.pexels.com/photos/7824262/pexels-photo-7824262.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  howItWorks: {
    heading: 'HOW IT WORKS',
    steps: [
      { num: '01', title: 'ENTER', text: 'Claim your free entry. No purchase necessary.' },
      { num: '02', title: 'WAIT', text: 'A winner is randomly selected after the giveaway ends.' },
      { num: '03', title: 'DRIVE', text: 'The winner takes the keys. Their next mile is on us.' },
    ],
  },
  giveaway: {
    heading: 'Your next mile is within reach.',
    subheading: 'One entry. One winner. One set of keys.',
    viewCarText: 'View',
    vehicleImage: '/cars/01-main.jpeg',
  },
  car: {
    title: '2020 Mercedes-Benz C-Class C 300 Sedan 4MATIC',
    subtitle: '61,749 mi. · Clean title · 1 previous owner',
    specs: [
      { label: 'Year', value: '2020' },
      { label: 'Make / Model', value: 'Mercedes-Benz C-Class C 300 Sedan 4MATIC' },
      { label: 'Mileage', value: '61,749 mi.' },
      { label: 'Engine', value: '255 hp 2L I4 Turbo' },
      { label: 'Transmission', value: '9-Speed Automatic (9G-Tronic)' },
      { label: 'Drivetrain', value: 'All-Wheel Drive (4MATIC)' },
      { label: 'Exterior', value: 'Black' },
      { label: 'Interior', value: 'Black Leather' },
    ],
    features: ['KEYLESS-GO', 'Panorama Roof', 'Dual Power Seats', 'Apple CarPlay', 'Backup Camera', 'Blind-Spot Assist', 'Premium LED Headlamps', 'Heated Seats'],
    gallery: [
      { src: '/cars/01-main.jpeg', label: 'Front — Main' },
      { src: '/cars/02.jpeg', label: 'Exterior View' },
      { src: '/cars/03.jpeg', label: 'Side Profile' },
      { src: '/cars/04.jpeg', label: 'Rear View' },
      { src: '/cars/05.jpeg', label: 'Interior' },
      { src: '/cars/06.jpeg', label: 'Detail' },
      { src: '/cars/07.jpeg', label: 'Additional View' },
    ],
    enterCtaText: 'Enter to Win This Car',
  },
  causes: {
    badgeText: 'Beyond the Giveaway',
    heading: 'Help someone else reach their NEXT MILE',
    subheading: "There's more than one way to give back. Support a charity of your choice or donate a vehicle to NEXT MILE.",
    charityBadge: 'GIVE WITH PURPOSE.',
    charityHeading: 'Donate to a Charity',
    charityDescription: "Choose a charity that matters to you. Your donation goes directly to them and is completely separate from the NEXT MILE giveaway.",
    charityCtaText: 'Choose a Charity',
    donationDisclaimer: "Donations are separate from the giveaway and do not provide entries or improve your odds. Charity donations go directly to the charity's official page; NEXT MILE does not handle them. NEXT MILE is not a registered nonprofit. Direct donations help cover hosting, operations, and future giveaways. Please verify charities through Charity Navigator or BBB Wise Giving Alliance.",
    charities: [
      { id: 'feeding-america', name: 'Feeding America', category: '', url: 'https://www.feedingamerica.org/donate', description: 'The nation\'s largest domestic hunger-relief organization, serving millions through food banks nationwide.', iconKey: 'Droplet' },
      { id: 'habitat', name: 'Habitat for Humanity', category: '', url: 'https://www.habitat.org/donate', description: 'Builds and repairs homes for families in need of safe, affordable shelter.', iconKey: 'Home' },
      { id: 'st-jude', name: 'St. Jude Children\'s Research Hospital', category: '', url: 'https://www.stjude.org/donate', description: 'Treats and defeats childhood catastrophic diseases, and families never receive a bill.', iconKey: 'Baby' },
      { id: 'american-heart', name: 'American Heart Association', category: '', url: 'https://www.heart.org/en/404', description: 'Funds lifesaving research and education to fight heart disease and stroke.', iconKey: 'Heart' },
    ],
  },
  donateCar: {
    badgeText: 'PASS THE KEYS FORWARD.',
    heading: 'Donate a Car',
    description: "Have a vehicle you no longer need? Donate it to NEXT MILE. We'll put it toward future giveaways and help someone else get behind the wheel.",
    ctaText: 'Donate a Car',
    submitButtonText: 'Submit Your Vehicle',
    successTitle: 'Thank you.',
    successMessage: "Your vehicle donation offer has been received. We'll review the details and reach out to you at the email you provided if your car is a good fit for a future giveaway.",
    requirements: ['Clean title only', 'Must run and drive', 'No accidents reported', 'Up-to-date on maintenance'],
  },
  nextMile: {
    introText: 'NEXT MILE MEANS MORE.',
    words: ['A WAY TO DRIVE.', 'A CHANCE TO START.', 'A REASON TO HOPE.'],
  },
  closing: {
    headline: 'Everyone deserves a NEXT MILE.',
    subheadline: "here's to getting there.",
    ctaText: 'View & Enter',
    brandName: 'NEXT MILE',
    brandTagline: 'have it on us.',
    closingImage: 'https://images.pexels.com/photos/20272816/pexels-photo-20272816.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  branding: {
    brandName: 'NEXT MILE',
    brandTagline: 'have it on us.',
    footerNote: 'No purchase necessary. Free entry is available to eligible participants. See Official Rules for complete entry details.',
    copyright: '© 2026 NEXT MILE — here\'s to getting there.',
    logoUrl: '/nm-logo.webp',
  },
};
