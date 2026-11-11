import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlipClockTheme, WorldMuseumSpec } from './flip-clock.themes';

type AnglePair = readonly [number, number];

const R: AnglePair = [135, 135];
const H: AnglePair = [0, 180];
const V: AnglePair = [90, 270];
const TL: AnglePair = [0, 90];
const TR: AnglePair = [90, 180];
const BL: AnglePair = [0, 270];
const BR: AnglePair = [180, 270];

const DIGIT_CLOCKS_4X6: Record<string, readonly AnglePair[]> = {
  '0': [TL, H, H, TR, V, TL, TR, V, V, V, V, V, V, V, V, V, V, BL, BR, V, BL, H, H, BR],
  '1': [R, TL, TR, R, R, BL, V, R, R, R, V, R, R, R, V, R, R, TL, BR, R, R, BL, H, BR],
  '2': [TL, H, H, TR, BL, H, TR, V, TL, H, BR, V, V, TL, H, BR, V, BL, H, TR, BL, H, H, BR],
  '3': [TL, H, H, TR, BL, H, TR, V, R, TL, BR, V, R, BL, TR, V, TL, H, BR, V, BL, H, H, BR],
  '4': [TL, TR, TL, TR, V, V, V, V, V, BL, BR, V, BL, H, TR, V, R, R, V, V, R, R, BL, BR],
  '5': [TL, H, H, TR, V, TL, H, BR, V, BL, H, TR, BL, H, TR, V, TL, H, BR, V, BL, H, H, BR],
  '6': [TL, H, H, TR, V, TL, H, BR, V, BL, H, TR, V, TL, TR, V, V, BL, BR, V, BL, H, H, BR],
  '7': [TL, H, H, TR, BL, H, TR, V, R, R, V, V, R, R, V, V, R, R, V, V, R, R, BL, BR],
  '8': [TL, H, H, TR, V, TL, TR, V, V, BL, BR, V, V, TL, TR, V, V, BL, BR, V, BL, H, H, BR],
  '9': [TL, H, H, TR, V, TL, TR, V, V, BL, BR, V, BL, H, TR, V, TL, H, BR, V, BL, H, H, BR]
};

const MORSE_MAP: Record<string, string> = {
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.'
};

const QLOCK_LETTERS: readonly string[] = [
  'ITLISASTIME',
  'ACQUARTERDC',
  'TWENTYFIVEX',
  'HALFSTENFTO',
  'PASTERUNINE',
  'ONESIXTHREE',
  'FOURFIVETWO',
  'EIGHTELEVEN',
  'SEVENTWELVE',
  'TENSEOCLOCK'
];

const QLOCK_HOUR_COORDS: Record<number, readonly [number, number, number]> = {
  1: [5, 0, 2],
  2: [6, 8, 10],
  3: [5, 6, 10],
  4: [6, 0, 3],
  5: [6, 4, 7],
  6: [5, 3, 5],
  7: [8, 0, 4],
  8: [7, 0, 4],
  9: [4, 7, 10],
  10: [9, 0, 2],
  11: [7, 5, 10],
  12: [8, 5, 10]
};

function computeQlockActiveCells(rawH: number, mVal: number): Set<string> {
  const active = new Set<string>();
  const mark = (r: number, c1: number, c2: number) => {
    for (let c = c1; c <= c2; c++) {
      active.add(`${r}-${c}`);
    }
  };

  mark(0, 0, 1); // IT
  mark(0, 3, 4); // IS

  const bucket = Math.floor(mVal / 5) * 5;
  let wordHour = rawH;
  if (bucket >= 35) {
    wordHour = (rawH + 1) % 24;
  }
  const h12 = wordHour % 12 || 12;

  if (bucket === 5 || bucket === 55) mark(2, 6, 9);
  if (bucket === 10 || bucket === 50) mark(3, 5, 7);
  if (bucket === 15 || bucket === 45) {
    mark(1, 0, 0);
    mark(1, 2, 8);
  }
  if (bucket === 20 || bucket === 40) mark(2, 0, 5);
  if (bucket === 25 || bucket === 35) {
    mark(2, 0, 5);
    mark(2, 6, 9);
  }
  if (bucket === 30) mark(3, 0, 3);

  if (bucket > 0 && bucket <= 30) {
    mark(4, 0, 3); // PAST
  } else if (bucket > 30) {
    mark(3, 9, 10); // TO
  } else {
    mark(9, 5, 10); // OCLOCK
  }

  const hc = QLOCK_HOUR_COORDS[h12];
  if (hc) {
    mark(hc[0], hc[1], hc[2]);
  }
  return active;
}

