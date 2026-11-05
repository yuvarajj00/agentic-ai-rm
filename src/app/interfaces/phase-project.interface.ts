export interface CoreComponent {
  name: string;
  responsibility: string;
}

export interface RequiredTool {
  tool: string;
  constraints: string;
}

export interface Milestone {
  days: number[];
  result: string;
}

export interface PhaseProject {
  id: string; // P1 - P5
  phase: number;
  week: number;
  dates: {
    start: string;
    end: string;
  };
  name: string;
  level: string;
  objective: string;
  problem_statement: string;
  recommended_stack: string[];
  core_components: CoreComponent[];
  required_tools: RequiredTool[];
  milestones: Milestone[];
  evaluation_rubric?: any[];
  architecture_flow?: any[];
}

