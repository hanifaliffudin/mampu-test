import { render, screen } from '@testing-library/react';

import Home from './page';

describe('Home page', () => {
  it('renders a call to action to open users workspace', () => {
    render(<Home />);

    expect(
      screen.getByRole('link', {
        name: /open users workspace/i,
      }),
    ).toBeInTheDocument();
  });
});
