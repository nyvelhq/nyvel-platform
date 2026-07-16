import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import CreateTest from './CreateTest';
import { DataProvider } from '../context/DataContext';
import { AuthProvider } from '../App';

// Guards the AnimatePresence step-transition wiring (mode="wait" + key={step}):
// this is a revenue-critical flow, so we verify the actual DOM transition
// rather than relying on a visual check of the animation. Headings are
// queried by role (not text) because the Stepper repeats each step's
// label as plain text, which would otherwise match ambiguously.
function renderCreateTest() {
  return render(
    <MemoryRouter>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <DataProvider>
            <CreateTest />
          </DataProvider>
        </AuthProvider>
      </MotionConfig>
    </MemoryRouter>
  );
}

function fillStepOne() {
  fireEvent.change(screen.getByLabelText('Test Name *'), { target: { value: 'My Test' } });
  fireEvent.click(screen.getByText('Bug Hunt'));
  fireEvent.change(screen.getByLabelText('Start Date *'), { target: { value: '2026-08-01' } });
  fireEvent.change(screen.getByLabelText('End Date *'), { target: { value: '2026-08-15' } });
}

describe('CreateTest step transitions', () => {
  it('advances from step 1 to step 2 and mounts step 2 content after the exit animation', async () => {
    renderCreateTest();

    expect(screen.getByRole('heading', { name: 'Test Details' })).toBeInTheDocument();

    fillStepOne();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 1 content must be gone and step 2 content must be present —
    // if AnimatePresence mode="wait" never resolves, this times out.
    expect(await screen.findByRole('heading', { name: 'Tester Criteria' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Test Details' })).not.toBeInTheDocument();
  });

  it('goes back from step 2 to step 1', async () => {
    renderCreateTest();

    fillStepOne();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('heading', { name: 'Tester Criteria' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByRole('heading', { name: 'Test Details' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Tester Criteria' })).not.toBeInTheDocument();
  });
});
