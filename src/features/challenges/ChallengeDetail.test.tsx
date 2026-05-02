import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChallengeDetail } from './ChallengeDetail';
import { challenges } from './challenge-data';

const accessibleLocatorsChallenge = challenges.find((c) => c.id === 'accessible-locators')!;
const networkApiChallenge = challenges.find((c) => c.id === 'network-api')!;

describe('ChallengeDetail', () => {
  it('renders the challenge title as the main heading', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Accessible Locators Lab' })).toBeVisible();
  });

  it('shows difficulty, estimated time, and primary concept', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    expect(screen.getByText('beginner')).toBeVisible();
    expect(screen.getByText('20 min')).toBeVisible();
    expect(screen.getByText('Accessible locators')).toBeVisible();
  });

  it('renders challenge tags', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    const tagList = screen.getByRole('list', { name: /challenge tags/i });
    expect(within(tagList).getByText('locators')).toBeVisible();
    expect(within(tagList).getByText('accessibility')).toBeVisible();
  });

  it('renders the scenario section', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    expect(screen.getByRole('heading', { name: /scenario/i })).toBeVisible();
    expect(screen.getByText(accessibleLocatorsChallenge.content.scenario)).toBeVisible();
  });

  it('renders the learning objective section', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    expect(screen.getByRole('heading', { name: /learning objective/i })).toBeVisible();
    expect(screen.getByText(accessibleLocatorsChallenge.content.learningObjective)).toBeVisible();
  });

  it('renders all instructions as an ordered list', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    expect(screen.getByRole('heading', { name: /instructions/i })).toBeVisible();

    const instructionsList = screen.getByRole('list', { name: /challenge instructions/i });
    const items = within(instructionsList).getAllByRole('listitem');
    expect(items).toHaveLength(accessibleLocatorsChallenge.content.instructions.length);

    for (const instruction of accessibleLocatorsChallenge.content.instructions) {
      expect(screen.getByText(instruction)).toBeVisible();
    }
  });

  it('renders acceptance criteria as a list', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    expect(screen.getByRole('heading', { name: /acceptance criteria/i })).toBeVisible();

    const criteriaList = screen.getByRole('list', { name: /acceptance criteria/i });
    const items = within(criteriaList).getAllByRole('listitem');
    expect(items).toHaveLength(accessibleLocatorsChallenge.content.acceptanceCriteria.length);
  });

  it('renders constraints as a list', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    expect(screen.getByRole('heading', { name: /constraints/i })).toBeVisible();

    const constraintsList = screen.getByRole('list', { name: /constraints/i });
    const items = within(constraintsList).getAllByRole('listitem');
    expect(items).toHaveLength(accessibleLocatorsChallenge.content.constraints.length);
  });

  it('renders conceptual hints when present', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    expect(screen.getByRole('heading', { name: /hints/i })).toBeVisible();
    expect(
      screen.getByText(/conceptual guidance only — no solution scripts/i),
    ).toBeVisible();

    const hintsList = screen.getByRole('list', { name: /conceptual hints/i });
    const items = within(hintsList).getAllByRole('listitem');
    expect(items).toHaveLength(accessibleLocatorsChallenge.content.hints!.length);
  });

  it('renders Playwright concept references when present', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    expect(screen.getByRole('heading', { name: /playwright concepts/i })).toBeVisible();

    const conceptList = screen.getByRole('list', { name: /playwright concept references/i });
    const items = within(conceptList).getAllByRole('listitem');
    expect(items).toHaveLength(accessibleLocatorsChallenge.content.conceptReferences!.length);
  });

  it('renders the practice link pointing to the correct route', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    const practiceLink = screen.getByRole('link', { name: /open accessible locators lab/i });
    expect(practiceLink).toBeVisible();
    expect(practiceLink).toHaveAttribute('href', '/practice/accessible-locators');
  });

  it('renders a breadcrumb navigation back to the catalog', () => {
    render(<ChallengeDetail challenge={accessibleLocatorsChallenge} />);

    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(within(breadcrumb).getByRole('link', { name: 'Challenge catalog' })).toHaveAttribute(
      'href',
      '/challenges',
    );
    expect(within(breadcrumb).getByText('Accessible Locators Lab')).toBeVisible();
  });

  it('works for a different challenge — network api', () => {
    render(<ChallengeDetail challenge={networkApiChallenge} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Network API Lab' })).toBeVisible();
    expect(screen.getByText('intermediate')).toBeVisible();
    expect(screen.getByText('35 min')).toBeVisible();

    const practiceLink = screen.getByRole('link', { name: /open network api lab/i });
    expect(practiceLink).toHaveAttribute('href', '/practice/network-api');
  });
});
