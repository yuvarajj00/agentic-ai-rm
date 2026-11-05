import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurriculumService } from '../../services/curriculum.service';

export interface StageMeta {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  weeks: string;
  skillSpan: string;
  description: string;
}

@Component({
  selector: 'app-tech-stack',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tech-stack.component.html',
  styleUrl: './tech-stack.component.css'
})
export class TechStackComponent {
  readonly curriculum = inject(CurriculumService);
  readonly selectedStage = signal<string>('all');
  readonly searchQuery = signal<string>('');

  readonly stageList: StageMeta[] = [
    {
      id: 'Stage 1: Programming & Developer Tools',
      name: 'Stage 1: Programming & Developer Tools',
      shortName: '1. Foundations',
      badge: 'STG 01',
      weeks: 'Week 1',
      skillSpan: 'Skills #01 - #05',
      description: 'Zero-to-one developer environment: clean Python, isolated venvs, Git workflows, Jupyter exploratory notebooks, and core DSA.'
    },
    {
      id: 'Stage 2: Mathematics & Statistical Intuition',
      name: 'Stage 2: Mathematics & Statistical Intuition',
      shortName: '2. Math & Stats',
      badge: 'STG 02',
      weeks: 'Weeks 2 - 3',
      skillSpan: 'Skills #06 - #07',
      description: 'The mathematical spine of machine learning: vectors, dot products, loss gradients, probability distributions, Bayes theorem, and hypothesis testing.'
    },
    {
      id: 'Stage 3: Data Engineering, Manipulation & EDA',
      name: 'Stage 3: Data Engineering, Manipulation & EDA',
      shortName: '3. Data & EDA',
      badge: 'STG 03',
      weeks: 'Weeks 3 - 4',
      skillSpan: 'Skills #08 - #12',
      description: 'High-performance data wrangling: NumPy array vectorization, Pandas cleaning pipelines, SQL querying, and diagnostic Matplotlib/Seaborn visualizations.'
    },
    {
      id: 'Stage 4: Classical Machine Learning & Validation',
      name: 'Stage 4: Classical Machine Learning & Validation',
      shortName: '4. Classical ML',
      badge: 'STG 04',
      weeks: 'Weeks 5 - 8',
      skillSpan: 'Skills #13 - #19',
      description: 'Predictive modeling discipline: scikit-learn pipelines, metric selection, regression/classification, trees, ensembles, PCA, and fairness governance.'
    },
    {
      id: 'Stage 5: Deep Learning & Applied AI',
      name: 'Stage 5: Deep Learning & Applied AI',
      shortName: '5. Deep Learning',
      badge: 'STG 05',
      weeks: 'Weeks 9 - 10',
      skillSpan: 'Skills #20 - #21',
      description: 'Modern representations: PyTorch neural networks, autograd training loops, and Hugging Face sentence transformers for dense vector embeddings.'
    },
    {
      id: 'Stage 6: Software Engineering & Model Serving',
      name: 'Stage 6: Software Engineering & Model Serving',
      shortName: '6. Serving & Testing',
      badge: 'STG 06',
      weeks: 'Weeks 11 - 12',
      skillSpan: 'Skills #22 - #25',
      description: 'Turning models into production software: pipeline serialization, high-throughput FastAPI REST services, pytest automation suites, and 12-factor configuration.'
    },
    {
      id: 'Stage 7: Production Containers & MLOps',
      name: 'Stage 7: Production Containers & MLOps',
      shortName: '7. MLOps & CI/CD',
      badge: 'STG 07',
      weeks: 'Weeks 12 - 13',
      skillSpan: 'Skills #26 - #30',
      description: 'Operationalizing models: multi-stage Docker builds, GitHub Actions CI automation, MLflow experiment tracking, cloud hosting, and drift detection.'
    },
    {
      id: 'Stage 8: Portfolio & Interview Mastery',
      name: 'Stage 8: Portfolio & Interview Mastery',
      shortName: '8. Portfolio',
      badge: 'STG 08',
      weeks: 'Week 14',
      skillSpan: 'Skill #31',
      description: 'Demonstrating senior capability: production GitHub portfolios, architectural design diagrams, technical walkthroughs, and hiring manager storytelling.'
    }
  ];

  readonly stages = [
    'all',
    'Stage 1: Programming & Developer Tools',
    'Stage 2: Mathematics & Statistical Intuition',
    'Stage 3: Data Engineering, Manipulation & EDA',
    'Stage 4: Classical Machine Learning & Validation',
    'Stage 5: Deep Learning & Applied AI',
    'Stage 6: Software Engineering & Model Serving',
    'Stage 7: Production Containers & MLOps',
    'Stage 8: Portfolio & Interview Mastery'
  ];

  readonly filteredSkills = computed(() => {
    let list = this.curriculum.techStack();
    const stage = this.selectedStage();
    const query = this.searchQuery().toLowerCase().trim();

    if (stage !== 'all') {
      list = list.filter(s => s.stage === stage);
    }

    if (query) {
      list = list.filter(s =>
        s.technology.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        s.whatToLearn.toLowerCase().includes(query) ||
        s.proofProject.toLowerCase().includes(query)
      );
    }

    // Always keep skills sorted by canonical scratch-to-master order
    return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  getStageMeta(stageName?: string): StageMeta | undefined {
    return this.stageList.find(s => s.id === stageName || s.name === stageName);
  }

  getSkillsForStage(stageId: string) {
    return this.curriculum.techStack().filter(s => s.stage === stageId);
  }
}
