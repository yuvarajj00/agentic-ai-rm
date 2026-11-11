import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CurriculumService } from '../../../services/curriculum.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  readonly curriculum = inject(CurriculumService);

  downloadBackupJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(this.curriculum.exportFullJson());
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `ml_roadmap_backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  }

  triggerFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          this.curriculum.importFullJson(text);
        }
        input.value = '';
      };
      reader.readAsText(file);
    }
  }
}
