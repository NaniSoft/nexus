import type { ReactElement } from 'react';

import { displayDate, isoDate } from '@/lib/post-date';

/**
 * A post's date on the blog index, as one element with two strings in it.
 *
 * **The index used to print the frontmatter's own value**, which put `2026-09-21` in the
 * reader's eye as the first thing under every title on the page. The element was already a
 * `time` with the machine value on it, so the machine value was present twice and the only
 * half a reader could use was the half they could not read.
 *
 * It is a component rather than two calls inside the index for one reason: it makes the
 * pair renderable under Vitest. `blogSource` is a compile-time macro and cannot load under a
 * test runner, which is why `test/content.test.ts` reads `content/` from disk, so a test
 * cannot render the index page and assert what its `time` element says. It can render this,
 * and asserting the element here asserts the element the index prints, because the index
 * prints this.
 *
 * The meta line's own font is on the surrounding run, so the date and the tags beside it are
 * one piece of metadata and this element carries no class of its own.
 */
export function PostDate({ value }: { value: string }): ReactElement {
  return <time dateTime={isoDate(value)}>{displayDate(value)}</time>;
}