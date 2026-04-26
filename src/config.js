// ─── DEFAULT CONFIG ──────────────────────────────────────────────────────────
// You can edit this file directly OR click the gear icon on your live site
// to open the settings panel — the panel will let you edit everything visually,
// then export a new config.js file to paste in here.

import photo from "./assets/demo-profile.jpg";

export const config = {
  // Bump this number any time you change config.js to clear stale localStorage
  configVersion: 3,

  // Personal
  name: "Jamie Carter",
  role: "Senior Marketing Manager",
  email: "jamie.carter@example.com",
  phone: "+1 (310) 555-0192",

  // About section
  aboutTitle: "About Me",
  aboutText: `I'm a Senior Marketing Manager based in New York with 7+ years of experience driving brand growth and revenue for B2B and B2C companies. I've led campaigns across paid media, content, and social that have generated millions in pipeline.

I thrive at the intersection of strategy and creativity — whether that's building a go-to-market plan from scratch, managing a high-performing team, or crafting messaging that actually converts.`,

  // Resume / LinkedIn buttons
  showResume: true,
  showLinkedin: true,
  resumeUrl: "/resume.pdf",
  linkedinUrl: "https://www.linkedin.com/",

  // Socials — leave empty string "" to hide an icon
  socialLinkedin: "https://www.linkedin.com/",
  socialInstagram: "https://www.instagram.com/",
  socialFacebook: "",
  socialTwitter: "",
  socialGithub: "https://github.com/",

  // Extra nav links — add { label, url } objects to show extra pages/links in the header
  navLinks: [],

  // Photo
  photo: photo,
  photoShape: 'pill',
  photoPosX: 0,
  photoPosY: 0,
  photoZoom: 1,

  // Animation
  animationEnabled: true,
  animationSpeed: 1,

  // Theme
  darkMode: true,

  // SEO
  seoTitle: "Jamie Carter — Senior Marketing Manager",
  seoDescription: "Portfolio of Jamie Carter — New York-based Senior Marketing Manager specialising in brand growth, go-to-market strategy, and performance campaigns.",

  // Fonts — pick from: 'Lora', 'Playfair Display', 'DM Sans', 'Inter', 'Poppins', 'Space Grotesk'
  headingFont: "Playfair Display",
  bodyFont: "Inter",

  // Colors
  bgColor: "#0e0c1a",
  blobColor1: "#3b1f7a",
  blobColor2: "#1e1050",
  blobColor3: "#5c2d91",

  // Button colors (Resume / LinkedIn / nav links)
  buttonBgColor: "#7c3aed",
  buttonTextColor: "#ffffff",
  buttonBorderColor: "#7c3aed",

  // Social icon color
  socialBgColor: "transparent",
  socialIconColor: "#a78bfa",
};

export const FONT_OPTIONS = [
  "Lora",
  "Playfair Display",
  "DM Sans",
  "Inter",
  "Poppins",
  "Space Grotesk",
];
