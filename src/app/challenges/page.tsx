import { ChallengeCatalog } from '@/features/challenges/ChallengeCatalog';
import { challenges } from '@/features/challenges/challenge-data';

export default function ChallengesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
      <ChallengeCatalog challenges={challenges} />
    </main>
  );
}
