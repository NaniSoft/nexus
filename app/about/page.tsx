import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { CtaLink } from '@nanisoft/prism-ui/components/cta-link';
import { FactList } from '@nanisoft/prism-ui/components/fact-list';
import { Prose } from '@nanisoft/prism-ui/components/prose';
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section';

// The product's story, not the team's: what Nexus is for, what it is made of, and
// the honest tense of where it stands. Company-level copy stays on www.

export const metadata: Metadata = {
  title: 'About',
  description:
    'Nexus is the Agent Factory — NaniSoft’s autonomous software-creation engine. What it is, what it is made of, and where it stands.',
};

/** The three facts the page states as a list, as the design system states a fact list. */
const FACTS = [
  {
    label: 'Orchestration',
    value: 'Microsoft Agent Framework on .NET; OpenCode reached through NOpenCode.',
  },
  {
    label: 'Workers',
    value: 'One fresh Docker container per issue, from the project’s own image.',
  },
  {
    label: 'Scope',
    value: 'Generic — one factory serves every project configured in factories/.',
  },
] as const;

export default function AboutPage(): ReactElement {
  return (
    <Section>
      <SectionHeading
        as="h1"
        align="left"
        eyebrow="nanisoft · nexus — about"
        title="The factory, not another assistant."
      />
      <Prose className="site-measure">
        <p>
          Nexus is NaniSoft&rsquo;s Agent Factory: an autonomous software-creation engine that
          orchestrates multiple AI agents, harnesses, planning, code generation, testing, validation,
          and product assembly. It takes a GitHub issue as its input and returns a reviewed, merged
          pull request as its output. One issue, one fresh container, one reviewed change.
        </p>

        <p>
          It exists because of a gap we kept running into. Agent-driven development already produces
          real software — the five Nanisoft sites you can visit were built by a person directing a
          coding agent, repository by repository. What it did not produce was repeatability. Every run
          started with a hand-built environment, a prompt standing in for a specification, and a diff
          reviewed in a terminal. The capability was real; the factory around it was not.
        </p>

        <p>
          Nexus is the factory. It watches configured repositories, gives every issue its own
          container, lets <a href="/docs/concepts/orchestration">OpenCode and code-server</a> work the
          issue inside it, and puts the result on a{' '}
          <a href="/docs/concepts/kanban-and-the-human-feedback-loop">Kanban board</a> where a human
          approves it, asks for changes, or rejects it. Approval merges. Rejection closes the ticket.
          Three rounds of feedback is the ceiling — after that the loop closes rather than spinning.
        </p>
      </Prose>

      <FactList className="site-about__facts" facts={FACTS} />

      <Prose className="site-measure">
        <p>
          Nexus is the core of the platform story: Atlas, AlphaLens, and Prism are built on top of it,
          and Prism is the design language all of them wear. Read that in the honest tense — agent
          development built the products you can visit today, and Nexus is the engine designed to make
          that repeatable without a person in the middle of every step.
        </p>

        <p>
          The factory is in active development. The design is complete and documented; implementation
          is specified and sequenced, and has not started. There are no dates here and nothing to
          install — the design is public, the build is public, and the release gets announced on the
          blog when it happens.
        </p>
      </Prose>

      <div className="site-about__links">
        <CtaLink href="/docs" variant="outline">
          Read the docs →
        </CtaLink>
        <CtaLink href="/blog" variant="outline">
          Follow the build →
        </CtaLink>
        <CtaLink href="https://github.com/NaniSoft/nexus" variant="outline" newTab>
          This site&rsquo;s repository →
        </CtaLink>
      </div>
    </Section>
  );
}
