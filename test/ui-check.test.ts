import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

import { describe, expect, it } from 'vitest';

/**
 * The `ui:check` gate rejects every prohibited shape and accepts the approved
 * composition.
 *
 * The negative root (`test/fixtures/negative`) carries one deliberate
 * violation per code, in site-shaped source: a stylesheet, an inline style, a
 * hardcoded colour, an arbitrary class, an unapproved import, a custom
 * variable, a private design system path plus a suppression comment, a font
 * import, direct DOM styling, application responsive styling, a local visual
 * primitive, a raw image, and one break of every asset contract. The positive
 * root (`test/fixtures/positive`) carries approved components, registered
 * assets and DS layout primitives, and must pass.
 *
 * The fixtures are excluded from `tsconfig` and from the site's own lint input
 * by design: they are inputs to the gate, not site code. The gate is invoked
 * here the way CI invokes it, as a child process, so the assertions are about
 * the command rather than about a library this file imports.
 */
const ROOT = path.resolve(__dirname, '..');
const GATE = path.join(ROOT, 'scripts', 'ui-check.mjs');

function runGate(root: string): { status: number; output: string } {
  try {
    const output = execFileSync(process.execPath, [GATE, '--root', root], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, output };
  } catch (error) {
    const e = error as { status?: number; stdout?: string; stderr?: string };
    return { status: e.status ?? 1, output: (e.stdout ?? '') + (e.stderr ?? '') };
  }
}

describe('ui:check', () => {
  it('rejects every prohibited scenario in the negative fixtures', () => {
    const { status, output } = runGate(path.join(ROOT, 'test', 'fixtures', 'negative'));
    expect(status, output).not.toBe(0);
    const expected = [
      'UI001',
      'UI002',
      'UI003',
      'UI004',
      'UI005',
      'UI006',
      'UI007',
      'UI008',
      'UI009',
      'UI010',
      'UI011',
      'UI012',
      'ASSET001',
      'ASSET002',
      'ASSET003',
      'ASSET004',
      'ASSET005',
      'ASSET006',
      'ASSET007',
      'ASSET008',
      'ASSET009',
      'ASSET010',
      'ASSET011',
      'ASSET012',
      'ASSET013',
      'ASSET014',
    ];
    for (const code of expected) {
      expect(output, `the gate reports no ${code} for the negative fixtures:\n${output}`).toContain(code);
    }
  });

  it('accepts the approved composition in the positive fixtures', () => {
    const { status, output } = runGate(path.join(ROOT, 'test', 'fixtures', 'positive'));
    expect(status, output).toBe(0);
    expect(output).toContain('pass');
  });

  it('passes on this repository', () => {
    const { status, output } = runGate(ROOT);
    expect(status, output).toBe(0);
  });
});
