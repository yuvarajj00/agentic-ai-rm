import type { FlipClockTheme } from './flip-clock.themes';

export type WorldMuseumThemeId =
  | 'qlocktwo'
  | 'milliontimes'
  | 'urwerk'
  | 'orloj'
  | 'vernier'
  | 'solari_terminal'
  | 'ferrolic'
  | 'mengenlehreuhr'
  | 'nagra'
  | 'shishiodoshi'
  | 'nerv'
  | 'brutalist_concrete'
  | 'ringclock'
  | 'mondaine'
  | 'braun_dn50'
  | 'dnahelix'
  | 'ibmcard'
  | 'astrolabe'
  | 'cybervisor'
  | 'abacus'
  | 'seikolcd'
  | 'isocubes'
  | 'radarscope'
  | 'bauhaus_dessau'
  | 'laserproj'
  | 'origami_wall'
  | 'bathyscaphe'
  | 'bletchley'
  | 'chrysler'
  | 'tesseract';

export type WorldEngineType =
  | 'word_matrix'
  | 'clock_of_clocks'
  | 'urwerk_satellite'
  | 'orbital_rings'
  | 'linear_vernier'
  | 'solari_board'
  | 'ferro_tank'
  | 'berlin_set'
  | 'reel_to_reel'
  | 'water_siphon'
  | 'nerv_hud'
  | 'iso_monolith'
  | 'swiss_railway'
  | 'dna_helix'
  | 'punch_card'
  | 'abacus_frame'
  | 'retro_lcd'
  | 'radar_scope'
  | 'bauhaus_geo'
  | 'laser_galvo'
  | 'bathyscaphe_gauges'
  | 'binary_morse'
  | 'art_deco_tower'
  | 'tesseract_5d';

export interface WorldMuseumSpec {
  engine: WorldEngineType;
  variant?: string;
  origin: string;
  accent: string;
  secondary: string;
  bgAura: string;
}

export type WorldCategory =
  | 'Typographic & Matrix'
  | 'Mechanical & Kinetic'
  | 'Astronomical & Orbital'
  | 'Fluidic & Organic'
  | 'Cyber & Vector';

interface WorldEntryInput {
  id: WorldMuseumThemeId;
  num: string;
  name: string;
  origin: string;
  category: WorldCategory;
  engine: WorldEngineType;
  variant?: string;
  font: string;
  accent: string;
  secondary: string;
  swatchBg?: string;
  swatchBorder?: string;
}

