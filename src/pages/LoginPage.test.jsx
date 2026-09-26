import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

jest.mock('../App', () => ({ useAuth: () => ({ signIn: jest.fn(), requestPasswordReset: jest.fn() }) }));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

// A11Y-01: fields are reachable by their visible label and the password
// toggle has a name that follows its state.
it('labels the sign-in fields and the show-password toggle', () => {
  renderLogin();
  expect(screen.getByLabelText('Email address')).toHaveAttribute('type', 'email');
  const password = screen.getByLabelText('Password');
  expect(password).toHaveAttribute('type', 'password');

  fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
  expect(password).toHaveAttribute('type', 'text');
  expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');
});

it('labels the reset-password email field', () => {
  renderLogin();
  fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
  expect(screen.getByLabelText('Email address')).toHaveAttribute('id', 'forgot-email');
});
