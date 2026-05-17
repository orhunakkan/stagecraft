import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LabCard } from '../src/components/LabCard';
import { ComingSoon } from '../src/pages/practice/ComingSoon';
import { Home } from '../src/pages/Home';
import { LabPage } from '../src/pages/LabPage';
import { Shell } from '../src/layouts/Shell';
import { labs, type Lab } from '../src/labs';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

const readyLab: Lab = {
  slug: 'sample-ready',
  title: 'Sample Ready Lab',
  topic: 'A short topic line',
  apis: ['locator.fill', 'expect.toHaveText', 'page.goto', 'page.route'],
  status: 'ready',
  requiresBackend: true,
};

const comingSoonLab: Lab = {
  slug: 'sample-soon',
  title: 'Sample Soon Lab',
  topic: 'Upcoming topic',
  apis: ['page.evaluate'],
  status: 'coming-soon',
  requiresBackend: false,
};

function renderWithRouter(ui: React.ReactNode, initialEntries: string[] = ['/']) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

describe('LabCard', () => {
  test('ready lab renders inside a link to /practice/<slug> with the lab title as accessible name', () => {
    renderWithRouter(<LabCard lab={readyLab} />);

    const link = screen.getByRole('link', { name: 'Sample Ready Lab' });
    expect(link).toHaveAttribute('href', '/practice/sample-ready');
  });

  test('ready lab without completion shows Ready badge and no Done badge', () => {
    renderWithRouter(<LabCard lab={readyLab} />);

    expect(screen.getByText('Ready')).toBeVisible();
    expect(screen.queryByText('✓ Done')).not.toBeInTheDocument();
  });

  test('ready lab with completed=true shows the Done badge', () => {
    renderWithRouter(<LabCard lab={readyLab} completed />);

    expect(screen.getByText('✓ Done')).toBeVisible();
  });

  test('coming-soon lab does not render a link and shows the Soon badge', () => {
    renderWithRouter(<LabCard lab={comingSoonLab} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Soon')).toBeVisible();
  });

  test('shows only the first three apis with a +N indicator when there are more', () => {
    renderWithRouter(<LabCard lab={readyLab} />);

    expect(screen.getByText('locator.fill')).toBeVisible();
    expect(screen.getByText('expect.toHaveText')).toBeVisible();
    expect(screen.getByText('page.goto')).toBeVisible();
    expect(screen.queryByText('page.route')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeVisible();
  });

  test('shows the Requires backend hint when requiresBackend is true', () => {
    renderWithRouter(<LabCard lab={readyLab} />);

    expect(screen.getByText(/Requires backend/)).toBeVisible();
  });

  test('does not show the Requires backend hint when requiresBackend is false', () => {
    renderWithRouter(<LabCard lab={comingSoonLab} />);

    expect(screen.queryByText(/Requires backend/)).not.toBeInTheDocument();
  });
});

describe('Home', () => {
  test('renders all 20 ready labs as links to their practice routes', () => {
    renderWithRouter(<Home />);

    const readySection = screen.getByLabelText('Ready labs');
    const links = within(readySection).getAllByRole('link');
    expect(links).toHaveLength(20);

    for (const lab of labs) {
      const link = within(readySection).getByRole('link', { name: lab.title });
      expect(link).toHaveAttribute('href', `/practice/${lab.slug}`);
    }
  });

  test('shows the ready section count and empty coming-soon section', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Ready — 20 labs')).toBeVisible();
    expect(screen.getByText('Coming soon — 0 labs')).toBeVisible();

    const soonSection = screen.getByLabelText('Coming soon labs');
    expect(within(soonSection).queryByRole('link')).not.toBeInTheDocument();
  });

  test('reflects completed labs from localStorage with the Done badge', () => {
    localStorage.setItem('stagecraft:completed', JSON.stringify(['async-ui', 'fake-auth']));
    renderWithRouter(<Home />);

    const doneBadges = screen.getAllByText('✓ Done');
    expect(doneBadges).toHaveLength(2);
  });
});

describe('Shell', () => {
  test('shows brand link only (no Back link) on the home route', () => {
    renderWithRouter(
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<p>home content</p>} />
        </Route>
      </Routes>,
      ['/'],
    );

    expect(screen.getByRole('link', { name: /Stagecraft/ })).toBeVisible();
    expect(screen.queryByRole('link', { name: /All labs/ })).not.toBeInTheDocument();
    expect(screen.getByText('home content')).toBeVisible();
  });

  test('shows the All labs link on a non-home route', () => {
    renderWithRouter(
      <Routes>
        <Route element={<Shell />}>
          <Route path="/practice/anything" element={<p>lab content</p>} />
        </Route>
      </Routes>,
      ['/practice/anything'],
    );

    const backLink = screen.getByRole('link', { name: /All labs/ });
    expect(backLink).toHaveAttribute('href', '/');
    expect(screen.getByText('lab content')).toBeVisible();
  });
});

describe('LabPage routing fallback', () => {
  test('redirects to home when the slug is unknown', () => {
    renderWithRouter(
      <Routes>
        <Route index element={<p>home landing</p>} />
        <Route path="/practice/:slug" element={<LabPage />} />
      </Routes>,
      ['/practice/totally-unknown-slug'],
    );

    expect(screen.getByText('home landing')).toBeVisible();
  });

  test('renders ComingSoon for a known slug when no dedicated route exists', () => {
    // Pick the first registered lab — LabPage is only mounted when no
    // dedicated route handles the slug, so it renders ComingSoon for any
    // lab that lands on this catch-all.
    const lab = labs[0];
    renderWithRouter(
      <Routes>
        <Route path="/practice/:slug" element={<LabPage />} />
      </Routes>,
      [`/practice/${lab.slug}`],
    );

    expect(screen.getByText('Coming Soon')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1, name: lab.title })).toBeVisible();
  });
});

describe('ComingSoon', () => {
  test('renders the lab title, topic, and every api badge', () => {
    render(<ComingSoon lab={readyLab} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Sample Ready Lab' })).toBeVisible();
    expect(screen.getByText('A short topic line')).toBeVisible();
    for (const api of readyLab.apis) {
      expect(screen.getByText(api)).toBeVisible();
    }
  });
});
