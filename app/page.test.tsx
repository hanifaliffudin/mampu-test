import { render, screen } from '@testing-library/react';

import Home from './page';

describe('Home page', () => {
  it('renders the deploy now call to action', () => {
    render(<Home />);

    expect(
      screen.getByRole('link', {
        name: /deploy now/i,
      }),
    ).toBeInTheDocument();
  });
});
