import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurriculumService } from '../../services/curriculum.service';

@Component({
  selector: 'app-milestones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './milestones.component.html',
  styleUrl: './milestones.component.css'
})
export class MilestonesComponent {
  readonly curriculum = inject(CurriculumService);
}
