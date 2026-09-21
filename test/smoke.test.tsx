import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';

describe('placeholder landing', () => {
  it('names the site', () => {
    render(<HomePage />);
    expect(screen.getByText(/scaffold placeholder/i)).toBeTruthy();
  });

  it('marks itself as placeholder content', () => {
    render(<HomePage />);
    expect(screen.getByText(/Placeholder deploy/)).toBeTruthy();
  });
});
