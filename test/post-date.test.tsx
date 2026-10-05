import { readFileSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BlogPostPage } from '@nanisoft/prism-ui/pages/blog-post-page';

import { PostDate } from '@/components/post-date';
import { displayDate, isoDate } from '@/lib/post-date';

/**
 * A post's date, as the two strings it is.
 *
 * Both of this site's screens were printing one of them. The blog index put the
 * frontmatter's own value inside its `time` element, so a reader saw `2026-09-21` under
 * every title on the page, and the post Page was handed that same value twice, once as
 * the words a reader reads and once as the machine value on the element. The design
 * system's Page now refuses that pair at render, on the grounds that a Page rendering a
 * date has no business making a reader parse ISO.
 *
 * **Both halves are asserted against rendered output, not against the formatter alone.**
 * A formatter test would pass while the page kept printing the raw value, and the whole
 * defect is that the page printed the raw value. So the two elements below are the two
 * elements the two screens render, each one checked for the property that matters: what
 * the reader reads is not the machine value, and the machine value is still exactly what
 * a feed reader and a crawler need.
 *
 * The design system's `BlogPostPage` is rendered here rather than this site's own post
 * route, because `blogSource` is a compile-time macro and cannot load under a test
 * runner: that is why `test/content.test.ts` reads `content/` from disk. Rendering the
 * Page the post route composes is the half that can be checked here, and it is checked
 * against the version this repository pins.
 */

const ROOT = path.resolve(__dirname, '..');
const BLOG = path.join(ROOT, 'content', 'blog');

/** The date every published post's frontmatter carries today. */
const POSTED = '2026-09-21';

/** Frontmatter body of an MDX file, or an empty string when it has none. */
async function frontmatter(file: string): Promise<string> {
  const source = await readFile(file, 'utf8');
  return /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? '';
}

describe("a post's date", () => {
  it('shows a reader the words and keeps the machine value for the machine', () => {
    expect(displayDate(POSTED)).toBe('21 September 2026');
    // The half that matters, stated as both directions: the reading is not the ISO
    // string, and the ISO string is still exactly what it was.
    expect(displayDate(POSTED)).not.toBe(POSTED);
    expect(isoDate(POSTED)).toBe(POSTED);
  });

  it('prints the reading on the index and the machine value on the element', () => {
    const { container } = render(<PostDate value={POSTED} />);
    const time = container.querySelector('time');
    expect(time, 'the index prints no time element').toBeTruthy();
    expect(time?.textContent).toBe('21 September 2026');
    expect(time?.textContent).not.toBe(POSTED);
    // Attribute name read through the DOM, because a `datetime` attribute and a
    // `dateTime` prop are the same attribute and React lower-cases it.
    expect(time?.getAttribute('datetime')).toBe(POSTED);
  });

  it('hands the design system Page a reading and a machine value it will both accept', () => {
    // The Page takes `date` as the words a reader sees and `dateTime` as the value on the
    // `time` element, and it is the Page that renders the element, so this is the render
    // the post route produces. It is also what proves the consumer side is correct
    // against the version this repository pins: 0.15.0 renders this pair without
    // complaint, and the unpublished Page throws on a pair where the two are the same
    // string, which is what the next assertion is about.
    const { container } = render(
      <BlogPostPage
        title="Humans in the loop, three rounds max"
        date={displayDate(POSTED)}
        dateTime={isoDate(POSTED)}
        trailLabels={{ previous: 'Previous', next: 'Next' }}
        trailLabel="Build log"
      >
        <p>The body.</p>
      </BlogPostPage>,
    );
    const time = container.querySelector('time');
    expect(time, 'the Page rendered no time element').toBeTruthy();
    expect(time?.textContent).toBe('21 September 2026');
    expect(time?.textContent).not.toBe(POSTED);
    expect(time?.getAttribute('datetime')).toBe(POSTED);
  });

  it('gives the two props values that cannot be the same string', () => {
    // The refusal the unpublished Page makes at render, asserted as the property it
    // refuses rather than as the throw, because the pinned version has no throw to catch
    // and a test that waited for one would be green on a Page that renders the mistake.
    expect(displayDate(POSTED)).not.toBe(isoDate(POSTED));
    for (const value of ['2026-01-05', '2026-12-31', '2026-09-01']) {
      expect(displayDate(value)).not.toBe(value);
      expect(displayDate(value)).toMatch(/^\d{1,2} \w+ \d{4}$/);
      expect(isoDate(value)).toBe(value);
    }
  });

  it('reads the same day on every host, because a static export renders once', () => {
    // `2026-09-21` parses as midnight UTC. A build machine west of Greenwich formatting
    // it in its own zone renders 20 September, so the time zone is pinned rather than
    // inherited; this is the assertion that says so. The reading is spelled out and
    // day-first, next to a `YYYY-MM-DD` value it cannot be confused with. The January
    // and December ends are here because a naive formatter turns those into the next
    // year and the previous one under a local zone.
    expect(displayDate('2026-01-01')).toBe('1 January 2026');
    expect(displayDate('2026-12-31')).toBe('31 December 2026');
    // The process's own zone, printed beside the reading, is the other half of the
    // claim: the export renders once on one machine and the shipped date must not be a
    // fact about it. The host here runs on `America/Los_Angeles`, which is three hours
    // and 268 days behind UTC in August, so an unpinned formatter would print a
    // different day for both of these.
    expect(displayDate('2026-08-31')).toBe('31 August 2026');
    expect(displayDate('2026-09-01')).toBe('1 September 2026');
  });

  it('refuses a value that is not a calendar date, rather than narrowing it blindly', () => {
    // The frontmatter schema is a `z.string()`, so the narrowing is where a value that
    // stopped being a date fails. The build must fail: a `datetime` attribute holding
    // something no feed reader can parse is a wrong date that nothing on the page shows.
    expect(() => isoDate('21 September 2026')).toThrow(/YYYY-MM-DD/);
    expect(() => isoDate('')).toThrow(/YYYY-MM-DD/);
    expect(() => isoDate('2026-9-1')).toThrow(/YYYY-MM-DD/);
    expect(() => isoDate('2026-09-21T00:00:00Z')).toThrow(/YYYY-MM-DD/);
    expect(() => displayDate('soon')).toThrow(/YYYY-MM-DD/);
  });

  it('hands the post route neither raw value, in either slot', () => {
    // The two renders above cover the two elements; this covers the wiring, because an
    // element the site renders correctly and a page that still passes the raw value to it
    // are two different states and only one of them is the defect.
    //
    // It reads the route as text because that route cannot be rendered here: `blogSource`
    // is a compile-time macro, so the loader does not exist at run time and this is the
    // same wall `test/content.test.ts` reads `content/` from disk to get around. The
    // strings asserted are the props and the component, not the prose, so a rewording of
    // the route does not fail this and a reversion of the pairing does.
    const route = readFileSync(path.join(ROOT, 'app', 'blog', '[[...slug]]', 'page.tsx'), 'utf8');
    expect(route, 'the index prints the frontmatter value as the text of its time element').not.toMatch(
      />\{post\.data\.date\}</,
    );
    expect(route, 'the Page is handed the frontmatter value as the words a reader reads').not.toMatch(
      /date=\{page\.data\.date\}/,
    );
    expect(route, 'the Page is handed the frontmatter value unformatted as its machine value').not.toMatch(
      /dateTime=\{page\.data\.date\}/,
    );
    expect(route).toMatch(/date=\{displayDate\(page\.data\.date\)\}/);
    expect(route).toMatch(/dateTime=\{isoDate\(page\.data\.date\)\}/);
    expect(route, 'the index prints its own markup rather than the element that carries both').toMatch(
      /<PostDate value=\{post\.data\.date\} \/>/,
    );
  });
});

