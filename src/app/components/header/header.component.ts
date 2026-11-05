import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoadmapService } from '../../services/roadmap.service';
import { ProgressService } from '../../services/progress.service';

export type NavTab = 'roadmap' | 'weeks' | 'projects' | 'revision';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  roadmapService = inject(RoadmapService);
  progressService = inject(ProgressService);

  @Input() activeTab: NavTab = 'roadmap';
  @Output() tabChange = new EventEmitter<NavTab>();

  setTab(tab: NavTab) {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }
}

