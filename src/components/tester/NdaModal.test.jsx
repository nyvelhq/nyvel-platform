import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NdaModal from './NdaModal';
import { TESTER_NDA } from '../../content/testerNda';

describe('NdaModal', () => {
  it('keeps Accept & Apply disabled until the tester ticks the agreement', async () => {
    const onAccept = jest.fn().mockResolvedValue({ error: null });
    render(<NdaModal open onClose={() => {}} onAccept={onAccept} testName="Beta App" />);

    const accept = screen.getByRole('button', { name: /accept & apply/i });
    expect(accept).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox', { name: /i have read and agree/i }));
    expect(accept).toBeEnabled();

    fireEvent.click(accept);
    await waitFor(() => expect(onAccept).toHaveBeenCalledWith(TESTER_NDA.version));
  });

  it('shows the error when applying fails', async () => {
    const onAccept = jest.fn().mockResolvedValue({ error: new Error('This test requires accepting the tester NDA before applying.') });
    render(<NdaModal open onClose={() => {}} onAccept={onAccept} />);

    fireEvent.click(screen.getByRole('checkbox', { name: /i have read and agree/i }));
    fireEvent.click(screen.getByRole('button', { name: /accept & apply/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/requires accepting the tester NDA/i);
  });

  it('is read-only without onAccept', () => {
    render(<NdaModal open onClose={() => {}} />);

    expect(screen.getByRole('dialog')).toHaveTextContent(TESTER_NDA.title);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});