const WORLD_ENTRIES: readonly WorldEntryInput[] = [
  {
    id: 'qlocktwo',
    num: '43',
    name: 'QLOCKTWO German Word Matrix',
    origin: 'Schwäbisch Gmünd, Germany',
    category: 'Typographic & Matrix',
    engine: 'word_matrix',
    font: 'JetBrains Mono',
    accent: '#38bdf8',
    secondary: '#f43f5e'
  },
  {
    id: 'milliontimes',
    num: '44',
    name: 'Humans Since 1982 "A Million Times"',
    origin: 'Stockholm, Sweden',
    category: 'Mechanical & Kinetic',
    engine: 'clock_of_clocks',
    font: 'JetBrains Mono',
    accent: '#f8fafc',
    secondary: '#f59e0b',
    swatchBg: '#f8fafc',
    swatchBorder: '#a1a1aa'
  },
  {
    id: 'urwerk',
    num: '45',
    name: 'Urwerk UR-220 Satellite Carousel',
    origin: 'Geneva, Switzerland',
    category: 'Astronomical & Orbital',
    engine: 'urwerk_satellite',
    font: 'JetBrains Mono',
    accent: '#a3e635',
    secondary: '#f97316'
  },
  {
    id: 'orloj',
    num: '46',
    name: 'Prague Astronomical Orloj Dial',
    origin: 'Old Town Square, Prague (1410)',
    category: 'Astronomical & Orbital',
    engine: 'orbital_rings',
    variant: 'orloj',
    font: 'Cinzel',
    accent: '#f59e0b',
    secondary: '#38bdf8'
  },
  {
    id: 'vernier',
    num: '47',
    name: 'Linear Vernier Slide-Rule Monolith',
    origin: 'Zurich, Switzerland',
    category: 'Mechanical & Kinetic',
    engine: 'linear_vernier',
    font: 'JetBrains Mono',
    accent: '#ef4444',
    secondary: '#e2e8f0'
  },
  {
    id: 'solari_terminal',
    num: '48',
    name: 'Solari Cifra 3000 Airport Board',
    origin: 'Udine, Italy (Gino Valle)',
    category: 'Mechanical & Kinetic',
    engine: 'solari_board',
    font: 'Oswald',
    accent: '#facc15',
    secondary: '#ffffff'
  },
  {
    id: 'ferrolic',
    num: '49',
    name: 'Ferrolic Magnetic Liquid Tank',
    origin: 'Eindhoven, Netherlands',
    category: 'Fluidic & Organic',
    engine: 'ferro_tank',
    font: 'Syne',
    accent: '#eab308',
    secondary: '#a855f7'
  },
  {
    id: 'mengenlehreuhr',
    num: '50',
    name: 'Berlin Mengenlehreuhr Set-Theory',
    origin: 'Kurfürstendamm, Berlin (1975)',
    category: 'Typographic & Matrix',
    engine: 'berlin_set',
    font: 'JetBrains Mono',
    accent: '#ef4444',
    secondary: '#facc15'
  },
  {
    id: 'nagra',
    num: '51',
    name: 'Nagra IV-S Reel-to-Reel Studio Deck',
    origin: 'Cheseaux-sur-Lausanne, Switzerland',
    category: 'Mechanical & Kinetic',
    engine: 'reel_to_reel',
    font: 'JetBrains Mono',
    accent: '#f97316',
    secondary: '#22c55e'
  },
  {
    id: 'shishiodoshi',
    num: '52',
    name: 'Kyoto Shishi-Odoshi Water Siphon',
    origin: 'Arashiyama, Kyoto',
    category: 'Fluidic & Organic',
    engine: 'water_siphon',
    font: 'JetBrains Mono',
    accent: '#10b981',
    secondary: '#06b6d4'
  },
  {
    id: 'nerv',
    num: '53',
    name: 'Evangelion NERV Tactical Hex-HUD',
    origin: 'Tokyo-3 GeoFront Command',
    category: 'Cyber & Vector',
    engine: 'nerv_hud',
    font: 'JetBrains Mono',
    accent: '#ff5500',
    secondary: '#dc2626'
  },
  {
    id: 'brutalist_concrete',
    num: '54',
    name: 'Brutalist Concrete Shadow Relief',
    origin: 'Osaka, Japan (Ando Atelier)',
    category: 'Mechanical & Kinetic',
    engine: 'iso_monolith',
    variant: 'concrete',
    font: 'Archivo Black',
    accent: '#f97316',
    secondary: '#a8a29e',
    swatchBg: '#a8a29e',
    swatchBorder: '#f97316'
  },
  {
    id: 'ringclock',
    num: '55',
    name: 'Ring Clock Titanium Orbital',
    origin: 'Budapest, Hungary',
    category: 'Astronomical & Orbital',
    engine: 'orbital_rings',
    variant: 'titanium',
    font: 'Space Grotesk',
    accent: '#00f0ff',
    secondary: '#3b82f6'
  },
  {
    id: 'mondaine',
    num: '56',
    name: 'SBB Mondaine Swiss Railway Station',
    origin: 'Zurich Hauptbahnhof (Hans Hilfiker)',
    category: 'Mechanical & Kinetic',
    engine: 'swiss_railway',
    font: 'Inter',
    accent: '#eb0000',
    secondary: '#ffffff',
    swatchBg: '#eb0000',
    swatchBorder: '#ffffff'
  },
  {
    id: 'braun_dn50',
    num: '57',
    name: 'Braun DN50 Cylindrical Drum Visor',
    origin: 'Kronberg, Germany (Dieter Rams)',
    category: 'Mechanical & Kinetic',
    engine: 'linear_vernier',
    variant: 'braun',
    font: 'Inter',
    accent: '#ff5500',
    secondary: '#facc15',
    swatchBg: '#27272a',
    swatchBorder: '#ff5500'
  },
  {
    id: 'dnahelix',
    num: '58',
    name: 'DNA Double-Helix Bio-Chronometer',
    origin: 'Cambridge Molecular Lab',
    category: 'Fluidic & Organic',
    engine: 'dna_helix',
    font: 'JetBrains Mono',
    accent: '#22d3ee',
    secondary: '#e879f9'
  },
  {
    id: 'ibmcard',
    num: '59',
    name: 'IBM 1964 Hollerith Punched-Card',
    origin: 'Poughkeepsie, New York',
    category: 'Typographic & Matrix',
    engine: 'punch_card',
    font: 'IBM Plex Mono',
    accent: '#f59e0b',
    secondary: '#10b981',
    swatchBg: '#fde68a',
    swatchBorder: '#b45309'
  },
  {
    id: 'astrolabe',
    num: '60',
    name: 'Venetian Brass Lunar Planisphere',
    origin: 'San Marco, Venice (1568)',
    category: 'Astronomical & Orbital',
    engine: 'orbital_rings',
    variant: 'venetian',
    font: 'Marcellus',
    accent: '#fbbf24',
    secondary: '#10b981'
  },
  {
    id: 'cybervisor',
    num: '61',
    name: 'Cyberpunk 2099 Katakana Holo-Visor',
    origin: 'Neo-Tokyo Sector 7',
    category: 'Cyber & Vector',
    engine: 'nerv_hud',
    variant: 'cyber',
    font: 'Orbitron',
    accent: '#fcee0a',
    secondary: '#00f0ff'
  },
  {
    id: 'abacus',
    num: '62',
    name: 'Soroban Automated Kinetic Abacus',
    origin: 'Kyoto / Edo Guild',
    category: 'Mechanical & Kinetic',
    engine: 'abacus_frame',
    font: 'Share Tech Mono',
    accent: '#d97706',
    secondary: '#fcd34d'
  },
  {
    id: 'seikolcd',
    num: '63',
    name: 'Seiko 1977 Quartz LCD Chronograph',
    origin: 'Suwa, Nagano, Japan',
    category: 'Typographic & Matrix',
    engine: 'retro_lcd',
    font: 'Share Tech Mono',
    accent: '#10b981',
    secondary: '#f59e0b'
  },
  {
    id: 'isocubes',
    num: '64',
    name: 'Kinetic 3D Isometric Cube Wall',
    origin: 'Seoul Digital Art Museum',
    category: 'Mechanical & Kinetic',
    engine: 'iso_monolith',
    variant: 'cubes',
    font: 'Syne',
    accent: '#ec4899',
    secondary: '#6366f1'
  },
  {
    id: 'radarscope',
    num: '65',
    name: 'Klystron Air-Traffic Radar Scope',
    origin: 'NORAD Cheyenne Mountain',
    category: 'Cyber & Vector',
    engine: 'radar_scope',
    font: 'VT323',
    accent: '#00ff66',
    secondary: '#38bdf8'
  },
  {
    id: 'bauhaus_dessau',
    num: '66',
    name: 'Bauhaus Dessau Primary Geometry',
    origin: 'Dessau, Germany (1926)',
    category: 'Astronomical & Orbital',
    engine: 'bauhaus_geo',
    font: 'Plus Jakarta Sans',
    accent: '#ef4444',
    secondary: '#eab308',
    swatchBg: 'linear-gradient(135deg, #dc2626 0%, #eab308 50%, #2563eb 100%)',
    swatchBorder: '#f4f1ea'
  },
  {
    id: 'laserproj',
    num: '67',
    name: 'ILDA Galvanometer Laser Projector',
    origin: 'Berlin Tresor / Berghain Lab',
    category: 'Cyber & Vector',
    engine: 'laser_galvo',
    font: 'Orbitron',
    accent: '#00ff88',
    secondary: '#ff00aa'
  },
  {
    id: 'origami_wall',
    num: '68',
    name: 'Origami Kinetic Tessellation Wall',
    origin: 'Ginza, Tokyo',
    category: 'Mechanical & Kinetic',
    engine: 'iso_monolith',
    variant: 'origami',
    font: 'DM Sans',
    accent: '#fb7185',
    secondary: '#fde047'
  },
  {
    id: 'bathyscaphe',
    num: '69',
    name: 'Bathyscaphe Trieste Pressure Gauges',
    origin: 'Challenger Deep / Cherbourg',
    category: 'Astronomical & Orbital',
    engine: 'bathyscaphe_gauges',
    font: 'Chakra Petch',
    accent: '#fb923c',
    secondary: '#2dd4bf'
  },
  {
    id: 'bletchley',
    num: '70',
    name: 'Bletchley Binary BCD & Morse Rack',
    origin: 'Bletchley Park, UK (1944)',
    category: 'Typographic & Matrix',
    engine: 'binary_morse',
    font: 'IBM Plex Mono',
    accent: '#38bdf8',
    secondary: '#f59e0b'
  },
  {
    id: 'chrysler',
    num: '71',
    name: 'Art Deco Chrysler Sunburst Ziggurat',
    origin: 'Manhattan, New York (1930)',
    category: 'Mechanical & Kinetic',
    engine: 'art_deco_tower',
    font: 'Cinzel',
    accent: '#d4af37',
    secondary: '#10b981'
  },
  {
    id: 'tesseract',
    num: '72',
    name: 'Interstellar 5D Tesseract Gravity Grid',
    origin: 'Gargantua Event Horizon',
    category: 'Cyber & Vector',
    engine: 'tesseract_5d',
    font: 'Orbitron',
    accent: '#f59e0b',
    secondary: '#818cf8'
  }
];

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(56, 189, 248, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const WORLD_MUSEUM_THEMES: readonly FlipClockTheme[] = WORLD_ENTRIES.map((e) => ({
  id: e.id,
  num: e.num,
  name: e.name,
  tag: e.origin,
  kind: 'world-museum',
  category: e.category,
  font: e.font,
  flapHex: '#0a0a0e',
  swatchBg: e.swatchBg ?? `linear-gradient(135deg, ${e.accent} 0%, ${e.secondary} 100%)`,
  swatchBorder: e.swatchBorder ?? hexToRgba(e.accent, 0.55),
  swatchGlow: `0 0 8px ${hexToRgba(e.accent, 0.65)}`,
  world: {
    engine: e.engine,
    variant: e.variant,
    origin: e.origin,
    accent: e.accent,
    secondary: e.secondary,
    bgAura: `radial-gradient(circle at 50% 45%, ${hexToRgba(e.accent, 0.16)} 0%, ${hexToRgba(e.secondary, 0.08)} 48%, #050508 90%)`
  }
}));
