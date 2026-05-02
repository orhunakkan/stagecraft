export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <section className="stage-card relative overflow-hidden px-8 py-10 sm:px-14 sm:py-12">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />
        <p className="stage-badge mx-auto mb-6">Playwright practice lab</p>
        <h1 className="stage-gradient-text text-6xl font-black tracking-tight sm:text-8xl">
          Stagecraft
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Practice modern Playwright test automation skills through hands-on browser challenges.
        </p>
        <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-sm font-semibold text-primary">Accessible</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Built around semantic UI patterns and readable focus states.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-sm font-semibold text-secondary">Deterministic</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Designed for stable local practice and repeatable automation runs.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-sm font-semibold text-accent">Theme-ready</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Color tokens support intentionally designed light and dark modes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
