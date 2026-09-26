import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

// A11Y-01: every footer link must go somewhere, and link to pages or sections
// that exist.
it('has no dead links or buttons', () => {
  render(<Footer />);
  expect(screen.queryAllByRole('button')).toHaveLength(0);
  const links = screen.getAllByRole('link');
  expect(links.length).toBeGreaterThan(0);
  links.forEach((link) => {
    const href = link.getAttribute('href');
    expect(href).toMatch(/^(#[a-z-]+|\/(request-access|login)(\?type=tester)?)$/);
  });
});
