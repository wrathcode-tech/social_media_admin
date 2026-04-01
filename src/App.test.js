import { render, screen } from '@testing-library/react';
import { AUTH_SESSION_KEY } from './context/AuthContext.jsx';
import App from './App.jsx';

beforeEach(() => {
  sessionStorage.removeItem('lazy-chunk-refreshed');
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ email: 'test@gtbs.in', name: 'Test', role: 'super_admin' }));
});

afterEach(() => {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
});

test('renders admin dashboard when session exists', async () => {
  render(<App />);
  expect(
    await screen.findByRole('heading', { name: /dashboard/i }, { timeout: 15000 })
  ).toBeInTheDocument();
  expect(screen.getAllByText(/GTBS Flicksy/i).length).toBeGreaterThan(0);
});
