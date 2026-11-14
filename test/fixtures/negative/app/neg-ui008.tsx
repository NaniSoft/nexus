// Fixture neg-ui008: a private design system path import plus a suppression
// comment. The gate must fail with UI008 (x2).
// eslint-disable-next-line no-unused-vars
import { Badge } from '@nanisoft/prism-ui/dist/components/ui/badge';

export function FixturePrivatePath() {
  return <Badge>Fixture</Badge>;
}
