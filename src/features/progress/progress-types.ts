export const challengeStatuses = ['notStarted', 'inProgress', 'practiced', 'completed'] as const;

export type ChallengeStatus = (typeof challengeStatuses)[number];

export const statusLabels: Record<ChallengeStatus, string> = {
  notStarted: 'Not started',
  inProgress: 'In progress',
  practiced: 'Practiced',
  completed: 'Completed',
};

export const statusColors: Record<ChallengeStatus, string> = {
  notStarted: 'border-border bg-muted text-muted-foreground',
  inProgress: 'border-warning/50 bg-warning/14 text-warning-foreground',
  practiced: 'border-secondary/50 bg-secondary/14 text-secondary',
  completed: 'border-success/50 bg-success/14 text-success',
};

export const statusActiveColors: Record<ChallengeStatus, string> = {
  notStarted: 'border-border bg-muted/80 text-foreground ring-2 ring-ring/30',
  inProgress: 'border-warning bg-warning/28 text-warning-foreground ring-2 ring-warning/30',
  practiced: 'border-secondary bg-secondary/28 text-secondary ring-2 ring-secondary/30',
  completed: 'border-success bg-success/28 text-success ring-2 ring-success/30',
};
