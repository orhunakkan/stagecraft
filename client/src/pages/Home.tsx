import { labs } from '../labs';
import { LabCard } from '../components/LabCard';
import { useLabProgress } from '../lib/useLabProgress';

export function Home() {
  const { isCompleted } = useLabProgress();
  const readyLabs = labs.filter((l) => l.status === 'ready');
  const comingSoonLabs = labs.filter((l) => l.status === 'coming-soon');

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-content">Practice Labs</h1>
        <p className="mt-2 text-muted">
          Interactive Playwright challenges. Read the lab, interact with the UI, then write your own
          tests in a separate project — no spoilers here.
        </p>
      </div>

      <section className="mb-10" aria-label="Ready labs">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Ready — {readyLabs.length} labs
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {readyLabs.map((lab) => (
            <LabCard key={lab.slug} lab={lab} completed={isCompleted(lab.slug)} />
          ))}
        </div>
      </section>

      <section aria-label="Coming soon labs">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Coming soon — {comingSoonLabs.length} labs
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {comingSoonLabs.map((lab) => (
            <LabCard key={lab.slug} lab={lab} />
          ))}
        </div>
      </section>

      <section aria-label="About the author" className="mt-16 border-t border-edge pt-10">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted">
          About the Author
        </h2>
        <div className="flex items-start gap-5">
          <img
            src="/profile-picture.jpg"
            alt="Orhun Akkan"
            className="h-16 w-16 rounded-full object-cover flex-shrink-0 ring-2 ring-edge"
          />
          <div>
            <p className="font-semibold text-content">Orhun Akkan</p>
            <p className="text-sm text-muted mb-2">
              Senior QA Engineer · 8+ years in test automation
            </p>
            <p className="text-sm text-muted max-w-prose">
              Built Stagecraft to provide realistic, hands-on Playwright challenges. Expert in
              Playwright, Cypress, and Selenium WebDriver — currently a Test Automation Engineer at
              Northern Trust.
            </p>
            <a
              href="https://www.linkedin.com/in/orhun-akkan"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
            >
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452H17.02v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.607V9h3.274v1.561h.046c.455-.861 1.566-1.769 3.224-1.769 3.449 0 4.086 2.27 4.086 5.222v6.438zM5.337 7.433a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8zm1.638 13.019H3.7V9h3.275v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              linkedin.com/in/orhun-akkan
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