@Component({
  selector: 'app-world-horology',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './world-horology.component.html',
  styleUrl: './world-horology.component.css'
})
export class WorldHorologyComponent {
  private readonly _now = signal(new Date());
  private readonly _use24Hour = signal(true);
  private readonly _theme = signal<FlipClockTheme | null>(null);
  private readonly _spec = signal<WorldMuseumSpec | null>(null);

  @Input({ required: true }) set now(d: Date) {
    this._now.set(d);
  }

  @Input() set use24Hour(val: boolean) {
    this._use24Hour.set(val);
  }

  @Input({ required: true }) set theme(t: FlipClockTheme) {
    this._theme.set(t);
  }

  @Input({ required: true }) set spec(s: WorldMuseumSpec) {
    this._spec.set(s);
  }

  readonly activeTheme = computed(() => this._theme());
  readonly activeSpec = computed(() => this._spec());
  readonly use24 = computed(() => this._use24Hour());

  readonly hoursTwelveArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
  readonly zeroToNine = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
  readonly fourSlots = [1, 2, 3, 4] as const;
  readonly elevenSlots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
  readonly bcdBits = [8, 4, 2, 1] as const;

  readonly t = computed(() => {
    const now = this._now();
    const rawH = now.getHours();
    const ampm = rawH >= 12 ? 'PM' : 'AM';
    const h12 = rawH % 12 || 12;
    const displayH = this._use24Hour() ? rawH : h12;
    const hh = String(displayH).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const dayNum = String(now.getDate()).padStart(2, '0');
    const monNum = String(now.getMonth() + 1).padStart(2, '0');
    const yearFull = String(now.getFullYear());
    const yearShort = yearFull.slice(-2);
    const weekdayShort = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const weekdayFull = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const monthShort = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

    return {
      rawH,
      h12,
      displayH,
      ampm,
      hh,
      mm,
      ss,
      mVal: now.getMinutes(),
      sVal: now.getSeconds(),
      dayNum,
      monNum,
      yearFull,
      yearShort,
      weekdayShort,
      weekdayFull,
      monthShort,
      digits6: [hh[0], hh[1], mm[0], mm[1], ss[0], ss[1]],
      digits8: [hh[0], hh[1], mm[0], mm[1], ss[0], ss[1], dayNum[0], dayNum[1]]
    };
  });

