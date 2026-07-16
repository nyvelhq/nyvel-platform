import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MotionConfig } from 'framer-motion';
import Toast from './Toast';
import { ToastProvider, useToast } from '../../context/ToastContext';

// Guards the P1 audit fix: auto-dismissed toasts previously skipped the
// exit animation entirely (only manual close/swipe went through it), and
// the dev preview pane can't be trusted to show whether either path
// actually unmounts the node — its rAF suspends when backgrounded, which
// freezes Framer Motion mid-transition regardless of whether the code is
// correct. jsdom has no such suspension, so this is the real signal.
function Harness() {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast('Saved successfully', 'success', 300)}>
      Fire toast
    </button>
  );
}

function renderWithToasts() {
  return render(
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <Harness />
        <Toast />
      </ToastProvider>
    </MotionConfig>
  );
}

describe('Toast auto-dismiss and manual dismiss', () => {
  it('removes the toast from the DOM once its auto-dismiss duration elapses', async () => {
    renderWithToasts();
    fireEvent.click(screen.getByText('Fire toast'));

    expect(screen.getByText('Saved successfully')).toBeInTheDocument();

    // duration is 300ms in the harness; give the exit transition room too
    await waitFor(
      () => expect(screen.queryByText('Saved successfully')).not.toBeInTheDocument(),
      { timeout: 2000 }
    );
  });

  it('removes the toast immediately when the dismiss button is clicked', async () => {
    renderWithToasts();
    fireEvent.click(screen.getByText('Fire toast'));

    const dismissButton = screen.getByRole('button', { name: 'Dismiss notification' });
    fireEvent.click(dismissButton);

    await waitFor(() =>
      expect(screen.queryByText('Saved successfully')).not.toBeInTheDocument()
    );
  });
});
