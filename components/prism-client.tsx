'use client';

import type { ComponentProps, ReactElement } from 'react';

import { GithubOutlined } from '@nanisoft/prism-ui/icons';
import { Typography } from '@nanisoft/prism-ui/components/typography';

// The client boundary for prism-ui surfaces that cannot evaluate in the RSC
// runtime (the proven recipe — prism's own site keeps the same module):
// antd ships 'use client', so in a server component Typography arrives as one
// client reference — rendering <Typography.Text> dereferences a property on
// that reference and crashes the prerender with an undefined element type —
// and DisplayTitle (which destructures Typography.Title at module scope) must
// evaluate in the client graph. Server components import these through this
// module, never straight from the package.

export { DisplayTitle } from '@nanisoft/prism-ui/components/display-title';

/** Typography.* cannot cross the RSC boundary as a namespace — forward it. */
export function Text(props: ComponentProps<typeof Typography.Text>) {
  return <Typography.Text {...props} />;
}

/** Typography.* cannot cross the RSC boundary as a namespace — forward it. */
export function Paragraph(props: ComponentProps<typeof Typography.Paragraph>) {
  return <Typography.Paragraph {...props} />;
}

/**
 * antd's icon components cannot be evaluated in the RSC runtime either —
 * `@nanisoft/prism-ui/icons` re-exports them without a 'use client' directive,
 * so a server component importing one crashes at module evaluation
 * (React.createContext is absent there). Anything needing an icon takes it
 * through this boundary.
 */
export function GithubIcon(props: ComponentProps<typeof GithubOutlined>): ReactElement {
  return <GithubOutlined {...props} />;
}
