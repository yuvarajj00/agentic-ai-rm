import { TopicGroup } from '../../models/curriculum.model';

export const TOPIC_GROUPS: TopicGroup[] = [
  'Raw LLM & Functions',
  'Agentic RAG & Memory',
  'LangGraph & Workflows',
  'Multi-Agent Systems',
  'Production & Guardrails',
  'Developer Tools',
  'Portfolio & Interview'
];

export const WEEKS_LIST: number[] = [1, 2, 3, 4, 5];

export interface MotivationalQuote {
  first: string;
  second: string;
}

export const ROTATING_QUOTES: MotivationalQuote[] = [
  { first: 'BUILD.', second: 'SHIP. REPEAT.' },
  { first: 'MASTER', second: 'THE CRAFT.' },
  { first: 'PROGRESS', second: 'OVER PERFECTION.' },
  { first: 'CODE.', second: 'DEPLOY. CONQUER.' },
  { first: 'DISCIPLINE', second: 'OVER MOTIVATION.' },
  { first: 'EXECUTE', second: 'EVERY DAY.' },
  { first: 'ONE STEP', second: 'CLOSER.' },
  { first: 'ITERATE', second: 'UNTIL GREAT.' },
  { first: 'FOCUS.', second: 'BUILD. SHIP.' },
  { first: 'RELENTLESS', second: 'CONSISTENCY.' },
  { first: 'SOLVE.', second: 'OPTIMIZE. SCALE.' }
];
