import { notFound } from 'next/navigation';

import { ChallengeDetail } from '@/features/challenges/ChallengeDetail';
import { challenges } from '@/features/challenges/challenge-data';
import { getChallengeById } from '@/features/challenges/challenge-lookup';

interface ChallengeDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): { id: string }[] {
  return challenges.map((challenge) => ({ id: challenge.id }));
}

export async function generateMetadata({ params }: ChallengeDetailPageProps) {
  const { id } = await params;
  const challenge = getChallengeById(id, challenges);

  if (!challenge) {
    return { title: 'Challenge not found — Stagecraft' };
  }

  return {
    title: `${challenge.title} — Stagecraft`,
    description: challenge.summary,
  };
}

export default async function ChallengeDetailPage({ params }: ChallengeDetailPageProps) {
  const { id } = await params;
  const challenge = getChallengeById(id, challenges);

  if (!challenge) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
      <ChallengeDetail challenge={challenge} />
    </main>
  );
}
