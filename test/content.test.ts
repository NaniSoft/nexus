import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// Content contract (ticket 06 fixes the docs IA and the four launch posts).
//
// This reads `content/` from disk rather than importing lib/source: fumadocs'
// `defineDocs` is a compile-time macro that only the bundler plugin expands, so
// the loaders cannot run under vitest (prism's own tests avoid them for the
// same reason).

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'content', 'docs');
const BLOG = path.join(ROOT, 'content', 'blog');

const SECTIONS = ['concepts', 'architecture', 'configuration', 'operations', 'guides', 'reference'] as const;

const PAGES: Record<(typeof SECTIONS)[number], string[]> = {
  concepts: [
    'the-factory-model',
    'worker-containers',
    'orchestration',
    'kanban-and-the-human-feedback-loop',
    'multi-project-processing',
  ],
  architecture: [
    'system-overview',
    'orchestration-layer',
    'worker-container-lifecycle',
    'kanban-service',
    'observability-and-error-handling',
  ],
  configuration: ['the-configuration-model', 'the-factories-layout', 'secrets-and-token-scopes', 'rootless-docker'],
  operations: ['deployment', 'testing-strategy'],
  guides: ['writing-an-issue-the-factory-can-build', 'reviewing-agent-work-on-the-kanban'],
  reference: ['configuration-schema', 'glossary'],
};

const LAUNCH_POSTS = [
  'software-that-builds-software',
  'the-anatomy-of-an-agent-factory',
  'humans-in-the-loop-three-rounds-max',
  'these-sites-were-built-by-agents',
] as const;

/** Frontmatter body of an MDX file, or null when it has none. */
async function frontmatter(file: string): Promise<string> {
  const source = await readFile(file, 'utf8');
  const match = /^---\n([\s\S]*?)\n---/.exec(source);
  return match?.[1] ?? '';
}

describe('docs IA', () => {
  it('opens with the introduction', async () => {
    const meta = JSON.stringify(await readFile(path.join(DOCS, 'meta.json'), 'utf8'));
    expect(meta).toContain('introduction');
    expect(await readdir(DOCS)).toContain('introduction.mdx');
  });

  it('carries all six sections, each with an index page', async () => {
    for (const section of SECTIONS) {
      await expect(readFile(path.join(DOCS, section, 'index.mdx'), 'utf8')).resolves.toBeTruthy();
      await expect(readFile(path.join(DOCS, section, 'meta.json'), 'utf8')).resolves.toBeTruthy();
    }
  });

  it('carries every page the IA names, each with a title and description', async () => {
    for (const section of SECTIONS) {
      for (const page of PAGES[section]) {
        const meta = await frontmatter(path.join(DOCS, section, `${page}.mdx`));
        expect(meta, `${section}/${page} is missing`).toMatch(/title:/);
        expect(meta, `${section}/${page} has no description`).toMatch(/description:/);
      }
    }
  });

  it('registers every IA page in its section meta', async () => {
    for (const section of SECTIONS) {
      const meta = await readFile(path.join(DOCS, section, 'meta.json'), 'utf8');
      for (const page of PAGES[section]) {
        expect(meta, `${section}/meta.json does not list ${page}`).toContain(page);
      }
    }
  });
});

describe('blog', () => {
  it('publishes exactly the four launch posts', async () => {
    const entries = (await readdir(BLOG, { withFileTypes: true })).filter((entry) => entry.isDirectory());
    expect(entries.map((entry) => entry.name).sort()).toEqual([...LAUNCH_POSTS].sort());
  });

  it('dates every post and drafts none', async () => {
    for (const post of LAUNCH_POSTS) {
      const meta = await frontmatter(path.join(BLOG, post, 'index.mdx'));
      expect(meta, `${post} has no date`).toMatch(/date: '\d{4}-\d{2}-\d{2}'/);
      expect(meta, `${post} must not be a draft`).not.toMatch(/draft: true/);
      expect(meta, `${post} has no title`).toMatch(/title:/);
    }
  });
});

describe('honesty law', () => {
  // Ticket 06: in-development, present tense — no quickstart, no screenshots,
  // no changelog, no roadmap dates. The patterns match the *devices* (a
  // quickstart heading, an embedded image, a changelog section), not the words:
  // the status note is allowed to say there are none.
  const forbidden: Array<[RegExp, string]> = [
    [/^#{1,4}\s*(quickstart|getting started|installation|installing)\b/im, 'a quickstart heading'],
    [/!\[[^\]]*\]\([^)]*\)/, 'an embedded image'],
    [/^#{1,4}\s*(changelog|release notes|releases)\b/im, 'a changelog section'],
    [/\bcoming soon\b/i, '“coming soon”'],
    [/\b(ships|shipping) (in|on) (q[1-4]|20\d\d)\b/i, 'a roadmap date'],
  ];

  it('keeps banned devices out of the docs and the blog', async () => {
    const files: string[] = [];
    for (const section of SECTIONS) {
      for (const entry of await readdir(path.join(DOCS, section))) {
        if (entry.endsWith('.mdx')) files.push(path.join(DOCS, section, entry));
      }
    }
    files.push(path.join(DOCS, 'introduction.mdx'));
    for (const post of LAUNCH_POSTS) files.push(path.join(BLOG, post, 'index.mdx'));

    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const [pattern, what] of forbidden) {
        expect(source, `${path.relative(ROOT, file)} contains ${what}`).not.toMatch(pattern);
      }
    }
  });
});
