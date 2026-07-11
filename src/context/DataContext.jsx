import React, { createContext, useContext, useState } from 'react';
import {
  companyTests as initialCompanyTests,
  availableTests as initialAvailableTests,
  myApplications as initialApplications,
} from '../data/mockData';

const DataContext = createContext(null);

export const useAppData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useAppData must be used within DataProvider');
  return ctx;
};

export function DataProvider({ children }) {
  const [companyTests, setCompanyTests] = useState(initialCompanyTests);
  const [availableTests, setAvailableTests] = useState(initialAvailableTests);
  const [myApplications, setMyApplications] = useState(initialApplications);

  const addCompanyTest = (test) => {
    setCompanyTests((prev) => [test, ...prev]);
  };

  const hasApplied = (testId) => myApplications.some((a) => a.sourceTestId === testId);

  const applyToTest = (test) => {
    if (hasApplied(test.id)) return;

    setMyApplications((prev) => [
      {
        id: `APP-${test.id}`,
        sourceTestId: test.id,
        testName: test.name,
        company: test.company,
        type: test.type,
        appliedDate: new Date().toISOString().slice(0, 10),
        status: 'Active',
        compensation: test.compensation,
        dueDate: test.deadline,
        progress: 0,
      },
      ...prev,
    ]);

    setAvailableTests((prev) =>
      prev.map((t) => (t.id === test.id ? { ...t, slots: Math.max(0, t.slots - 1) } : t))
    );
  };

  return (
    <DataContext.Provider
      value={{
        companyTests,
        addCompanyTest,
        availableTests,
        myApplications,
        applyToTest,
        hasApplied,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