describe("the four posts' dates in the frontmatter", () => {
  /**
   * **This is a report, not a repair, and this file is where the report is held.**
   *
   * All four launch posts carry `date: '2026-09-21'`. The date column on the blog index
   * therefore carries no information today: four rows, one value, and a reader learns
   * from it only that this factory published four things at once, which is a fact about
   * the launch rather than about the order the posts are in.
   *
   * That is a fact about the content and not a misreading, and the proof that it is not
   * a misreading is this test: it reads every frontmatter off disk and puts each post's
   * own value through the same two functions the index puts it through, so a date the
   * index lost, reordered or reformatted on the way to the element would fail here. It
   * does not fail, so the index is reading what the frontmatter says.
   *
   * The fix is therefore editorial, and it is not made here: it belongs to whoever knows
   * when each post was actually written, and inventing four dates would put four claims
   * about history into the export that nothing on this site can check. What is asserted
   * is the half that is this repository's and the half that makes an editorial fix
   * visible without a code change: **the element's machine value is the frontmatter's own
   * string, verbatim, and the element's text is that same value read.** Separating the
   * four dates in the frontmatter separates them here on the next build, with no edit to
   * this repository. The last assertion in this test is the one place that fact is
   * recorded as a number, and it is written to be the first thing to go red when the
   * editorial work is done.
   */
  it('prints each post its own frontmatter date, and nothing else', async () => {
    const posts = (await readdir(BLOG, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect(posts, 'the corpus is not the four launch posts this file reads').toHaveLength(4);

    const dates = new Map<string, string>();
    for (const post of posts) {
      const meta = await frontmatter(path.join(BLOG, post, 'index.mdx'));
      const date = /date:\s*'?([\d-]+)'?/.exec(meta)?.[1];
      expect(date, `${post} declares no date`).toBeDefined();
      // Proved to be a machine value here rather than at render, so a frontmatter that
      // stopped being a date fails in the repository and not in the export.
      expect(isoDate(date as string), `${post}'s date is not a YYYY-MM-DD calendar date`).toBe(date);
      dates.set(post, date as string);
    }

    for (const [post, date] of dates) {
      const { container } = render(<PostDate value={date} />);
      const time = container.querySelector('time');
      // The machine half: exactly the frontmatter's own string, unaltered.
      expect(time?.getAttribute('datetime'), `${post} publishes a machine value it did not declare`).toBe(date);
      // The reading half: a rendering of that same value and not of anything else.
      expect(time?.textContent, `${post} prints a date its frontmatter does not carry`).toBe(
        displayDate(date),
      );
      expect(time?.textContent).not.toBe(date);
    }

    // The report itself, as a measurement rather than as a law: the four published values
    // are one value today. It is asserted as the set's size and not as the value, so that
    // the day somebody separates the four dates in the frontmatter this is the one
    // assertion in the suite that goes red, and it goes red saying that the record above
    // has changed and wants rewriting. It is a record with an expiry, not a rule, and it
    // names no date: what the four dates should be is an editorial decision this
    // repository has no standing to make.
    expect(
      new Set(dates.values()).size,
      'the four published posts no longer share one date: the date column now carries information, ' +
        'so the record in this file\'s comment and the report that quoted it both need updating',
    ).toBe(1);
  });
});