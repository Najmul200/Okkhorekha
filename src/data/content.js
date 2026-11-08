export const SITE = {
  name: 'অক্ষরেখা',
  phone: '01774750911',
  phoneHref: '+8801774750911',
  whatsapp: '01774750911',
  email: 'akkhorekhaarchitects@gmail.com',
};

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
];

export const SLIDES = [
  {
    image: 'Scene 1_1.png',
    eyebrow: 'Architecture • Interior • Urban Planning',
    title: 'Designing spaces that shape modern living.',
    text: 'We create timeless architecture with a focus on clarity, context, and cultural depth.',
    ambientLogo: true,
    buttons: [
      { label: 'View Projects', href: '#projects', primary: true },
      { label: 'Book a Consultation', href: '/contact' },
    ],
  },
  {
    image: 'Scene 2_1.png',
    eyebrow: 'Sustainable Innovation',
    title: 'Harmonizing nature and structural design.',
    text: 'Our eco-friendly practices blend local heritage with cutting-edge materials.',
    buttons: [{ label: 'Explore Work', href: '#projects', primary: true }],
  },
  {
    image: 'Scene 5_1.png',
    eyebrow: 'Minimalist Aesthetics',
    title: 'Crafting quiet luxury and practical form.',
    text: 'Every line and material is selected to create meaningful environments.',
    buttons: [{ label: 'Get in Touch', href: '/contact', primary: true }],
  },
  {
    image: 'Scene 24_1.png',
    eyebrow: 'Contextual Design',
    title: 'Creating architecture that feels rooted and timeless.',
    text: 'We design with climate, culture, and community at the heart of every project.',
    buttons: [{ label: 'See Portfolio', href: '#projects', primary: true }],
  },
  {
    image: 'Scene 25_1.png',
    eyebrow: 'Material Precision',
    title: 'Every surface chosen with intention and calm.',
    text: 'Materiality and proportion shape how spaces feel, move, and endure.',
    buttons: [{ label: 'Start a Project', href: '/contact', primary: true }],
  },
  {
    image: 'Scene 26_1.png',
    eyebrow: 'Warm Modernism',
    title: 'Blending elegance, function, and atmosphere.',
    text: 'Our spaces balance openness with comfort, detail with restraint.',
    buttons: [{ label: 'Explore More', href: '#projects', primary: true }],
  },
  {
    image: '09.jpg',
    eyebrow: 'Spatial Storytelling',
    title: 'Shaping experiences through light, texture, and flow.',
    text: 'We create memorable interiors that feel both sculptural and lived-in.',
    buttons: [{ label: 'Book Consultation', href: '/contact', primary: true }],
  },
  {
    image: '10.jpg',
    eyebrow: 'Future Focused',
    title: 'Designing for the way people live today and tomorrow.',
    text: 'Innovation and timelessness work together in every environment we shape.',
    buttons: [{ label: 'Discover Studio', href: '#projects', primary: true }],
  },
];

export const STATS = [
  { value: '25+', label: 'Years Experience' },
  { value: '120', label: 'Completed Projects' },
  { value: '15', label: 'Award Wins' },
];

// ============================================================
//  PROJECTS SECTION
//
//  Section e shudhu 3 ta card thake: Ready / Ongoing / Complete Project.
//  Card e click korle oi category r sob project dekhay, project e click
//  korle tar sob picture gallery te dekhay.
//
//  Notun project add korte KONO CODE LEKHA LAGBE NA, shudhu folder banao:
//
//    src/assets/projects/
//      ├── ready/                 <- Ready Project card
//      │    ├── lalmatia-house/   <- ekta project = ekta folder
//      │    │     ├── 01.jpg
//      │    │     ├── 02.jpg
//      │    │     └── ...
//      │    └── gulshan-villa/
//      │          └── 01.jpg ...
//      ├── ongoing/               <- Ongoing Project card
//      │    └── banani-tower/ ...
//      └── complete/              <- Complete Project card
//           └── dhanmondi-office/ ...
//
//  Folder er nam theke project er nam hoy (lalmatia-house -> Lalmatia House).
//  Nam/description nijer moto dite chaile PROJECT_INFO te likho.
// ============================================================

// 3 ta card (key = src/assets/projects/ er bhitorer folder er nam)
export const PROJECT_CATEGORIES = [
  {
    key: 'ready',
    status: 'Ready Project',
    image: 'Scene 24_1.png', // card er cover (public/images). Category folder e picture thakle oita use hobe
    alt: 'Mosque at Kazipura',
    tag: 'Architectural Design',
    title: 'Ready for what comes next',
    text: 'Refined spatial planning for a premium residential concept.',
  },
  {
    key: 'ongoing',
    status: 'Ongoing Project',
    image: 'Scene 25_1.png',
    alt: 'Nazimuddin Residence',
    tag: 'Interior Renovation',
    title: 'Taking shape on site',
    text: 'Crafting elegant living spaces with careful material layering.',
  },
  {
    key: 'complete',
    status: 'Complete Project',
    image: 'Scene 26_1.png',
    alt: 'Bengal Gallery of Fine Arts',
    tag: 'Gallery Concept',
    title: 'Spaces brought to life',
    text: 'A calm and compositional gallery interior with refined lighting.',
  },
];

// Project folder er nam diye nam/location dewa.
// key = project folder er nam, hubohu ek (space, boro/chhoto hater okkhor soho)
//
//  title    -> page e ja nam dekhabe (na dile folder er nam theke hobe)
//  location -> project page e dekhabe (Google Map link soho). Faka rakhle dekhabe na
//  year     -> (optional) year dile category page e year onujayi sajano hobe
//  sector   -> (optional) commercial, residential, or religious
//  text     -> (optional) ek line description
//  cover    -> (optional) kon picture cover hobe, jemon '02.jpg' (na dile prothom ta)
//
//  Notun project folder add korle ekhane ekta block add koro (na korleo cholbe,
//  tokhon folder er nam-i project er nam hobe).
export const PROJECT_INFO = {
  // ---- Ready Project ----
  'khilkhet full unit': { title: 'Khilkhet Full Unit', location: '', sector: 'residential' },
  'kitchen d5': { title: 'Kitchen D5', location: '', sector: 'commercial' },
  'MOHAKHALI DOHS': { title: 'Mohakhali DOHS', location: '', sector: 'religious' },
  Advocate: { title: 'Advocate', location: '', sector: 'commercial' },
  bashundhara: { title: 'Bashundhara', location: '', sector: 'residential' },
  'duplex reading': { title: 'Duplex Reading', location: '', sector: 'residential' },

  // ---- Ongoing Project ----

  // ---- Complete Project ----
};
