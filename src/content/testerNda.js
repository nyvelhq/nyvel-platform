// DRAFT — written without legal review. Have counsel review before relying on it.
// Whenever the text changes, bump `version`: each application stores the version
// the tester accepted (applications.nda_version), so old acceptances stay traceable.
export const TESTER_NDA = {
  version: 'v1-2026-09-26',
  title: 'Tester Confidentiality Agreement',
  intro:
    'This agreement applies to every test on Nyvel that is marked NDA-required and that you apply to. ' +
    'It is between you, Nyvel, and the company that created the test (the "Company"). ' +
    'By ticking the box and applying, you agree to it.',
  sections: [
    {
      heading: '1. What is confidential',
      body:
        'Everything you receive or see because of the test is confidential, including: the product, builds and ' +
        'access links; features, designs and content that are not yet public; the test briefing and instructions; ' +
        'any login details or test accounts; and the findings you and other testers submit.',
    },
    {
      heading: '2. What you agree to do',
      body:
        'Use confidential information only to carry out the test. Do not share it with anyone other than Nyvel and ' +
        'the Company. Do not post, publish, stream or share screenshots, recordings or descriptions of the product ' +
        'outside Nyvel. Keep access links and credentials private and do not let anyone else use them. Do not try ' +
        'to copy, reverse engineer or extract source code or data beyond what the test requires. Tell Nyvel promptly ' +
        'if you think confidential information has been exposed.',
    },
    {
      heading: '3. What is not covered',
      body:
        'Information that is or becomes public through no fault of yours, that you already knew lawfully before the ' +
        'test, that you receive from someone else who is free to share it, or that you develop independently without ' +
        'using the confidential information.',
    },
    {
      heading: '4. If the law requires disclosure',
      body:
        'You may disclose confidential information when the law requires it. Where you are allowed to, tell Nyvel ' +
        'first, and disclose only what is required.',
    },
    {
      heading: '5. Your feedback',
      body:
        'You give Nyvel and the Company permission to use the findings and feedback you submit to test and improve ' +
        'the product.',
    },
    {
      heading: '6. When the test ends',
      body:
        'Delete any builds, credentials and copies of confidential material you still have. Your obligations under ' +
        'this agreement continue for two years after the test ends, and for as long as any trade secret remains a ' +
        'trade secret.',
    },
    {
      heading: '7. If you break this agreement',
      body:
        'Nyvel may remove you from the test and from the platform. Nyvel and the Company may also pursue any other ' +
        'remedies available under the law.',
    },
    {
      heading: '8. Record of acceptance',
      body:
        'You accept this agreement electronically. Nyvel records the version of the agreement you accepted and the ' +
        'time you accepted it.',
    },
  ],
};
