import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HorologyEngineType,
  HorologyThemeId,
  HorologyVesselShape
} from './flip-clock.themes';

export interface Seg7Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
}

const SEG7_COORDS: readonly Omit<Seg7Segment, 'active'>[] = [
  { x1: 22, y1: 18, x2: 78, y2: 18 }, // a - top
  { x1: 82, y1: 24, x2: 82, y2: 74 }, // b - top right
  { x1: 82, y1: 86, x2: 82, y2: 136 }, // c - bottom right
  { x1: 22, y1: 142, x2: 78, y2: 142 }, // d - bottom
  { x1: 18, y1: 86, x2: 18, y2: 136 }, // e - bottom left
  { x1: 18, y1: 24, x2: 18, y2: 74 }, // f - top left
  { x1: 22, y1: 80, x2: 78, y2: 80 } // g - middle
];

const SEG7_MAP: Record<string, readonly boolean[]> = {
  '0': [true, true, true, true, true, true, false],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
  '-': [false, false, false, false, false, false, true],
  ' ': [false, false, false, false, false, false, false]
};

const CHAR_5X7: Record<string, readonly string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['01110', '10001', '00001', '00110', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000']
};

const BAUHAUS_PLATE_COLORS: readonly string[] = [
  'linear-gradient(160deg, rgba(220, 38, 38, 0.92), rgba(127, 29, 29, 0.95))',
  'linear-gradient(160deg, rgba(234, 179, 8, 0.92), rgba(133, 77, 14, 0.95))',
  'linear-gradient(160deg, rgba(37, 99, 235, 0.92), rgba(30, 58, 138, 0.95))'
];

@Component({
  selector: 'app-horology-bulb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horology-bulb.component.html',
  styleUrl: './horology-bulb.component.css'
})
export class HorologyBulbComponent {
  private readonly _current = signal<string>('0');
  readonly current = this._current.asReadonly();
  readonly previous = signal<string>('0');
  readonly flipTick = signal<number>(0);

  private initialized = false;
  private lastForceCount = 0;
  private didFlipThisCycle = false;

  @Input() label = '';
  @Input() subText = '';
  @Input() themeId: HorologyThemeId = 'prismnixie';
  @Input() engine: HorologyEngineType = 'acrylic_stack';
  @Input() shape: HorologyVesselShape = 'dome';
  @Input() fontCss = "'Outfit', sans-serif";
  @Input() glowColor = '#c026d3';
  @Input() secondaryGlow = '#4f46e5';
  @Input() glassTint =
    'linear-gradient(180deg, rgba(168,85,247,0.14) 0%, rgba(15,23,42,0.45) 60%, rgba(236,72,153,0.22) 100%)';
  @Input() showGlassDome = true;
  @Input() bulbIndex = 0;
  @Input() isTwinMode = false;

  @Input({ required: true }) set value(next: string) {
    if (!this.initialized) {
      this._current.set(next);
      this.previous.set(next);
      this.initialized = true;
      return;
    }

    if (next === this._current()) {
      return;
    }

    this.previous.set(this._current());
    this._current.set(next);
    this.flipTick.update((c) => c + 1);
    this.didFlipThisCycle = true;
    queueMicrotask(() => {
      this.didFlipThisCycle = false;
    });
  }

  @Input() set forceFlipCount(count: number) {
    if (count === this.lastForceCount) {
      return;
    }
    this.lastForceCount = count;

    if (this.initialized && !this.didFlipThisCycle) {
      this.previous.set(this._current());
      this.flipTick.update((n) => n + 1);
    }
  }

  readonly chars = computed<readonly string[]>(() => Array.from(this.current() || '0'));

  readonly stackGhostDigits = ['8', '3', '5'] as const;
  readonly ferroDrops = [0, 1, 2, 3, 4] as const;
  readonly spores = [0, 1, 2, 3, 4, 5] as const;

  readonly flipPhaseClass = computed(() => {
    const tick = this.flipTick();
    if (tick === 0) return '';
    return tick % 2 === 1 ? 'flipping-a' : 'flipping-b';
  });

  readonly bauhausBg = computed(
    () => BAUHAUS_PLATE_COLORS[this.bulbIndex % BAUHAUS_PLATE_COLORS.length]
  );

  seg7Segments(ch: string): readonly Seg7Segment[] {
    const states = SEG7_MAP[ch] ?? SEG7_MAP['0'];
    return SEG7_COORDS.map((coord, idx) => ({
      ...coord,
      active: states[idx]
    }));
  }

  flipDotCells(ch: string): readonly boolean[] {
    const rows = CHAR_5X7[ch] ?? CHAR_5X7['0'];
    const flat: boolean[] = [];
    for (const row of rows) {
      for (const bit of row) {
        flat.push(bit === '1');
      }
    }
    return flat;
  }
}
