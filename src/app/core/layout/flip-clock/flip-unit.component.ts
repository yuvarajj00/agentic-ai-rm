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

  @Input() badge = '';
  @Input() showFanEdge = false;

  @Input({ required: true }) set value(next: string) {
    const clean = next ?? '00';
    if (!this.initialized) {
      this.initialized = true;
      this._current.set(clean);
      this.previous.set(clean);
      return;
    }

    const curr = this._current();
    if (curr !== clean) {
      this.previous.set(curr);
      this._current.set(clean);
      this.flipTick.update(n => n + 1);
    }
  }
}
