import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequestAccess from './RequestAccess';
import { validateAccessRequest, EMPTY_REQUEST } from '../lib/accessRequests';
import { supabase } from '../lib/supabaseClient';

jest.mock('../lib/supabaseClient', () => {
  const insert = jest.fn(() => Promise.resolve({ error: null }));
  return { supabase: { from: jest.fn(() => ({ insert })), __insert: insert } };
});

const insertMock = () => supabase.__insert;

const renderAt = (url) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <RequestAccess />
    </MemoryRouter>
  );

// CRA's jest config resets mock implementations before each test.
beforeEach(() => {
  insertMock().mockImplementation(() => Promise.resolve({ error: null }));
  supabase.from.mockImplementation(() => ({ insert: insertMock() }));
});

describe('validateAccessRequest', () => {
  it('requires name, a valid email, and a company name for companies', () => {
    const errors = validateAccessRequest('company', { ...EMPTY_REQUEST, email: 'nope' });
    expect(Object.keys(errors).sort()).toEqual(['companyName', 'email', 'name']);
  });

  it('does not require a company name for testers', () => {
    const errors = validateAccessRequest('tester', { ...EMPTY_REQUEST, name: 'Kofi', email: 'kofi@example.com' });
    expect(errors).toEqual({});
  });
});

describe('RequestAccess page', () => {
  it('submits a company request with only company fields and shows a confirmation', async () => {
    renderAt('/request-access');
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: ' Dana ' } });
    fireEvent.change(screen.getByLabelText('Work email'), { target: { value: 'dana@acme.io' } });
    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'Acme' } });
    fireEvent.click(screen.getByRole('button', { name: /request access/i }));

    await screen.findByText(/we've got it/i);
    expect(supabase.from).toHaveBeenCalledWith('access_requests');
    expect(insertMock()).toHaveBeenCalledWith({
      kind: 'company', name: 'Dana', email: 'dana@acme.io', message: null, company_name: 'Acme', website: null,
    });
    expect(screen.getByText('dana@acme.io')).toBeInTheDocument();
  });

  it('opens in tester mode from ?type=tester and sends tester fields', async () => {
    renderAt('/request-access?type=tester');
    expect(screen.getByRole('heading', { name: 'Apply to test' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Kofi' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'kofi@example.com' } });
    fireEvent.change(screen.getByLabelText(/Devices you can test on/), { target: { value: 'Pixel 7' } });
    fireEvent.click(screen.getByRole('button', { name: /apply to test/i }));

    await waitFor(() => expect(insertMock()).toHaveBeenCalledTimes(1));
    expect(insertMock().mock.calls[0][0]).toMatchObject({ kind: 'tester', devices: 'Pixel 7', country: null });
  });

  it('shows field errors and does not submit when the form is invalid', () => {
    renderAt('/request-access');
    fireEvent.click(screen.getByRole('button', { name: /request access/i }));
    expect(screen.getByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Enter your company name.')).toBeInTheDocument();
    expect(insertMock()).not.toHaveBeenCalled();
  });

  it('silently drops submissions that fill the hidden honeypot field', async () => {
    renderAt('/request-access?type=tester');
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Bot' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bot@spam.io' } });
    fireEvent.change(screen.getByLabelText('Leave this empty'), { target: { value: 'gotcha' } });
    fireEvent.click(screen.getByRole('button', { name: /apply to test/i }));

    await screen.findByText(/we've got it/i);
    expect(insertMock()).not.toHaveBeenCalled();
  });

  it('shows the server error, e.g. the throttle message', async () => {
    insertMock().mockImplementation(() =>
      Promise.resolve({ error: { message: "We're receiving a lot of requests right now. Please try again in a few minutes." } })
    );
    renderAt('/request-access?type=tester');
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Kofi' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'kofi@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /apply to test/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/lot of requests/);
  });
});
