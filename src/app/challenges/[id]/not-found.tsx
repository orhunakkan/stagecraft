import Link from 'next/link';

export default function ChallengeNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
      <p className="stage-badge mb-6">404 — Not found</p>
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        Challenge not found
      </h1>
      <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
        The challenge you&apos;re looking for doesn&apos;t exist or may have been moved. Head back
        to the catalog to browse all available challenges.
      </p>
      <Link
        href="/challenges"
        className="mt-8 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-black text-primary-foreground transition hover:bg-primary/92 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Back to challenge catalog
      </Link>
    </main>
  );
}