  // Engine 1: QLOCKTWO
  readonly qlockCells = computed(() => {
    const data = this.t();
    const litSet = computeQlockActiveCells(data.rawH, data.mVal);
    const cells: { char: string; lit: boolean }[] = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 11; c++) {
        cells.push({
          char: QLOCK_LETTERS[r][c],
          lit: litSet.has(`${r}-${c}`)
        });
      }
    }
    return cells;
  });

  readonly qlockCornerDots = computed(() => {
    const rem = this.t().mVal % 5;
    return [rem >= 1, rem >= 2, rem >= 3, rem >= 4];
  });

  // Engine 2: A Million Times (144 Mini Analog Clocks)
  readonly millionGroups = computed(() => {
    const data = this.t();
    const toHands = (digitChar: string) =>
      (DIGIT_CLOCKS_4X6[digitChar] ?? DIGIT_CLOCKS_4X6['0']).map((ang) => ({
        hDeg: ang[0] - 90,
        mDeg: ang[1] - 90
      }));
    return [
      [toHands(data.hh[0]), toHands(data.hh[1])],
      [toHands(data.mm[0]), toHands(data.mm[1])],
      [toHands(data.ss[0]), toHands(data.ss[1])]
    ];
  });

  // Engine 3: Linear Vernier / Braun DN50
  readonly vernierCols = computed(() => {
    const data = this.t();
    const specs = [
      { label: 'H1', min: 0, max: 2, val: Number(data.hh[0]), pad: 1 },
      { label: 'H2', min: 0, max: 9, val: Number(data.hh[1]), pad: 1 },
      { label: 'M1', min: 0, max: 5, val: Number(data.mm[0]), pad: 1 },
      { label: 'M2', min: 0, max: 9, val: Number(data.mm[1]), pad: 1 },
      { label: 'S1', min: 0, max: 5, val: Number(data.ss[0]), pad: 1 },
      { label: 'S2', min: 0, max: 9, val: Number(data.ss[1]), pad: 1 },
      { label: 'DAY', min: 1, max: 31, val: Number(data.dayNum), pad: 2 },
      { label: 'MON', min: 1, max: 12, val: Number(data.monNum), pad: 2 }
    ];

    return specs.map((col) => {
      const cells: { text: string; active: boolean }[] = [];
      for (let n = col.min; n <= col.max; n++) {
        cells.push({
          text: col.pad === 2 ? String(n).padStart(2, '0') : String(n),
          active: n === col.val
        });
      }
      const idxOffset = col.val - col.min;
      return {
        label: col.label,
        cells,
        translateY: -(idxOffset * 52)
      };
    });
  });

  // Engine 4: Solari 4-Row Airport Terminal Board
  readonly solariRows = computed(() => {
    const data = this.t();
    const pad = (str: string) => str.padEnd(14, ' ').slice(0, 14).split('');
    return [
      { tone: 'white', chars: pad(`DAY   ${data.weekdayFull}`) },
      { tone: 'amber', chars: pad(`DATE  ${data.dayNum} ${data.monthShort} ${data.yearFull}`) },
      { tone: 'yellow', chars: pad(`TIME  ${data.hh}:${data.mm}:${data.ss}`) },
      { tone: 'green', chars: pad('GATE  ON TIME') }
    ];
  });

  // Engine 5 & 13 & 18: Orbital / Urwerk / Astrolabe angles
  readonly orbitalAngles = computed(() => {
    const data = this.t();
    const hMax = this._use24Hour() ? 24 : 12;
    return {
      urwerkMin: -60 + (data.mVal / 60) * 120,
      urwerkSec: data.sVal * 6,
      ringH: -((data.displayH / hMax) * 360),
      ringM: -((data.mVal / 60) * 360),
      ringS: -((data.sVal / 60) * 360)
    };
  });

  // Engine 8: Berlin Mengenlehreuhr
  readonly berlinState = computed(() => {
    const data = this.t();
    return {
      secEven: data.sVal % 2 === 0,
      h5: Math.floor(data.rawH / 5),
      h1: data.rawH % 5,
      m5: Math.floor(data.mVal / 5),
      m1: data.mVal % 5
    };
  });

  // Engine 9: Nagra Reel-to-Reel
  readonly nagraVu = computed(() => {
    const data = this.t();
    return {
      left: -40 + (data.mVal / 60) * 80,
      right: -40 + (data.sVal / 60) * 80
    };
  });

  // Engine 10: Water Siphon Columns
  readonly siphonCols = computed(() => {
    const data = this.t();
    const hMax = this._use24Hour() ? 24 : 12;
    return [
      {
        label: 'HOURS',
        val: data.hh,
        pct: Math.max(8, (data.displayH / hMax) * 100),
        tone: 'siphon-emerald'
      },
      {
        label: 'MINUTES',
        val: data.mm,
        pct: Math.max(8, (data.mVal / 60) * 100),
        tone: 'siphon-teal'
      },
      {
        label: 'SECONDS',
        val: data.ss,
        pct: Math.max(8, (data.sVal / 60) * 100),
        tone: 'siphon-cyan'
      },
      {
        label: 'DAY',
        val: data.dayNum,
        pct: Math.max(10, (Number(data.dayNum) / 31) * 100),
        tone: 'siphon-indigo'
      },
      {
        label: 'MONTH',
        val: data.monthShort,
        pct: Math.max(12, (Number(data.monNum) / 12) * 100),
        tone: 'siphon-purple'
      }
    ];
  });

  // Engine 14: Swiss Railway Hands
  readonly sbbHands = computed(() => {
    const data = this.t();
    return {
      hour: ((data.displayH % 12) + data.mVal / 60) * 30,
      min: (data.mVal + data.sVal / 60) * 6,
      sec: data.sVal * 6
    };
  });

  // Engine 16: DNA Helix Base-Pairs
  readonly dnaPairs = computed(() => {
    const data = this.t();
    return [
      { label: 'HOUR HI', val: data.hh[0] },
      { label: 'HOUR LO', val: data.hh[1] },
      { label: 'MIN HI', val: data.mm[0] },
      { label: 'MIN LO', val: data.mm[1] },
      { label: 'SEC HI', val: data.ss[0] },
      { label: 'SEC LO', val: data.ss[1] },
      { label: 'DAY', val: data.dayNum },
      { label: 'MONTH', val: data.monthShort }
    ];
  });

  // Engine 17: IBM Punch Card Columns
  readonly punchCardCols = computed(() => {
    const data = this.t();
    const vals = [
      Number(data.hh[0]),
      Number(data.hh[1]),
      Number(data.mm[0]),
      Number(data.mm[1]),
      Number(data.ss[0]),
      Number(data.ss[1]),
      Number(data.dayNum[0]),
      Number(data.dayNum[1]),
      Number(data.monNum[0]),
      Number(data.monNum[1]),
      Number(data.yearShort[0]),
      Number(data.yearShort[1])
    ];
    const headers = ['H1', 'H2', 'M1', 'M2', 'S1', 'S2', 'D1', 'D2', 'M1', 'M2', 'Y1', 'Y2'];
    return vals.map((activeRow, i) => ({ header: headers[i], activeRow }));
  });

  // Engine 20: Soroban Abacus Rods
  readonly abacusRods = computed(() => {
    const data = this.t();
    const labels = ['H1', 'H2', 'M1', 'M2', 'S1', 'S2', 'D1', 'D2'];
    return data.digits8.map((d, idx) => {
      const val = Number(d);
      return {
        label: labels[idx],
        val,
        heavenActive: val >= 5,
        earthCount: val % 5
      };
    });
  });

  // Engine 24: Bauhaus Geometry
  readonly bauhausAngles = computed(() => {
    const data = this.t();
    return {
      circle: (data.displayH % 12) * 30,
      square: data.mVal * 6
    };
  });

  // Engine 27: Bathyscaphe Gauges
  readonly bathyGauges = computed(() => {
    const data = this.t();
    const hMax = this._use24Hour() ? 24 : 12;
    return [
      {
        title: 'HOURS',
        val: data.hh,
        sub: data.weekdayShort,
        deg: (data.displayH / hMax) * 270 - 135
      },
      {
        title: 'MINUTES',
        val: data.mm,
        sub: `${data.dayNum} ${data.monthShort}`,
        deg: (data.mVal / 60) * 270 - 135
      },
      {
        title: 'SECONDS',
        val: data.ss,
        sub: data.yearFull,
        deg: (data.sVal / 60) * 270 - 135
      }
    ];
  });

  // Engine 28: Binary BCD & Morse
  isBitSet(val: number, bit: number): boolean {
    return (val & bit) !== 0;
  }

  readonly bcdColumns = computed(() => {
    const data = this.t();
    const labels = ['H1', 'H2', 'M1', 'M2', 'S1', 'S2', 'D1', 'D2'];
    return data.digits8.map((d, idx) => ({
      label: labels[idx],
      val: Number(d)
    }));
  });

  readonly morseText = computed(() =>
    this.t()
      .digits6.map((d) => MORSE_MAP[d] ?? '-----')
      .join('   ')
  );

  // Engine 12 / 22 / 26: Iso Monolith Blocks
  readonly isoBlocks = computed(() => {
    const data = this.t();
    return [
      { label: 'HRS', val: data.hh },
      { label: 'MIN', val: data.mm },
      { label: 'SEC', val: data.ss },
      { label: data.weekdayShort, val: data.dayNum },
      { label: data.monthShort, val: data.yearShort }
    ];
  });
}
