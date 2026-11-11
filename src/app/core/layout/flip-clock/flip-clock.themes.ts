export type FlipClockThemeId =
  | 'fliqlo'
  | 'cyber'
  | 'braun'
  | 'luxury'
  | 'nordic'
  | 'nixie'
  | 'cyberpunk'
  | 'matcha'
  | 'obsidian'
  | 'solari'
  | 'artdeco'
  | 'synthwave'
  | 'swiss'
  | 'matrix'
  | 'titanium'
  | 'brutalist'
  | 'sapphire'
  | 'eink'
  | 'rosequartz'
  | 'blueprint';

export interface FlipClockTheme {
  id: FlipClockThemeId;
  num: string;
  name: string;
  tag: string;
  category: 'Minimal' | 'Cyber' | 'Industrial' | 'Luxury';
  font: string;
  flapHex: string;
  swatchBg: string;
  swatchBorder: string;
  swatchGlow: string;
}

export const FLIP_CLOCK_THEMES: readonly FlipClockTheme[] = [
  {
    id: 'fliqlo',
    num: '01',
    name: 'Fliqlo Matte',
    tag: 'Pure Charcoal',
    category: 'Minimal',
    font: 'Oswald',
    flapHex: '#18181b',
    swatchBg: '#18181b',
    swatchBorder: 'rgba(255, 255, 255, 0.45)',
    swatchGlow: 'none'
  },
  {
    id: 'cyber',
    num: '02',
    name: 'Cyber Glass',
    tag: 'Frosted & Neon',
    category: 'Cyber',
    font: 'Space Grotesk',
    flapHex: 'rgba(15, 23, 42, 0.7)',
    swatchBg: '#22d3ee',
    swatchBorder: 'rgba(255, 255, 255, 0.35)',
    swatchGlow: '0 0 8px #00f0ff'
  },
  {
    id: 'braun',
    num: '03',
    name: 'Dieter Rams',
    tag: 'Braun Industrial',
    category: 'Industrial',
    font: 'Inter',
    flapHex: '#222428',
    swatchBg: '#ff5500',
    swatchBorder: 'rgba(255, 255, 255, 0.25)',
    swatchGlow: 'none'
  },
  {
    id: 'luxury',
    num: '04',
    name: 'Crimson Gold',
    tag: 'Obsidian Luxury',
    category: 'Luxury',
    font: 'Cinzel',
    flapHex: '#1c080b',
    swatchBg: 'linear-gradient(135deg, #fcd34d 0%, #7f1d1d 100%)',
    swatchBorder: 'rgba(212, 175, 55, 0.55)',
    swatchGlow: 'none'
  },
  {
    id: 'nordic',
    num: '05',
    name: 'Nordic Paper',
    tag: 'Alabaster Contrast',
    category: 'Minimal',
    font: 'DM Sans',
    flapHex: '#f4f1ea',
    swatchBg: '#f4f1ea',
    swatchBorder: '#71717a',
    swatchGlow: 'none'
  },
  {
    id: 'nixie',
    num: '06',
    name: 'Nixie Amber',
    tag: 'Vacuum Tube Glow',
    category: 'Cyber',
    font: 'Share Tech Mono',
    flapHex: '#0f0a07',
    swatchBg: '#ff8800',
    swatchBorder: 'rgba(255, 136, 0, 0.5)',
    swatchGlow: '0 0 8px #ff7b00'
  },
  {
    id: 'cyberpunk',
    num: '07',
    name: 'Tokyo 2099',
    tag: 'Chamfered Acid',
    category: 'Cyber',
    font: 'Orbitron',
    flapHex: '#121217',
    swatchBg: '#fcee0a',
    swatchBorder: '#22d3ee',
    swatchGlow: 'none'
  },
  {
    id: 'matcha',
    num: '08',
    name: 'Matcha Zen',
    tag: 'Kyoto Moss & Cream',
    category: 'Minimal',
    font: 'Plus Jakarta Sans',
    flapHex: '#1b2a20',
    swatchBg: '#4f772d',
    swatchBorder: 'rgba(232, 237, 223, 0.35)',
    swatchGlow: 'none'
  },
  {
    id: 'obsidian',
    num: '09',
    name: 'Monolith Pitch',
    tag: 'Stealth OLED Black',
    category: 'Minimal',
    font: 'Syne',
    flapHex: '#070708',
    swatchBg: '#000000',
    swatchBorder: '#52525b',
    swatchGlow: 'none'
  },
  {
    id: 'solari',
    num: '10',
    name: 'Solari Udine',
    tag: 'Italian Airport Board',
    category: 'Industrial',
    font: 'Oswald',
    flapHex: '#1e2024',
    swatchBg: '#facc15',
    swatchBorder: 'rgba(255, 255, 255, 0.35)',
    swatchGlow: 'none'
  },
  {
    id: 'artdeco',
    num: '11',
    name: 'Emerald Deco',
    tag: '1920s Brass Pinstripe',
    category: 'Luxury',
    font: 'Cormorant Garamond',
    flapHex: '#071f18',
    swatchBg: '#047857',
    swatchBorder: '#fcd34d',
    swatchGlow: 'none'
  },
  {
    id: 'synthwave',
    num: '12',
    name: 'Synthwave 84',
    tag: 'Sunset Gradient',
    category: 'Cyber',
    font: 'Righteous',
    flapHex: '#190b33',
    swatchBg: 'linear-gradient(135deg, #ec4899 0%, #7c3aed 100%)',
    swatchBorder: 'rgba(255, 113, 206, 0.5)',
    swatchGlow: '0 0 8px rgba(236, 72, 153, 0.55)'
  },
  {
    id: 'swiss',
    num: '13',
    name: 'Swiss Railway',
    tag: 'SBB Red & White',
    category: 'Industrial',
    font: 'Inter',
    flapHex: '#ffffff',
    swatchBg: '#eb0000',
    swatchBorder: '#ffffff',
    swatchGlow: 'none'
  },
  {
    id: 'matrix',
    num: '14',
    name: 'CRT Matrix',
    tag: 'Phosphor Scanlines',
    category: 'Cyber',
    font: 'JetBrains Mono',
    flapHex: '#051409',
    swatchBg: '#00ff66',
    swatchBorder: 'rgba(0, 255, 102, 0.5)',
    swatchGlow: '0 0 8px #00ff66'
  },
  {
    id: 'titanium',
    num: '15',
    name: 'Brushed Titanium',
    tag: 'Machined Gunmetal',
    category: 'Industrial',
    font: 'Chakra Petch',
    flapHex: '#272b33',
    swatchBg: '#94a3b8',
    swatchBorder: 'rgba(226, 232, 240, 0.5)',
    swatchGlow: 'none'
  },
  {
    id: 'brutalist',
    num: '16',
    name: 'Terracotta Raw',
    tag: 'Architectural Concrete',
    category: 'Industrial',
    font: 'Archivo Black',
    flapHex: '#d6d3cd',
    swatchBg: '#c85a32',
    swatchBorder: '#18181b',
    swatchGlow: 'none'
  },
  {
    id: 'sapphire',
    num: '17',
    name: 'Royal Sapphire',
    tag: 'Midnight Chronometer',
    category: 'Luxury',
    font: 'Outfit',
    flapHex: '#0c1633',
    swatchBg: '#3b82f6',
    swatchBorder: 'rgba(191, 219, 254, 0.45)',
    swatchGlow: 'none'
  },
  {
    id: 'eink',
    num: '18',
    name: 'E-Ink Matte',
    tag: 'Zero-Glare Paper',
    category: 'Minimal',
    font: 'Merriweather',
    flapHex: '#e8e7e2',
    swatchBg: '#d6d5cf',
    swatchBorder: '#3f3f46',
    swatchGlow: 'none'
  },
  {
    id: 'rosequartz',
    num: '19',
    name: 'Rose Quartz',
    tag: 'Dusty Velvet Taupe',
    category: 'Luxury',
    font: 'Quicksand',
    flapHex: '#2b1a21',
    swatchBg: '#f472b6',
    swatchBorder: 'rgba(251, 207, 232, 0.45)',
    swatchGlow: 'none'
  },
  {
    id: 'blueprint',
    num: '20',
    name: 'Blueprint CAD',
    tag: 'Engineering Grid',
    category: 'Industrial',
    font: 'IBM Plex Mono',
    flapHex: '#0b2545',
    swatchBg: '#0ea5e9',
    swatchBorder: '#ffffff',
    swatchGlow: 'none'
  }
];
