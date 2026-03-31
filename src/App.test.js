import { render, screen } from '@testing-library/react';
import { AUTH_SESSION_KEY } from './context/AuthContext.jsx';
import App from './App.jsx';

beforeEach(() => {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ email: 'test@gtbs.in', name: 'Test', role: 'super_admin' }));
});

afterEach(() => {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
});

test('renders admin dashboard when session exists', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  expect(screen.getAllByText(/GTBS Flicksy/i).length).toBeGreaterThan(0);
});
