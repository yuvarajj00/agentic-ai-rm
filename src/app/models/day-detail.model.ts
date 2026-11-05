export interface SubTopic {
  id: string;
  title: string;
  summary: string;
  detailedExplanation: string;
  codeExample?: string;
  keyTakeaways: string[];
}

export interface PracticeQuestion {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'ML-Applied';
  prompt: string;
  hints?: string[];
  solutionCode: string;
  explanation: string;
}

export interface StudyResource {
  title: string;
  url: string;
  type: 'docs' | 'video' | 'tutorial';
  badge: string;
}

export interface DayTaskItem {
  id: string;
  text: string;
  type?: 'learn' | 'practice' | 'build' | 'review' | string;
}

export interface LearningChecklistCategory {
  category: string;
  items: string[];
}

export interface DayDeliverables {
  requiredFiles: string[];
  description: string;
}

export interface DayDetail {
  day: number;
  taskTitle: string;
  topic: string;
  topicGroup: string;
  overview: string;
  week?: number;
  date?: string;
  isoDate?: string;

  // The 9 Granular Checklist Sections
  goal?: string;
  prerequisites?: string[];
  learningChecklist?: LearningChecklistCategory[];
  implementationChecklist?: string[];
  failureCases?: string[];
  deliverables?: DayDeliverables;
  completionCriteria?: string[];
  activeRecallQuestions?: string[];
  advancedTopics?: string[];

  // Supporting & Backward-compatible Fields
  timeBudget: {
    recallMins: number;
    theoryMins: number;
    codingMins: number;
    reviewMins: number;
    totalMins: number;
  };
  studyLinks: StudyResource[];
  subtopics: SubTopic[];
  practiceQuestions: PracticeQuestion[];
  starterCode: {
    filename: string;
    code: string;
    description: string;
  };
  commonPitfalls: string[];
  interviewAngle: {
    question: string;
    answer: string;
    whyItMatters: string;
  };
  thingsToDoThisDay?: DayTaskItem[];
}
