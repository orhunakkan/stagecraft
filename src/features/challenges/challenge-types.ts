export const challengeDifficulties = ['beginner', 'intermediate', 'advanced'] as const;

export type ChallengeDifficulty = (typeof challengeDifficulties)[number];

export const challengeTags = [
  'locators',
  'assertions',
  'forms',
  'tables',
  'network',
  'auth',
  'accessibility',
  'api',
  'visual',
  'debugging',
  'fixtures',
  'tracing',
  'screenshots',
  'downloads',
  'uploads',
  'dialogs',
  'tabs',
  'frames',
  'mobile-emulation',
  'retries',
  'parallelism',
  'configuration',
  'clock',
  'drag-drop',
  'aria-snapshots',
  'browser-apis',
  'websockets',
  'parameterization',
  'refactoring',
] as const;

export type ChallengeTag = (typeof challengeTags)[number];

export interface PracticeLabSummary {
  labId: string;
  title: string;
  route: string;
  kind?: 'lab' | 'concept';
}

export interface ChallengeContent {
  scenario: string;
  learningObjective: string;
  instructions: readonly string[];
  acceptanceCriteria: readonly string[];
  constraints: readonly string[];
  hints?: readonly string[];
  conceptReferences?: readonly string[];
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: ChallengeDifficulty;
  estimatedMinutes: number;
  primaryConcept: string;
  summary: string;
  tags: readonly ChallengeTag[];
  practice: PracticeLabSummary;
  content: ChallengeContent;
}
