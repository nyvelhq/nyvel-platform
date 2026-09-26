import React from 'react';
import { render, screen } from '@testing-library/react';
import FindingThread from './FindingThread';
import { groupByFinding } from '../../lib/findingMessages';

jest.mock('../../lib/supabaseClient', () => ({ supabase: {} }));

const messages = [
  { id: '1', kind: 'question', body: 'Which browser?', created_at: '2026-09-20T10:00:00Z' },
  { id: '2', kind: 'reply', body: 'Safari 17', created_at: '2026-09-20T11:00:00Z' },
  { id: '3', kind: 'question', body: 'Private mode too?', created_at: '2026-09-21T10:00:00Z' },
  { id: '4', kind: 'accepted', body: null, created_at: '2026-09-22T10:00:00Z' },
];

it('shows every round, worded for the company', () => {
  render(<FindingThread messages={messages} viewer="company" />);
  const items = screen.getAllByRole('listitem');
  expect(items).toHaveLength(3); // the reasonless accept is left out
  expect(items[0]).toHaveTextContent('You asked: Which browser?');
  expect(items[1]).toHaveTextContent('Tester replied: Safari 17');
  expect(items[2]).toHaveTextContent('You asked: Private mode too?');
});

it('words it for the tester', () => {
  render(<FindingThread messages={messages.slice(0, 2)} viewer="tester" />);
  expect(screen.getByText(/The company asked:/)).toBeInTheDocument();
  expect(screen.getByText(/You replied:/)).toBeInTheDocument();
});

it('groupByFinding keeps order within each finding', () => {
  const grouped = groupByFinding([
    { id: 'a', finding_id: 'f1' },
    { id: 'b', finding_id: 'f2' },
    { id: 'c', finding_id: 'f1' },
  ]);
  expect(grouped.f1.map((m) => m.id)).toEqual(['a', 'c']);
  expect(grouped.f2).toHaveLength(1);
});
