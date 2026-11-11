import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flip-unit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flip-unit.component.html',
  styleUrl: './flip-unit.component.css'
})
export class FlipUnitComponent {
  private readonly _current = signal<string>('00');
  readonly current = this._current.asReadonly();
  readonly previous = signal<string>('00');
  readonly flipTick = signal<number>(0);

  private initialized = false;
  private lastForceCount = 0;
  private didFlipThisCycle = false;

  @Input() isSeconds = false;
  @Input() amPmBadge = '';
  @Input() isGradientText = false;

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
    this.flipTick.update((count) => count + 1);
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
}
