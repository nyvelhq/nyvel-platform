import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MotionModal from './MotionModal';

describe('MotionModal', () => {
  it('renders dialog content when open', () => {
    render(
      <MotionModal open onClose={() => {}} labelledBy="t">
        <h2 id="t">Hello</h2>
      </MotionModal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('calls onClose on Escape keydown', () => {
    const onClose = jest.fn();
    render(
      <MotionModal open onClose={onClose} labelledBy="t">
        <h2 id="t">Hello</h2>
      </MotionModal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on backdrop click but not on panel click', () => {
    const onClose = jest.fn();
    render(
      <MotionModal open onClose={onClose} labelledBy="t">
        <h2 id="t">Hello</h2>
      </MotionModal>
    );
    fireEvent.click(screen.getByText('Hello')); // inside panel — must NOT close
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('unmounts the dialog after open flips to false (exit completes)', async () => {
    const { rerender } = render(
      <MotionModal open onClose={() => {}} labelledBy="t">
        <h2 id="t">Hello</h2>
      </MotionModal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(
      <MotionModal open={false} onClose={() => {}} labelledBy="t">
        <h2 id="t">Hello</h2>
      </MotionModal>
    );

    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  it('locks body scroll while open and restores on close', async () => {
    const { rerender } = render(
      <MotionModal open onClose={() => {}} labelledBy="t">
        <h2 id="t">Hello</h2>
      </MotionModal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <MotionModal open={false} onClose={() => {}} labelledBy="t">
        <h2 id="t">Hello</h2>
      </MotionModal>
    );
    await waitFor(() => expect(document.body.style.overflow).not.toBe('hidden'));
  });
});
