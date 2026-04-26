// ─── EXAMPLE 2: Brand Strategist ─────────────────────────────────────────────
// Swap this in as config.js to use this demo instead.

import photo from "./assets/demo-profile-3.png";

export const config = {
  configVersion: 8,

  // Personal
  name: "David Chen",
  role: "Brand Strategist & Creative Director",
  email: "david.chen@example.com",
  phone: "+1 (415) 763-0291",

  // About section
  aboutTitle: "About Me",
  aboutText: `I'm a Brand Strategist based in Brooklyn with 9 years of experience helping startups and Fortune 500s shape stories that stick. From identity systems to launch campaigns, I've worked across fintech, lifestyle, and B2B SaaS.

I specialise in turning fuzzy ideas into sharp positioning, cohesive visual languages, and creative work that actually moves the needle. Strategy and craft are inseparable to me — every detail earns its place.`,

  // Resume / LinkedIn buttons
  showResume: true,
  showLinkedin: true,
  resumeUrl: "/resume.pdf",
  linkedinUrl: "https://www.linkedin.com/",

  // Socials
  socialLinkedin: "https://www.linkedin.com/",
  socialInstagram: "",
  socialFacebook: "",
  socialTwitter: "",
  socialGithub: "",

  // Extra nav links
  navLinks: [],

  // Photo
  photo: photo,
  photoShape: 'pill',
  photoPosX: 0,
  photoPosY: 0,
  photoZoom: 1,
  photoBgMode: 'transparent',  // showcasing the transparent PNG
  photoBgColor: '#ffffff',
  photoFadeEdges: 0,

  // Animation
  animationEnabled: true,
  animationSpeed: 0.8,

  // Theme
  darkMode: false,

  // SEO
  seoTitle: "David Chen — Brand Strategist & Creative Director",
  seoDescription: "Portfolio of David Chen — Brooklyn-based Brand Strategist specialising in identity systems, positioning, and creative direction.",

  // Fonts
  headingFont: "Lora",
  bodyFont: "Inter",

  // Colors — warm slate/indigo
  bgColor: "#f5f4f7",
  blobColor1: "#c7d2fe",
  blobColor2: "#e0e7ff",
  blobColor3: "#ddd6fe",

  // Button colors
  buttonBgColor: "#4338ca",
  buttonTextColor: "#ffffff",
  buttonBorderColor: "#4338ca",

  // Social icon color
  socialBgColor: "transparent",
  socialIconColor: "#4338ca",
};

export const FONT_OPTIONS = [
  "Lora",
  "Playfair Display",
  "DM Sans",
  "Inter",
  "Poppins",
  "Space Grotesk",
];
