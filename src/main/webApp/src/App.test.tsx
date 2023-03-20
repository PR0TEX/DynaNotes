import App from './App';
import { render, screen } from '@testing-library/react';

it('renders without crashing', () => {
  render(<App />)
  const divElement = screen.getByText(/Sticky Notes/i);
  expect(divElement).toBeInTheDocument();
});