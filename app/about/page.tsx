import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { CtaLink } from '@nanisoft/prism-ui/components/cta-link';
import { FactList } from '@nanisoft/prism-ui/components/fact-list';
import { Prose } from '@nanisoft/prism-ui/components/prose';
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section';

import { SiteChrome } from '@/components/site-chrome';

// The product's story, not the team's: what Nexus is for, what it is made of, and
// the honest tense of where it stands. Company-level copy stays on www.

export const metadata: Metadata = {
  title: 'About',
  description:
    'Nexus is NaniSoft’s Agent Factory. What it is, what it is made of, and where it stands.',
  alternates: { canonical: '/about' },
};

/** The three facts the page states as a list, as the design system states a fact list. */
const FACTS = [
  {
    label: 'Orchestration',
    value: 'A deterministic state machine on .NET; OpenCode reached through NOpenCode.',
  },
  {
    label: 'Workers',
    value: 'One fresh Docker container per round, from the project’s own image. No host path, no published port.',
  },
  {
    label: 'Scope',
    value: 'Generic. One factory serves every project configured in factories/.',
  },
] as const;

/**
 * The three ways off this page, and they are the same three words the landing and
 * the header use for the same two destinations. A page that offers "Read the docs"
 * here and "Read the design docs" there has published two names for one door, and
 * the third is the repository, which is the only destination on this site that is
 * not about the product.
 */
const OUT = [
  { label: 'Read the docs', href: '/docs' },
  { label: 'Follow the build', href: '/blog' },
  { label: 'This site’s repository', href: 'https://github.com/NaniSoft/nexus' },
] as const;

export default function AboutPage(): ReactElement {
  return (
    <SiteChrome current="/about">
      <Section>
        {/*
          No eyebrow. It read "nanisoft · nexus — about", which is the header's
          brand lockup with a separator on each side and the page's own name again,
          three elements of the same fact. The heading below it is the page's
          argument and needs nothing standing over it.
        */}
        <SectionHeading as="h1" align="left" title="The factory, not another assistant." />
        <Prose className="site-measure">
          <p>
            Nexus is NaniSoft&rsquo;s Agent Factory: a software-creation engine that takes a
            GitHub issue as its input and returns a reviewed, merged pull request as its
            output. One issue, one fresh container, one reviewed change.
          </p>

          <p>
            It exists because of a gap we kept running into. Agent-driven development
            already produces real software. The five Nanisoft sites you can visit were
            built by a person directing a coding agent, repository by repository. What
            it did not produce was repeatability. Every run started with a hand-built
            environment, a prompt standing in for a specification, and a diff reviewed
            in a terminal. The capability was real; the factory around it was not.
          </p>

          <p>
            Nexus is the factory. It watches configured repositories, gives every
            accepted issue its own container, lets{' '}
            <a href="/docs/concepts/orchestration">OpenCode</a> work the issue inside it,
            and puts the change on a{' '}
            <a href="/docs/concepts/kanban-and-the-human-feedback-loop">Kanban board</a>{' '}
            where a human reads the diff and approves it, asks for changes, or rejects
            it. Approval merges. Rejection closes the ticket. Three rounds of feedback
            is the ceiling, and on exhaustion the ticket escalates to a human rather
            than merging or spinning.
          </p>
        </Prose>

        <FactList className="site-about__facts" facts={FACTS} />

        <Prose className="site-measure">
          <p>
            Nexus is the core of the platform story: Atlas, AlphaLens, and Prism are
            built on top of it, and Prism is the design language all of them wear. Read
            that in the honest tense. Agent development built the products you can visit
            today, and Nexus is the engine designed to make that repeatable without a
            person in the middle of every step.
          </p>

          <p>
            The factory runs. It is deployed with Docker Compose, its board is at
            127.0.0.1:5000, and it has taken a real issue on a real repository all the
            way to a merged pull request. There is no release to install yet, and no
            dates here; the release gets announced on the blog when it happens.
          </p>
        </Prose>

        <div className="site-about__links">
          {OUT.map((link) => (
            <CtaLink
              key={link.href}
              href={link.href}
              variant="outline"
              newTab={link.href.startsWith('https')}
            >
              {link.label} →
            </CtaLink>
          ))}
        </div>
      </Section>
    </SiteChrome>
  );
}
