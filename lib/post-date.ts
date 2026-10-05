/**
 * A post's date, as the two strings this site publishes it in.
 *
 * **A date is two facts, and one string cannot carry both.** The words a reader reads
 * are a reading; the value on the `time` element is a fact about a day, and a feed
 * reader, a crawler and a browser's own index all order posts by it. Deriving one from
 * the other is a guess: read a formatted date back into an ISO one and you have guessed
 * which number was the day and which was the month, in a locale nobody declared.
 *
 * Both of this site's screens were handing the frontmatter's own string to both slots.
 * The blog index printed `2026-09-21` to the reader, and the post Page was handed the
 * same value as its display date and as its `dateTime`, which is the arrangement the
 * design system's Page now refuses at render because a Page that renders a date has no
 * business making a reader parse one.
 *
 * **The reading is this site's to write and the machine value is the platform's.**
 * `Intl.DateTimeFormat` is what Prism's own `RelativeTime` uses for the one date reading
 * it renders, so the shape is the design system's rather than a format invented here.
 * This repository publishes no human date anywhere else, so there is nothing here to
 * match: `app/sitemap.ts` takes the frontmatter into `new Date(...)` for `lastModified`,
 * which is a machine value and wants no reading at all. Two things are pinned that
 * `RelativeTime` leaves to its caller, and both because this site is a static export: it
 * renders at build time, on one machine, once.
 *
 *   - **The locale is `en-GB`.** The value beside it is `YYYY-MM-DD`, so the reading is
 *     day-first too. `en` on its own resolves to `en-US` on most hosts and would reorder
 *     the string to `Sep 21, 2026`, and an unpinned locale makes the shipped date a fact
 *     about the build machine's region rather than about the post.
 *   - **The time zone is `UTC`.** `2026-09-21` parses as midnight UTC, and a host west of
 *     Greenwich would render the day before. A date that shifts by one day depending on
 *     where the export ran is a wrong date, and it is wrong silently.
 *
 * `long` rather than `medium` because a two-digit day next to an abbreviated month is the
 * one date shape readers misread most often, and this one is printed under a title in
 * eleven point type beside a row of tags. Nothing here is a locale-sensitive string in a
 * component: the sentence around the date is the site's, the reading is the platform's,
 * and a reader in another language gets the platform's rendering of that locale rather
 * than an English month name baked into this repository.
 */

/**
 * A calendar date in the shape a `datetime` attribute and a feed want.
 *
 * Typed as the shape rather than as `string`, because the design system's Page takes its
 * `dateTime` in that shape in the unpublished revision of it and a plain `string` is not
 * assignable to it. The frontmatter is a `z.string()`, so this is where the two meet, and
 * it is a narrowing function rather than a cast: a value that is not a calendar date throws
 * here instead of reaching a `datetime` attribute no reader can check.
 *
 * It is assignable to the `string` the pinned 0.15.0 asks for, which is the whole of why
 * this shape types against both versions of the Page rather than only the newer one.
 */
export type IsoDate = `${number}-${number}-${number}`;

const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

const READING = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
  timeZone: 'UTC',
});

/**
 * The frontmatter's date, proved to be the machine value and narrowed to it.
 *
 * The build fails here rather than at render. Every post under `content/blog` declares a
 * required ISO date and `test/content.test.ts` reads every post's frontmatter, so a value
 * that stopped being one is caught in the repository rather than shipped into an attribute
 * and discovered by a feed reader.
 */
export function isoDate(value: string): IsoDate {
  if (!CALENDAR_DATE.test(value)) {
    throw new Error(
      `post date: ${JSON.stringify(value)} is not a YYYY-MM-DD calendar date, so there is no machine ` +
        'value to put in a time element. The frontmatter contract is a quoted ISO date and this is where a ' +
        'value that stopped being one fails.',
    );
  }
  return value as IsoDate;
}

/**
 * The same date, in the words a reader reads.
 *
 * The two are separate functions rather than one with a flag, because the two are separate
 * facts and a caller that has both is stating both. Nothing parses the formatted string
 * back: `dateTime` is always `isoDate(value)` of the frontmatter's own value.
 */
export function displayDate(value: string): string {
  return READING.format(new Date(`${isoDate(value)}T00:00:00Z`));
}