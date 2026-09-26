import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import TesterOnboarding from './TesterOnboarding';
import { useAuth } from '../App';

const mockNavigate = jest.fn();
const mockAddToast = jest.fn();

jest.mock('react-router-dom', () => ({ ...jest.requireActual('react-router-dom'), useNavigate: () => mockNavigate }));
jest.mock('../App', () => ({ useAuth: jest.fn() }));
jest.mock('../context/ToastContext', () => ({ useToast: () => ({ addToast: mockAddToast }) }));
jest.mock('../components/platform/PlatformLayout', () => ({ children }) => <div>{children}</div>);

const savedUser = { id: 'u1', name: 'Ama Mensah', skills: ['Fintech'], linkedin: '' };

function renderOnboarding(updateUser) {
  useAuth.mockReturnValue({ user: savedUser, updateUser });
  return render(
    <MemoryRouter>
      <MotionConfig reducedMotion="always">
        <TesterOnboarding />
      </MotionConfig>
    </MemoryRouter>
  );
}

async function goToLastStep() {
  for (const next of ['Your devices & setup', 'Skills & expertise', 'Almost done!']) {
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    // eslint-disable-next-line no-await-in-loop
    await screen.findByRole('heading', { name: next });
  }
}

describe('TesterOnboarding', () => {
  it('saves the saved-profile answers and goes to the dashboard', async () => {
    const updateUser = jest.fn(() => Promise.resolve({ error: null }));
    renderOnboarding(updateUser);
    await goToLastStep();
    fireEvent.click(screen.getByRole('button', { name: /complete profile/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/tester/dashboard'));
    expect(updateUser.mock.calls[0][0]).toMatchObject({ profileComplete: true, name: 'Ama Mensah', skills: ['Fintech'] });
  });

  it('stays on the page and shows the error when the save fails', async () => {
    const updateUser = jest.fn(() => Promise.resolve({ error: { message: 'relation "tester_profiles" does not exist' } }));
    renderOnboarding(updateUser);
    await goToLastStep();
    fireEvent.click(screen.getByRole('button', { name: /complete profile/i }));

    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.stringMatching(/couldn't save/i), 'error'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('blocks a LinkedIn value that is not an http(s) link', async () => {
    renderOnboarding(jest.fn());
    await goToLastStep();
    fireEvent.change(screen.getByPlaceholderText(/linkedin.com/), { target: { value: 'linkedin.com/in/ama' } });
    expect(screen.getByText(/starting with https/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /complete profile/i })).toBeDisabled();
  });
});
