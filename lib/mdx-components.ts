// Headless MDX component mapping (fumadocs-core headless: the site owns the HTML).
//
// Nexus writes no custom MDX prose. The prose elements are plain HTML and the
// design system's own `Prose` holds them to the reading measure and the block
// rhythm. The one exception is the table: `Prose` pads `td` and `th` but draws
// no rule between them, because the library's own `Table` draws them. So the
// markdown table elements are mapped to the design system's `Table` parts,
// which carry the hairlines, the header weight and the horizontal scroll
// container. A data table the pipeline emits is then the system's table rather
// than plain HTML under a site stylesheet.

import type { ComponentType } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@nanisoft/prism-ui/components/table';

type MdxComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

/** Merge extra mappings into the site's base component map. */
export function getMdxComponents(extra?: MdxComponentMap): MdxComponentMap {
  return {
    table: Table as ComponentType<Record<string, unknown>>,
    thead: TableHeader as ComponentType<Record<string, unknown>>,
    tbody: TableBody as ComponentType<Record<string, unknown>>,
    tfoot: TableFooter as ComponentType<Record<string, unknown>>,
    tr: TableRow as ComponentType<Record<string, unknown>>,
    th: TableHead as ComponentType<Record<string, unknown>>,
    td: TableCell as ComponentType<Record<string, unknown>>,
    ...extra,
  };
}
