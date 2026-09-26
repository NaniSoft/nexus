'use client';

// The hero's visual slot: the loop, drawn as an instrument. Issues feed an
// orchestrator; the orchestrator starts fresh worker containers; finished
// builds land on the Kanban's Review lane and merge as pull requests. A swimlane
// ruler runs along the bottom, and one packet at a time rides each edge.
//
// Template law (ticket 09): the canvas host's height must be DEFINITE in every
// context — it sizes itself from the host's clientHeight, so a content-sized
// host would feed a ResizeObserver growth loop. The host is sized by the hero
// panel's flex column (min-height 440px on the panel, flex: 1 here), never by
// its own content.
//
// Colours are read from the pre-baked prism-lavender-<mode> variable rulesets at
// mount — token-driven, no raw hex. Reduced motion renders one settled frame.

import { useEffect, useRef, type ReactElement } from 'react';

import { usePrismThemeMode } from '@nanisoft/prism-ui/provider';

import { PANEL } from '@/lib/landing-content';

interface Node {
  col: number;
  label: string;
  note?: string;
  nx: number;
  ny: number;
  hub: boolean;
}

interface Edge {
  a: number;
  b: number;
  delay: number;
  dash: boolean;
}

// Two layouts for the same loop. Column x positions are normalized 0–1; the
// first and last sit inside the panel's padding, because a chip at x=0.95 would
// overflow the host's right edge and two wide chips on adjacent columns would
// overlap. Below 640px the five columns cannot fit (the chips alone total more
// than the host's width), so the loop reads as a vertical rail instead.
const COL_X = [0.06, 0.32, 0.58, 0.78, 0.95];

const ISSUES = ['issue · a', 'issue · b'];
const WORKERS = ['worker · a', 'worker · b', 'worker · c'];

interface Layout {
  nodes: Node[];
  edges: Edge[];
}

function wideLayout(): Layout {
  const nodes: Node[] = [];

  const issue = (label: string, ny: number): void => {
    nodes.push({ col: 0, label, nx: COL_X[0]!, ny, hub: false });
  };
  issue(ISSUES[0]!, 0.24);
  issue(ISSUES[1]!, 0.56);

  nodes.push({ col: 1, label: 'orchestrator', note: 'MAF · .NET', nx: COL_X[1]!, ny: 0.4, hub: true });

  WORKERS.forEach((label, i) => {
    const ny = WORKERS.length === 1 ? 0.4 : 0.14 + (0.52 / (WORKERS.length - 1)) * i;
    nodes.push({ col: 2, label, nx: COL_X[2]!, ny, hub: false });
  });

  nodes.push({ col: 3, label: 'review', note: 'kanban', nx: COL_X[3]!, ny: 0.4, hub: false });
  nodes.push({ col: 4, label: 'merged PR', nx: COL_X[4]!, ny: 0.4, hub: false });

  const find = (label: string): number => nodes.findIndex((node) => node.label === label);

  const edges: Edge[] = [];
  // Every issue reaches the orchestrator.
  for (const label of ISSUES) {
    edges.push({ a: find(label), b: find('orchestrator'), delay: 0, dash: false });
  }
  // The orchestrator starts one fresh container per issue.
  for (const label of WORKERS) {
    edges.push({ a: find('orchestrator'), b: find(label), delay: 0.55, dash: false });
  }
  // Finished builds land in Review; one merges.
  for (const [i, label] of WORKERS.entries()) {
    edges.push({ a: find(label), b: find('review'), delay: 1.1 + i * 0.18, dash: false });
  }
  edges.push({ a: find('review'), b: find('merged PR'), delay: 1.9, dash: true });

  return { nodes, edges };
}

function narrowLayout(): Layout {
  const nodes: Node[] = [
    { col: 0, label: 'issue · a', nx: 0.3, ny: 0.05, hub: false },
    { col: 0, label: 'issue · b', nx: 0.72, ny: 0.05, hub: false },
    { col: 1, label: 'orchestrator', note: 'MAF · .NET', nx: 0.5, ny: 0.25, hub: true },
    { col: 2, label: 'worker', nx: 0.5, ny: 0.43, hub: false },
    { col: 3, label: 'review', note: 'kanban', nx: 0.5, ny: 0.61, hub: false },
    { col: 4, label: 'merged PR', nx: 0.5, ny: 0.79, hub: false },
  ];

  const find = (label: string): number => nodes.findIndex((node) => node.label === label);

  return {
    nodes,
    edges: [
      { a: find('issue · a'), b: find('orchestrator'), delay: 0, dash: false },
      { a: find('issue · b'), b: find('orchestrator'), delay: 0.2, dash: false },
      { a: find('orchestrator'), b: find('worker'), delay: 0.6, dash: false },
      { a: find('worker'), b: find('review'), delay: 1.2, dash: false },
      { a: find('review'), b: find('merged PR'), delay: 1.9, dash: true },
    ],
  };
}

