import {
  WORLD_MUSEUM_THEMES,
  WorldCategory,
  WorldEngineType,
  WorldMuseumSpec,
  WorldMuseumThemeId
} from './world-horology.themes';

export type { WorldCategory, WorldEngineType, WorldMuseumSpec, WorldMuseumThemeId };

export type SplitFlapThemeId =
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

export type HorologyThemeId =
  | 'prismnixie'
  | 'belljarflip'
  | 'edison'
  | 'ferrofluid'
  | 'vfd'
  | 'mbf'
  | 'flipdot'
  | 'numitron'
  | 'biolum'
  | 'holocube'
  | 'steampunk'
  | 'louvers'
  | 'mercury'
  | 'shibuya'
  | 'bauhaus'
  | 'cherenkov'
  | 'origami'
  | 'dyson'
  | 'crtscope'
  | 'murano'
  | 'braunvisor'
  | 'quantum';

export type FlipClockThemeId = SplitFlapThemeId | HorologyThemeId | WorldMuseumThemeId;

export type HorologyEngineType =
  | 'acrylic_stack'
  | 'split_flap'
  | 'filament_7seg'
  | 'vfd_7seg'
  | 'flip_dot'
  | 'ferrofluid'
  | 'mbf_turbine'
  | 'biolum'
  | 'holocube'
  | 'dyson_orb'
  | 'crt_scope';

export type HorologyVesselShape = 'dome' | 'pear' | 'cube' | 'round';

export interface HorologyThemeSpec {
  engine: HorologyEngineType;
  fontCss: string;
  defaultGlow: string;
  secondaryGlow: string;
  glassTint: string;
  pedestalStyle: string;
  bgRadial: string;
  shape: HorologyVesselShape;
}

export interface FlipClockTheme {
  id: FlipClockThemeId;
  num: string;
  name: string;
  tag: string;
  kind: 'split-flap' | 'horology' | 'world-museum';
  category:
    | 'Minimal'
    | 'Cyber'
    | 'Industrial'
    | 'Luxury'
    | 'Bulb & Tube'
    | 'Kinetic & Flip'
    | 'Fluid & Bio'
    | 'Optical & Quantum'
    | WorldCategory;
  font: string;
  flapHex: string;
  swatchBg: string;
  swatchBorder: string;
  swatchGlow: string;
  horology?: HorologyThemeSpec;
  world?: WorldMuseumSpec;
}

export const PRISM_NIXIE_BULB_PALETTE: readonly string[] = [
  '#7c3aed',
  '#9333ea',
  '#c026d3',
  '#db2777',
  '#e11d48',
  '#f43f5e'
];

