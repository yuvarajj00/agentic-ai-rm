export interface FormattedDeliverable {
  description: string;
  files: string[];
}

export interface FormattedOutcome {
  goal: string;
  criteria: string[];
}

export class CurriculumFormatter {
  static getPrerequisites(inputsText?: string, detailPrereqs?: string[]): string[] {
    if (detailPrereqs && detailPrereqs.length > 0) {
      return detailPrereqs;
    }
    if (!inputsText) return [];
    const clean = inputsText.replace(/^Prerequisites:\s*/i, '').replace(/^Inputs:\s*/i, '');
    const parts = clean.split(/[;\n•]/).map(s => s.trim()).filter(s => s.length > 0);
    return parts.length > 0 ? parts : [clean];
  }

  static getExerciseSteps(exerciseText?: string, detailSteps?: string[]): string[] {
    if (detailSteps && detailSteps.length > 0) {
      return detailSteps;
    }
    if (!exerciseText) return [];
    const parts = exerciseText.split(/[•\n]/).map(s => s.trim()).filter(s => s.length > 0);
    return parts.length > 0 ? parts : [exerciseText];
  }

  static getDeliverable(
    deliverableText?: string,
    detailDeliverable?: { description?: string; requiredFiles?: string[] }
  ): FormattedDeliverable {
    if (detailDeliverable) {
      return {
        description: detailDeliverable.description || '',
        files: detailDeliverable.requiredFiles || []
      };
    }
    if (!deliverableText) return { description: '', files: [] };

    const parenMatch = deliverableText.match(/(.*?)\s*[\(\[](?:\s*Files:\s*)?([^\)\]]+)[\)\]]/i);
    if (parenMatch) {
      const description = parenMatch[1].trim();
      const files = parenMatch[2].split(',').map(f => f.trim()).filter(f => f.length > 0);
      return { description, files };
    }
    return { description: deliverableText, files: [] };
  }

  static getOutcome(
    outcomeText?: string,
    detailGoal?: string,
    detailCriteria?: string[]
  ): FormattedOutcome {
    if (detailGoal || (detailCriteria && detailCriteria.length > 0)) {
      return {
        goal: detailGoal || '',
        criteria: detailCriteria || []
      };
    }
    if (!outcomeText) return { goal: '', criteria: [] };

    let goal = '';
    let criteria: string[] = [];

    const goalMatch = outcomeText.match(/Goal:\s*([^]+?)(?=\s*Completion:|$)/i);
    if (goalMatch) {
      goal = goalMatch[1].trim();
    }
    const compMatch = outcomeText.match(/Completion:\s*([^]+)$/i);
    if (compMatch) {
      criteria = compMatch[1].split(/[;\n•]/).map(c => c.trim()).filter(c => c.length > 0);
    }

    if (!goal && criteria.length === 0) {
      goal = outcomeText;
    }

    return { goal, criteria };
  }

  static formatCodeSpans(text: string): string {
    if (!text) return '';
    return text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  }
}