const WIDE = wideLayout();
const NARROW = narrowLayout();
const CYCLE_S = 7.2;
const TRAVEL_S = 1.5;

const LANES = ['backlog', 'frontier', 'in progress', 'review', 'done'] as const;

interface Palette {
  ink: string;
  text: string;
  bg: string;
}

function readPalette(host: HTMLElement): Palette {
  const css = getComputedStyle(host);
  return {
    ink: css.getPropertyValue('--prism-color-primary').trim() || '#8B7CF6',
    text: css.getPropertyValue('--prism-color-text').trim() || '#EDEBFA',
    bg: css.getPropertyValue('--prism-color-bg-container').trim() || '#151327',
  };
}

/** hex (#RRGGBB) → rgba(..,a) so canvas draws stay token-driven. */
function rgba(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1]!, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function LoopCanvas(): ReactElement {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The palette is read from CSS variables once per mode: mode-only theming
  // (ADR-0006) means `mode` is the only thing that can change them, so keying
  // the effect on it re-reads the palette after a toggle instead of leaving
  // beam-dark ink painted on a light ground.
  const { mode } = usePrismThemeMode();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette = readPalette(wrap);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let layout = WIDE;
    let raf = 0;
    let running = true;

    const resize = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout = width < 640 ? NARROW : WIDE;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const padX = width * 0.05;
    const padY = height * 0.14;
    const px = (node: Node): number => padX + node.nx * (width - padX * 2);
    const py = (node: Node): number => padY + node.ny * (height - padY * 2);

    const pointer = { x: 0.5, y: 0.5 };
    const onPointer = (event: PointerEvent): void => {
      const rect = wrap.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
    };
    if (!reduced) wrap.addEventListener('pointermove', onPointer);

    // Chip width from the wider of the label and its sub-label, so a note never
    // spills past its own chip.
    const chipW = (node: Node): number => {
      ctx.font = '10.5px "JetBrains Mono", ui-monospace, monospace';
      const label = ctx.measureText(node.label).width;
      ctx.font = '8.5px "JetBrains Mono", ui-monospace, monospace';
      const note = node.note ? ctx.measureText(node.note).width : 0;
      return Math.min(Math.max(label, note) + 20, width * 0.26);
    };

    const edgePath = (edge: Edge, pos: Array<{ x: number; y: number }>): Array<[number, number]> => {
      const a = layout.nodes[edge.a]!;
      const b = layout.nodes[edge.b]!;
      const ax = pos[edge.a]!.x + chipW(a) / 2;
      const ay = pos[edge.a]!.y;
      const bx = pos[edge.b]!.x - chipW(b) / 2;
      const by = pos[edge.b]!.y;
      const midX = (ax + bx) / 2;
      return [
        [ax, ay],
        [midX, ay],
        [midX, by],
        [bx, by],
      ];
    };

    const draw = (nowMs: number): void => {
      const t = nowMs / 1000;
      const drift = reduced ? 0 : 1;
      const parX = (pointer.x - 0.5) * 8 * drift;
      const parY = (pointer.y - 0.5) * 5 * drift;

      ctx.clearRect(0, 0, width, height);

      const pos = layout.nodes.map((node, i) => ({
        x: px(node) + Math.sin(t * 0.6 + i * 1.7) * 2 * drift + parX * (0.4 + node.ny),
        y: py(node) + Math.cos(t * 0.5 + i * 2.3) * 2 * drift + parY * (0.4 + node.ny),
      }));

      ctx.font = '10.5px "JetBrains Mono", ui-monospace, monospace';

      // Edges: orthogonal, elbow at mid-x.
      for (const edge of layout.edges) {
        const path = edgePath(edge, pos);
        ctx.beginPath();
        ctx.moveTo(path[0]![0], path[0]![1]);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]![0], path[i]![1]);
        ctx.strokeStyle = rgba(palette.text, edge.dash ? 0.2 : 0.3);
        ctx.lineWidth = 1;
        ctx.setLineDash(edge.dash ? [3, 5] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Packets: one per edge, staggered, riding the orthogonal path.
      const active = new Set<number>();
      if (!reduced) {
        for (const edge of layout.edges) {
          const path = edgePath(edge, pos);
          const lens = path.slice(1).map((point, i) => Math.hypot(point[0] - path[i]![0], point[1] - path[i]![1]));
          const total = lens.reduce((sum, l) => sum + l, 0);
          const local = ((t % CYCLE_S) - edge.delay) / TRAVEL_S;
          if (local < 0 || local > 1) continue;
          if (layout.nodes[edge.a]!.col === 2) active.add(edge.a);
          let remain = local * total;
          for (let i = 0; i < lens.length; i++) {
            if (remain <= lens[i]!) {
              const k = remain / lens[i]!;
              const cur = path[i]!;
              const next = path[i + 1]!;
              const x = cur[0] + (next[0] - cur[0]) * k;
              const y = cur[1] + (next[1] - cur[1]) * k;
              const glow = ctx.createRadialGradient(x, y, 0, x, y, 9);
              glow.addColorStop(0, rgba(palette.ink, 0.85));
              glow.addColorStop(1, rgba(palette.ink, 0));
              ctx.fillStyle = glow;
              ctx.beginPath();
              ctx.arc(x, y, 9, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = rgba(palette.ink, 1);
              ctx.beginPath();
              ctx.arc(x, y, 2.2, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            remain -= lens[i]!;
          }
        }
      }

      // Chips.
      layout.nodes.forEach((node, i) => {
        const { x, y } = pos[i]!;
        const w = chipW(node);
        const h = node.note ? 32 : 22;
        ctx.fillStyle = rgba(palette.bg, 0.9);
        ctx.strokeStyle = node.hub
          ? rgba(palette.ink, reduced ? 0.6 : 0.9)
          : rgba(palette.text, 0.28);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = rgba(palette.text, node.hub ? 0.96 : 0.76);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, x, node.note ? y - 6 : y + 0.5);
        if (node.note) {
          ctx.fillStyle = rgba(palette.ink, 0.85);
          ctx.font = '8.5px "JetBrains Mono", ui-monospace, monospace';
          ctx.fillText(node.note, x, y + 8);
          ctx.font = '10.5px "JetBrains Mono", ui-monospace, monospace';
        }

        // A worker mid-build shows its live cue.
        if (active.has(i)) {
          ctx.fillStyle = rgba(palette.ink, 1);
          ctx.beginPath();
          ctx.arc(x + w / 2 - 7, y - h / 2 + 7, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        if (node.hub && reduced) {
          ctx.fillStyle = rgba(palette.ink, 1);
          ctx.beginPath();
          ctx.arc(x + w / 2 - 7, y - h / 2 + 7, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // The swimlane ruler.
      const laneY = height * 0.94;
      const laneX0 = width * 0.07;
      const laneX1 = width * 0.93;
      ctx.strokeStyle = rgba(palette.text, 0.18);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(laneX0, laneY);
      ctx.lineTo(laneX1, laneY);
      ctx.stroke();

      ctx.font = '8.5px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      LANES.forEach((lane, i) => {
        const x = laneX0 + ((laneX1 - laneX0) / (LANES.length - 1)) * i;
        ctx.strokeStyle = rgba(palette.text, 0.24);
        ctx.beginPath();
        ctx.moveTo(x, laneY);
        ctx.lineTo(x, laneY + 4);
        ctx.stroke();
        ctx.fillStyle = rgba(palette.text, 0.42);
        ctx.fillText(lane.toUpperCase(), x, laneY + 9);
      });

      // The ruler's own marker, advancing with the cycle.
      if (!reduced) {
        const progress = (t % CYCLE_S) / CYCLE_S;
        const x = laneX0 + (laneX1 - laneX0) * progress;
        ctx.fillStyle = rgba(palette.ink, 0.9);
        ctx.beginPath();
        ctx.arc(x, laneY, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      if (running) raf = requestAnimationFrame(drawFrame);
    };

    const drawFrame = (nowMs: number): void => draw(nowMs);

    // One settled frame for reduced motion; the loop only runs when animated,
    // and pauses while the tab is hidden.
    if (!reduced && !document.hidden) {
      raf = requestAnimationFrame(drawFrame);
    } else {
      draw(performance.now());
    }
    const onVisibility = (): void => {
      if (reduced) return;
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(drawFrame);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (!reduced) wrap.removeEventListener('pointermove', onPointer);
    };
  }, [mode]);

  return (
    <div className="nx-dag" ref={wrapRef} role="img" aria-label={PANEL.aria}>
      <canvas ref={canvasRef} />
    </div>
  );
}