export const FLIP_CLOCK_THEMES: readonly FlipClockTheme[] = [
  {
    id: 'fliqlo',
    num: '01',
    name: 'Fliqlo Matte',
    tag: 'Pure Charcoal',
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
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
    kind: 'split-flap',
    category: 'Industrial',
    font: 'IBM Plex Mono',
    flapHex: '#0b2545',
    swatchBg: '#0ea5e9',
    swatchBorder: '#ffffff',
    swatchGlow: 'none'
  },
  {
    id: 'prismnixie',
    num: '21',
    name: 'Acrylic Prism Nixie Bulbs',
    tag: 'RGB Light-Guide Stack',
    kind: 'horology',
    category: 'Bulb & Tube',
    font: 'Outfit',
    flapHex: '#180d29',
    swatchBg: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #f43f5e 100%)',
    swatchBorder: 'rgba(192, 38, 211, 0.55)',
    swatchGlow: '0 0 8px #c026d3',
    horology: {
      engine: 'acrylic_stack',
      fontCss: "'Outfit', sans-serif",
      defaultGlow: '#c026d3',
      secondaryGlow: '#4f46e5',
      glassTint: 'linear-gradient(180deg, rgba(168,85,247,0.14) 0%, rgba(15,23,42,0.45) 60%, rgba(236,72,153,0.22) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #94a3b8 0%, #475569 12%, #3e2723 14%, #271714 60%, #170d0b 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(168, 85, 247, 0.16) 0%, rgba(15, 23, 42, 0.4) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'belljarflip',
    num: '22',
    name: 'Vacuum Split-Flap Bell Jars',
    tag: 'Smoked Glass Flip Pods',
    kind: 'horology',
    category: 'Kinetic & Flip',
    font: 'Oswald',
    flapHex: '#20180e',
    swatchBg: 'linear-gradient(135deg, #f59e0b 0%, #78350f 100%)',
    swatchBorder: 'rgba(245, 158, 11, 0.5)',
    swatchGlow: '0 0 8px #f59e0b',
    horology: {
      engine: 'split_flap',
      fontCss: "'Oswald', sans-serif",
      defaultGlow: '#f59e0b',
      secondaryGlow: '#78350f',
      glassTint: 'linear-gradient(180deg, rgba(245,158,11,0.22) 0%, rgba(40,30,18,0.42) 55%, rgba(15,15,18,0.75) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #3f434a 0%, #26292e 25%, #181a1d 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(245, 158, 11, 0.14) 0%, rgba(120, 53, 15, 0.18) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'edison',
    num: '23',
    name: 'Edison Helical Filament Bulbs',
    tag: 'Incandescent 2200K Wire',
    kind: 'horology',
    category: 'Bulb & Tube',
    font: 'Share Tech Mono',
    flapHex: '#231205',
    swatchBg: 'linear-gradient(135deg, #ff8c00 0%, #ff4500 100%)',
    swatchBorder: 'rgba(255, 140, 0, 0.55)',
    swatchGlow: '0 0 8px #ff8c00',
    horology: {
      engine: 'filament_7seg',
      fontCss: "'Share Tech Mono', monospace",
      defaultGlow: '#ff8c00',
      secondaryGlow: '#ff4500',
      glassTint: 'radial-gradient(circle at 50% 45%, rgba(255,140,0,0.22) 0%, rgba(35,18,5,0.65) 85%)',
      pedestalStyle: 'linear-gradient(180deg, #78350f 0%, #451a03 40%, #1c0a00 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(255, 140, 0, 0.16) 0%, rgba(69, 26, 3, 0.28) 45%, #050508 85%)',
      shape: 'pear'
    }
  },
  {
    id: 'ferrofluid',
    num: '24',
    name: 'Ferrofluid Magnetic Vat',
    tag: 'Colloidal Liquid Metal',
    kind: 'horology',
    category: 'Fluid & Bio',
    font: 'Syne',
    flapHex: '#181409',
    swatchBg: 'linear-gradient(135deg, #eab308 0%, #713f12 100%)',
    swatchBorder: 'rgba(234, 179, 8, 0.5)',
    swatchGlow: '0 0 8px #eab308',
    horology: {
      engine: 'ferrofluid',
      fontCss: "'Syne', sans-serif",
      defaultGlow: '#eab308',
      secondaryGlow: '#a16207',
      glassTint: 'linear-gradient(180deg, rgba(234,179,8,0.18) 0%, rgba(20,16,8,0.82) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(234, 179, 8, 0.14) 0%, rgba(161, 98, 7, 0.16) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'vfd',
    num: '25',
    name: 'VFD Phosphor Triode Grid',
    tag: 'Futaba 1979 Cyan Tube',
    kind: 'horology',
    category: 'Bulb & Tube',
    font: 'Orbitron',
    flapHex: '#04161c',
    swatchBg: 'linear-gradient(135deg, #00f5d4 0%, #0284c7 100%)',
    swatchBorder: 'rgba(0, 245, 212, 0.55)',
    swatchGlow: '0 0 8px #00f5d4',
    horology: {
      engine: 'vfd_7seg',
      fontCss: "'Orbitron', sans-serif",
      defaultGlow: '#00f5d4',
      secondaryGlow: '#0284c7',
      glassTint: 'linear-gradient(180deg, rgba(0,245,212,0.15) 0%, rgba(4,22,28,0.82) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(0, 245, 212, 0.15) 0%, rgba(2, 132, 199, 0.18) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'mbf',
    num: '26',
    name: 'MB&F Horological Torpedo',
    tag: 'Balance Wheel & Ruby Gears',
    kind: 'horology',
    category: 'Kinetic & Flip',
    font: 'Cinzel',
    flapHex: '#151821',
    swatchBg: 'linear-gradient(135deg, #f43f5e 0%, #d97706 100%)',
    swatchBorder: 'rgba(244, 63, 94, 0.5)',
    swatchGlow: '0 0 8px #f43f5e',
    horology: {
      engine: 'mbf_turbine',
      fontCss: "'Cinzel', serif",
      defaultGlow: '#f43f5e',
      secondaryGlow: '#d97706',
      glassTint: 'radial-gradient(circle at 50% 35%, rgba(244,63,94,0.16) 0%, rgba(17,24,39,0.85) 85%)',
      pedestalStyle: 'linear-gradient(180deg, #4b5563 0%, #1f2937 40%, #111827 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(244, 63, 94, 0.15) 0%, rgba(217, 119, 6, 0.14) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'flipdot',
    num: '27',
    name: 'Flip-Dot Magnetic Matrix',
    tag: '5x7 Bi-Stable Mechanical Discs',
    kind: 'horology',
    category: 'Kinetic & Flip',
    font: 'JetBrains Mono',
    flapHex: '#11140d',
    swatchBg: 'linear-gradient(135deg, #a3e635 0%, #16a34a 100%)',
    swatchBorder: 'rgba(163, 230, 53, 0.5)',
    swatchGlow: '0 0 8px #a3e635',
    horology: {
      engine: 'flip_dot',
      fontCss: "'JetBrains Mono', monospace",
      defaultGlow: '#a3e635',
      secondaryGlow: '#16a34a',
      glassTint: 'linear-gradient(180deg, rgba(163,230,53,0.12) 0%, rgba(15,18,12,0.88) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(163, 230, 53, 0.14) 0%, rgba(22, 163, 74, 0.16) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'numitron',
    num: '28',
    name: 'Numitron DR2000 Tube',
    tag: 'Cold-War Incandescent Wire',
    kind: 'horology',
    category: 'Bulb & Tube',
    font: 'IBM Plex Mono',
    flapHex: '#1a100b',
    swatchBg: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
    swatchBorder: 'rgba(251, 146, 60, 0.55)',
    swatchGlow: '0 0 8px #fb923c',
    horology: {
      engine: 'filament_7seg',
      fontCss: "'IBM Plex Mono', monospace",
      defaultGlow: '#fb923c',
      secondaryGlow: '#ea580c',
      glassTint: 'linear-gradient(180deg, rgba(251,146,60,0.2) 0%, rgba(24,14,10,0.85) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #334155 0%, #0f172a 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(251, 146, 60, 0.16) 0%, rgba(234, 88, 12, 0.16) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'biolum',
    num: '29',
    name: 'Abyssal Bioluminescent Vat',
    tag: 'Deep-Sea Neural Spores',
    kind: 'horology',
    category: 'Fluid & Bio',
    font: 'Righteous',
    flapHex: '#040a16',
    swatchBg: 'linear-gradient(135deg, #22d3ee 0%, #c084fc 100%)',
    swatchBorder: 'rgba(34, 211, 238, 0.55)',
    swatchGlow: '0 0 8px #22d3ee',
    horology: {
      engine: 'biolum',
      fontCss: "'Righteous', cursive",
      defaultGlow: '#22d3ee',
      secondaryGlow: '#c084fc',
      glassTint: 'radial-gradient(circle at 50% 60%, rgba(34,211,238,0.22) 0%, rgba(88,28,135,0.3) 55%, rgba(3,7,18,0.92) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #083344 0%, #020617 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(34, 211, 238, 0.15) 0%, rgba(192, 132, 252, 0.18) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'holocube',
    num: '30',
    name: 'Holographic Dichroic Cubes',
    tag: 'RGB Laser Beam-Splitter',
    kind: 'horology',
    category: 'Optical & Quantum',
    font: 'Michroma',
    flapHex: '#0f1624',
    swatchBg: 'linear-gradient(135deg, #38bdf8 0%, #f43f5e 100%)',
    swatchBorder: 'rgba(56, 189, 248, 0.55)',
    swatchGlow: '0 0 8px #38bdf8',
    horology: {
      engine: 'holocube',
      fontCss: "'Michroma', sans-serif",
      defaultGlow: '#38bdf8',
      secondaryGlow: '#f43f5e',
      glassTint: 'linear-gradient(135deg, rgba(56,189,248,0.22) 0%, rgba(244,63,94,0.18) 50%, rgba(168,85,247,0.22) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(56, 189, 248, 0.16) 0%, rgba(244, 63, 94, 0.16) 45%, #050508 85%)',
      shape: 'cube'
    }
  },
  {
    id: 'steampunk',
    num: '31',
    name: 'Victorian Brass Orrery Pods',
    tag: 'Riveted Copper & Gears',
    kind: 'horology',
    category: 'Kinetic & Flip',
    font: 'Marcellus',
    flapHex: '#28180a',
    swatchBg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    swatchBorder: 'rgba(245, 158, 11, 0.55)',
    swatchGlow: '0 0 8px #b45309',
    horology: {
      engine: 'mbf_turbine',
      fontCss: "'Marcellus', serif",
      defaultGlow: '#f59e0b',
      secondaryGlow: '#b45309',
      glassTint: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.24) 0%, rgba(41,24,10,0.85) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #b45309 0%, #78350f 45%, #291507 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(245, 158, 11, 0.16) 0%, rgba(180, 83, 9, 0.2) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'louvers',
    num: '32',
    name: 'Kinetic 3D Mechanical Louvers',
    tag: 'Rotating Brutalist Prisms',
    kind: 'horology',
    category: 'Kinetic & Flip',
    font: 'Archivo Black',
    flapHex: '#121216',
    swatchBg: 'linear-gradient(135deg, #f97316 0%, #52525b 100%)',
    swatchBorder: 'rgba(249, 115, 22, 0.55)',
    swatchGlow: '0 0 8px #f97316',
    horology: {
      engine: 'filament_7seg',
      fontCss: "'Archivo Black', sans-serif",
      defaultGlow: '#f97316',
      secondaryGlow: '#e2e8f0',
      glassTint: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(15,15,18,0.92) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #27272a 0%, #09090b 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(249, 115, 22, 0.14) 0%, rgba(226, 232, 240, 0.1) 45%, #050508 85%)',
      shape: 'cube'
    }
  },
  {
    id: 'mercury',
    num: '33',
    name: 'Liquid Mercury Capillary',
    tag: 'Peristaltic Silver Fluidics',
    kind: 'horology',
    category: 'Fluid & Bio',
    font: 'Rajdhani',
    flapHex: '#121926',
    swatchBg: 'linear-gradient(135deg, #e2e8f0 0%, #38bdf8 100%)',
    swatchBorder: 'rgba(226, 232, 240, 0.55)',
    swatchGlow: '0 0 8px #38bdf8',
    horology: {
      engine: 'vfd_7seg',
      fontCss: "'Rajdhani', sans-serif",
      defaultGlow: '#e2e8f0',
      secondaryGlow: '#38bdf8',
      glassTint: 'linear-gradient(180deg, rgba(226,232,240,0.18) 0%, rgba(15,23,42,0.88) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #475569 0%, #1e293b 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(226, 232, 240, 0.14) 0%, rgba(56, 189, 248, 0.16) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'shibuya',
    num: '34',
    name: 'Shibuya Glitch Containment',
    tag: 'Neo-Tokyo High-Voltage Arcs',
    kind: 'horology',
    category: 'Optical & Quantum',
    font: 'Orbitron',
    flapHex: '#1a0a16',
    swatchBg: 'linear-gradient(135deg, #fcee0a 0%, #ff0055 100%)',
    swatchBorder: 'rgba(252, 238, 10, 0.55)',
    swatchGlow: '0 0 8px #ff0055',
    horology: {
      engine: 'acrylic_stack',
      fontCss: "'Orbitron', sans-serif",
      defaultGlow: '#fcee0a',
      secondaryGlow: '#ff0055',
      glassTint: 'linear-gradient(180deg, rgba(252,238,10,0.18) 0%, rgba(255,0,85,0.22) 60%, rgba(10,10,16,0.9) 100%)',
      pedestalStyle: 'linear-gradient(90deg, #fcee0a 0%, #18181b 8%, #18181b 92%, #00f0ff 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(252, 238, 10, 0.14) 0%, rgba(255, 0, 85, 0.18) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'bauhaus',
    num: '35',
    name: 'Bauhaus Weimar Color-Flap',
    tag: 'Primary Red / Yellow / Blue',
    kind: 'horology',
    category: 'Kinetic & Flip',
    font: 'Plus Jakarta Sans',
    flapHex: '#1e1b2e',
    swatchBg: 'linear-gradient(135deg, #ef4444 0%, #eab308 50%, #3b82f6 100%)',
    swatchBorder: 'rgba(255, 255, 255, 0.4)',
    swatchGlow: '0 0 8px #ef4444',
    horology: {
      engine: 'split_flap',
      fontCss: "'Plus Jakarta Sans', sans-serif",
      defaultGlow: '#ef4444',
      secondaryGlow: '#3b82f6',
      glassTint: 'linear-gradient(180deg, rgba(239,68,68,0.14) 0%, rgba(29,78,216,0.18) 55%, rgba(234,179,8,0.16) 100%)',
      pedestalStyle: 'linear-gradient(90deg, #dc2626 0%, #dc2626 33%, #eab308 33%, #eab308 66%, #2563eb 66%, #2563eb 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(239, 68, 68, 0.14) 0%, rgba(59, 130, 246, 0.18) 45%, #050508 85%)',
      shape: 'cube'
    }
  },
  {
    id: 'cherenkov',
    num: '36',
    name: 'Cherenkov Reactor Core Rods',
    tag: 'Ionized Heavy-Water Blue',
    kind: 'horology',
    category: 'Fluid & Bio',
    font: 'Chakra Petch',
    flapHex: '#04122a',
    swatchBg: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
    swatchBorder: 'rgba(0, 180, 216, 0.6)',
    swatchGlow: '0 0 8px #00b4d8',
    horology: {
      engine: 'biolum',
      fontCss: "'Chakra Petch', sans-serif",
      defaultGlow: '#00b4d8',
      secondaryGlow: '#0077b6',
      glassTint: 'radial-gradient(circle at 50% 70%, rgba(0,180,216,0.38) 0%, rgba(3,4,94,0.45) 55%, rgba(2,6,23,0.92) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #1e293b 0%, #020617 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(0, 180, 216, 0.2) 0%, rgba(0, 119, 182, 0.22) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'origami',
    num: '37',
    name: 'Origami Washi Paper Prisms',
    tag: 'Folded Architectural Facets',
    kind: 'horology',
    category: 'Kinetic & Flip',
    font: 'DM Sans',
    flapHex: '#261e20',
    swatchBg: 'linear-gradient(135deg, #fb7185 0%, #fde047 100%)',
    swatchBorder: 'rgba(251, 113, 133, 0.5)',
    swatchGlow: '0 0 8px #fb7185',
    horology: {
      engine: 'split_flap',
      fontCss: "'DM Sans', sans-serif",
      defaultGlow: '#fb7185',
      secondaryGlow: '#fde047',
      glassTint: 'linear-gradient(135deg, rgba(251,113,133,0.15) 0%, rgba(244,241,234,0.12) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #44403c 0%, #1c1917 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(251, 113, 133, 0.14) 0%, rgba(253, 224, 71, 0.12) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'dyson',
    num: '38',
    name: 'Dyson Sphere Solar Gyro',
    tag: 'Magnetic Levitation Sun Core',
    kind: 'horology',
    category: 'Optical & Quantum',
    font: 'Orbitron',
    flapHex: '#241208',
    swatchBg: 'linear-gradient(135deg, #ff6b00 0%, #ffd000 100%)',
    swatchBorder: 'rgba(255, 107, 0, 0.55)',
    swatchGlow: '0 0 8px #ff6b00',
    horology: {
      engine: 'dyson_orb',
      fontCss: "'Orbitron', sans-serif",
      defaultGlow: '#ff6b00',
      secondaryGlow: '#ffd000',
      glassTint: 'radial-gradient(circle at 50% 50%, rgba(255,107,0,0.3) 0%, rgba(12,10,9,0.88) 80%)',
      pedestalStyle: 'linear-gradient(180deg, #292524 0%, #0c0a09 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(255, 107, 0, 0.18) 0%, rgba(255, 208, 0, 0.14) 45%, #050508 85%)',
      shape: 'round'
    }
  },
  {
    id: 'crtscope',
    num: '39',
    name: 'Tektronix CRT Vector Scope',
    tag: 'Lissajous Radar Oscilloscope',
    kind: 'horology',
    category: 'Optical & Quantum',
    font: 'VT323',
    flapHex: '#041c0d',
    swatchBg: 'linear-gradient(135deg, #00ff66 0%, #10b981 100%)',
    swatchBorder: 'rgba(0, 255, 102, 0.55)',
    swatchGlow: '0 0 8px #00ff66',
    horology: {
      engine: 'crt_scope',
      fontCss: "'VT323', monospace",
      defaultGlow: '#00ff66',
      secondaryGlow: '#10b981',
      glassTint: 'radial-gradient(circle at 50% 50%, rgba(0,255,102,0.18) 0%, rgba(2,24,10,0.92) 90%)',
      pedestalStyle: 'linear-gradient(180deg, #3f4f44 0%, #1a241e 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(0, 255, 102, 0.16) 0%, rgba(16, 185, 129, 0.14) 45%, #050508 85%)',
      shape: 'round'
    }
  },
  {
    id: 'murano',
    num: '40',
    name: 'Murano Venetian Stained Glass',
    tag: 'Dichroic Gold-Leaf Crystal',
    kind: 'horology',
    category: 'Bulb & Tube',
    font: 'Cormorant Garamond',
    flapHex: '#25101a',
    swatchBg: 'linear-gradient(135deg, #f43f5e 0%, #eab308 50%, #a855f7 100%)',
    swatchBorder: 'rgba(244, 63, 94, 0.5)',
    swatchGlow: '0 0 8px #f43f5e',
    horology: {
      engine: 'vfd_7seg',
      fontCss: "'Cormorant Garamond', serif",
      defaultGlow: '#f43f5e',
      secondaryGlow: '#a855f7',
      glassTint: 'linear-gradient(135deg, rgba(244,63,94,0.25) 0%, rgba(234,179,8,0.2) 50%, rgba(59,130,246,0.25) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #451a03 0%, #1c0a00 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(244, 63, 94, 0.16) 0%, rgba(168, 85, 247, 0.16) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'braunvisor',
    num: '41',
    name: 'Braun DN 40 Cylinder Visor',
    tag: 'Dieter Rams Drum Roller',
    kind: 'horology',
    category: 'Kinetic & Flip',
    font: 'Inter',
    flapHex: '#18181b',
    swatchBg: 'linear-gradient(135deg, #ff5500 0%, #27272a 100%)',
    swatchBorder: 'rgba(255, 85, 0, 0.55)',
    swatchGlow: '0 0 8px #ff5500',
    horology: {
      engine: 'split_flap',
      fontCss: "'Inter', sans-serif",
      defaultGlow: '#ff5500',
      secondaryGlow: '#f4f4f6',
      glassTint: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(24,24,27,0.88) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #27272a 0%, #141417 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(255, 85, 0, 0.15) 0%, rgba(244, 244, 246, 0.08) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  {
    id: 'quantum',
    num: '42',
    name: 'Quantum Rubidium Lattice',
    tag: 'Dilution Cryo-Chandelier',
    kind: 'horology',
    category: 'Optical & Quantum',
    font: 'Space Grotesk',
    flapHex: '#1c1708',
    swatchBg: 'linear-gradient(135deg, #ffd700 0%, #a855f7 100%)',
    swatchBorder: 'rgba(255, 215, 0, 0.55)',
    swatchGlow: '0 0 8px #ffd700',
    horology: {
      engine: 'dyson_orb',
      fontCss: "'Space Grotesk', sans-serif",
      defaultGlow: '#ffd700',
      secondaryGlow: '#a855f7',
      glassTint: 'radial-gradient(circle at 50% 45%, rgba(255,215,0,0.22) 0%, rgba(139,92,246,0.2) 55%, rgba(9,9,11,0.92) 100%)',
      pedestalStyle: 'linear-gradient(180deg, #ca8a04 0%, #713f12 35%, #18181b 100%)',
      bgRadial: 'radial-gradient(circle at 50% 42%, rgba(255, 215, 0, 0.16) 0%, rgba(168, 85, 247, 0.18) 45%, #050508 85%)',
      shape: 'dome'
    }
  },
  ...WORLD_MUSEUM_THEMES
];
