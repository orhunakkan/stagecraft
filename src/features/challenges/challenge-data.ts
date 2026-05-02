import type { Challenge } from './challenge-types';

export const challenges = [
  {
    id: 'accessible-locators',
    title: 'Accessible Locators Lab',
    difficulty: 'beginner',
    estimatedMinutes: 20,
    primaryConcept: 'Accessible locators',
    summary: 'Practice identifying interactive and descriptive elements by user-facing semantics.',
    tags: ['locators', 'accessibility', 'assertions'],
    practice: {
      labId: 'accessible-locators',
      title: 'Accessible Locators Lab',
      route: '/practice/accessible-locators',
    },
    content: {
      scenario:
        'A product team has rebuilt a landing page and wants resilient checks that describe the page the same way a user or assistive technology would.',
      learningObjective:
        'Recognize how roles, accessible names, labels, visible text, alternative text, and titles can make browser automation easier to read and less brittle.',
      instructions: [
        'Explore the practice page and identify the key navigation, heading, image, status, and action targets from the perspective of a user.',
        'Write your own checks that prove the important elements are visible and that the primary interactions update the page in observable ways.',
        'Notice where a user-facing locator is enough and where a stable explicit test contract would be more appropriate.',
      ],
      acceptanceCriteria: [
        'The main page structure, primary action, secondary link, and representative image can be verified through user-visible semantics.',
        'An interaction produces a visible state change that your test can assert without inspecting implementation details.',
        'The test remains understandable if visual styling or DOM nesting changes without altering the user-facing content.',
      ],
      constraints: [
        'Do not depend on generated class names, long CSS chains, XPath, or component internals.',
        'Prefer locators that reflect roles, labels, text alternatives, titles, and visible text before considering test IDs.',
        'Keep assertions focused on what a user can perceive or do on the page.',
      ],
      hints: [
        'Start with the way assistive technology would describe each control, then narrow only when more than one element has a similar purpose.',
        'For non-interactive information, visible text can be more meaningful than structural selectors.',
        'If a locator feels tied to layout or styling, look for a more stable user-facing signal.',
      ],
      conceptReferences: [
        'Role-based locating and accessible names',
        'Label, text, alt text, and title based locating',
        'Locator strictness and user-visible assertions',
      ],
    },
  },
  {
    id: 'forms-validation',
    title: 'Forms and Validation Lab',
    difficulty: 'beginner',
    estimatedMinutes: 25,
    primaryConcept: 'Form interactions and validation',
    summary:
      'Practice automating labeled controls, validation feedback, and enabled or disabled states.',
    tags: ['forms', 'locators', 'assertions', 'accessibility'],
    practice: {
      labId: 'forms-validation',
      title: 'Forms and Validation Lab',
      route: '/practice/forms-validation',
    },
    content: {
      scenario:
        'A workshop registration form must guide learners through required fields, preferences, agreement choices, and clear validation feedback.',
      learningObjective:
        'Use labels and observable form states to drive inputs, choose options, verify validation, and confirm successful submission behavior.',
      instructions: [
        'Submit the form in an incomplete state and observe which messages and control states guide the user.',
        'Complete the required fields, choose the relevant options, and confirm that the submit flow becomes available only when the form is valid.',
        'Verify the final confirmation by its visible content rather than by internal form state.',
      ],
      acceptanceCriteria: [
        'Required fields expose deterministic validation messages when the user attempts to submit incomplete information.',
        'Text input, email input, select, checkbox, and radio controls can be operated by their user-facing labels.',
        'The submit control clearly communicates disabled, enabled, and submitted states in a way automation can observe.',
      ],
      constraints: [
        'Do not bypass the form by changing application state directly.',
        'Do not assert private validation helper names or component state.',
        'Use web-first assertions for messages and enabled or disabled states instead of fixed waiting.',
      ],
      hints: [
        'Labels are the primary contract for most form controls.',
        'A good test follows the same path a keyboard or screen-reader user could follow.',
        'Validation copy should be asserted as user guidance, not as an implementation detail.',
      ],
      conceptReferences: [
        'Label-based form controls',
        'Checkbox, radio, and select interactions',
        'Web-first assertions for visible feedback',
      ],
    },
  },
  {
    id: 'tables-filtering',
    title: 'Tables and Filtering Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    primaryConcept: 'Lists, tables, and scoped assertions',
    summary:
      'Practice search, sort, filter, pagination, empty states, and row-level actions on deterministic data.',
    tags: ['tables', 'locators', 'assertions', 'accessibility'],
    practice: {
      labId: 'tables-filtering',
      title: 'Tables and Filtering Lab',
      route: '/practice/tables-filtering',
    },
    content: {
      scenario:
        'An operations dashboard contains a compact table of release tasks that must remain testable as users search, filter, sort, and act on individual rows.',
      learningObjective:
        'Scope checks to the row, list, or table region that matters so tests verify the correct item without relying on fragile DOM traversal.',
      instructions: [
        'Use search and filters to reduce the table to a meaningful subset of rows.',
        'Change sorting and pagination, then verify the user-visible row order and navigation state.',
        'Trigger a row-level action and confirm that only the intended item changes.',
      ],
      acceptanceCriteria: [
        'Search, status filtering, sorting, and pagination produce predictable visible results.',
        'An empty state appears when filters match no records and disappears after reset.',
        'A row-level action can be verified in the context of the matching row, not a different item with similar text.',
      ],
      constraints: [
        'Do not use positional selectors unless the visible ordering itself is the behavior under test.',
        'Avoid coupling tests to table implementation markup beyond what users can perceive.',
        'Reset filters between scenarios so each test can run independently.',
      ],
      hints: [
        'First find the meaningful region or row, then look for controls or text inside that scope.',
        'Counts and empty states are often clearer assertions than checking every cell.',
        'When data changes after filtering, assert both the included item and the absence of unrelated results.',
      ],
      conceptReferences: [
        'Locator chaining and filtering',
        'List and table roles',
        'Isolated, deterministic test data',
      ],
    },
  },
  {
    id: 'async-ui',
    title: 'Async UI Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    primaryConcept: 'Auto-waiting and async assertions',
    summary:
      'Practice loading, success, error, retry, and staged update flows without arbitrary sleeps.',
    tags: ['assertions', 'retries', 'debugging'],
    practice: {
      labId: 'async-ui',
      title: 'Async UI Lab',
      route: '/practice/async-ui',
    },
    content: {
      scenario:
        'A status panel loads work in stages, sometimes showing a retryable error before settling into a deterministic success state.',
      learningObjective:
        'Rely on Playwright actionability, auto-waiting, and web-first assertions to describe asynchronous behavior without introducing flaky timing assumptions.',
      instructions: [
        'Start the asynchronous workflow and observe the loading, partial, error, retry, and success states.',
        'Write checks that wait for meaningful user-visible state changes rather than waiting for a fixed amount of time.',
        'Verify that retry behavior recovers predictably and that the final state is visible to the user.',
      ],
      acceptanceCriteria: [
        'The loading state is visible after the workflow starts and is replaced by the next deterministic state.',
        'The retry path can be exercised and verified without random timing or manual sleeps.',
        'The final success state contains enough visible information for a stable assertion.',
      ],
      constraints: [
        'Do not use fixed time delays as the primary synchronization strategy.',
        'Do not inspect timer implementation details or private state machines.',
        'Treat each scenario as isolated by resetting the lab before a new flow.',
      ],
      hints: [
        'Wait for the state the user cares about, not for the mechanism that produced it.',
        'Auto-retrying assertions are designed for UI that changes after an action.',
        'A retry button is both an interaction target and proof that the error state appeared.',
      ],
      conceptReferences: [
        'Actionability checks and auto-waiting',
        'Web-first assertions',
        'Retryable async UI states',
      ],
    },
  },
  {
    id: 'network-api',
    title: 'Network API Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    primaryConcept: 'Network observation and API mocking',
    summary:
      'Practice deterministic API-backed UI behavior, refreshes, response checks, and mock-friendly flows.',
    tags: ['network', 'api', 'assertions', 'fixtures'],
    practice: {
      labId: 'network-api',
      title: 'Network API Lab',
      route: '/practice/network-api',
    },
    content: {
      scenario:
        'A support dashboard retrieves ticket data from local API endpoints and needs tests that can observe, verify, and optionally replace network responses.',
      learningObjective:
        'Connect visible UI outcomes with deterministic network activity while keeping tests independent from external services.',
      instructions: [
        'Load the lab and observe how the UI communicates loading, successful data, refresh, and recoverable error states.',
        'Write your own checks that relate a user action to the response-backed content that appears on the page.',
        'Practice replacing the API response in your own test project and verify that the UI reflects the controlled data.',
      ],
      acceptanceCriteria: [
        'Initial data loads from a local deterministic endpoint and becomes visible in the dashboard.',
        'Refreshing the data produces an observable loading state and updated user-facing timestamp or status.',
        'A controlled error response leads to a visible error state with a clear recovery path.',
      ],
      constraints: [
        'Do not call external services or rely on live third-party data.',
        'Do not assert implementation-only request helpers or internal fetch state.',
        'Keep mocked or observed data deterministic so repeated test runs produce the same result.',
      ],
      hints: [
        'Set up request interception before the user action that triggers the request.',
        'Pair network-level checks with visible UI assertions so the test proves user impact.',
        'Prefer local deterministic responses for practice instead of depending on the public internet.',
      ],
      conceptReferences: [
        'Network request and response observation',
        'Route-based API mocking',
        'Deterministic local fixtures',
      ],
    },
  },
  {
    id: 'fake-auth-session',
    title: 'Fake Auth Session Lab',
    difficulty: 'advanced',
    estimatedMinutes: 35,
    primaryConcept: 'Session state and protected routes',
    summary:
      'Practice safe login-like flows, redirects, logout, and reusable browser state without real credentials.',
    tags: ['auth', 'fixtures', 'configuration', 'assertions'],
    practice: {
      labId: 'fake-auth',
      title: 'Fake Auth Session Lab',
      route: '/practice/fake-auth',
    },
    content: {
      scenario:
        'A training portal uses a harmless fake session to demonstrate protected pages, redirects, and logout without storing real accounts or secrets.',
      learningObjective:
        'Understand how browser storage state affects navigation and how to test authenticated-like flows while keeping each scenario isolated.',
      instructions: [
        'Visit the protected area before signing in and observe the redirect or access message shown to the user.',
        'Complete the fake learner sign-in flow using only non-sensitive practice input, then confirm the protected content appears.',
        'Log out, verify access is removed, and consider how a saved browser state could speed up independent tests in your own project.',
      ],
      acceptanceCriteria: [
        'Unauthenticated access to the protected practice area leads to a clear redirect or access-required state.',
        'The fake sign-in creates a visible learner session without using real credentials.',
        'Logout removes the fake session and returns the app to the unauthenticated behavior.',
      ],
      constraints: [
        'Do not use real usernames, passwords, tokens, or secrets.',
        'Do not commit generated browser state files from your own practice project.',
        'Keep tests isolated so one scenario does not depend on another scenario signing in first.',
      ],
      hints: [
        'Authentication practice is about browser state and navigation behavior here, not about real identity security.',
        'A saved state can be useful, but only if it is treated as sensitive and regenerated when needed.',
        'Start from a clean context when you need to prove unauthenticated behavior.',
      ],
      conceptReferences: [
        'Browser context isolation',
        'Storage state for authenticated-like flows',
        'Protected route redirects and logout behavior',
      ],
    },
  },
  {
    id: 'browser-events',
    title: 'Browser Events Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    primaryConcept: 'Browser events and multi-page flows',
    summary: 'Practice handling native dialogs, uploads/downloads, popups, and navigation events.',
    tags: ['dialogs', 'downloads', 'uploads', 'tabs', 'assertions'],
    practice: {
      labId: 'browser-events',
      title: 'Browser Events Lab',
      route: '/practice/browser-events',
    },
    content: {
      scenario:
        'A settings panel triggers native browser dialogs, offers a file upload form, downloads a generated report, opens a same-origin popup, and links back to challenge detail content.',
      learningObjective:
        "Register event and URL waiters before the action that triggers them and verify the outcome using Playwright's dialog, upload, download, popup, and navigation APIs.",
      instructions: [
        'Set up a dialog handler before clicking the button that triggers it, then assert the visible result in the UI.',
        'Upload a file using setInputFiles and verify the filename and size displayed by the page.',
        'Start waiting for the download event before clicking the download button, then verify the suggested filename.',
        'Start waiting for the popup event before opening the new tab, then assert the popup URL and visible content.',
        'Pair navigation-triggering clicks with waitForURL when the expected route matters.',
      ],
      acceptanceCriteria: [
        'A confirmed dialog shows a visible confirmed result; a dismissed dialog shows a visible dismissed result.',
        'A file selected via setInputFiles produces visible filename and size information on the page.',
        'A download event is triggered and the suggested filename matches the expected value.',
        'A popup event is emitted for the same-origin new tab and exposes a stable target URL.',
        'A local navigation can be observed through the expected challenge detail URL.',
      ],
      constraints: [
        'Register dialog, download, popup, and navigation waiters before the triggering action, not after.',
        "Do not use real file system paths — use Playwright's FilePayload or a Buffer for setInputFiles.",
        'Keep each scenario isolated by resetting the lab or navigating back before tests that depend on initial state.',
      ],
      hints: [
        'The dialog handler must be in place before the click that opens it — dialogs block further execution until handled.',
        'setInputFiles accepts a path, array of paths, or a FilePayload object with name and buffer.',
        'page.waitForEvent("download") and page.waitForEvent("popup") should be created before the click that triggers them.',
        'Use page.waitForURL with a specific expected route instead of assuming navigation completed after a click.',
      ],
      conceptReferences: [
        'Native dialog handling (alert, confirm, prompt)',
        'File upload with setInputFiles',
        'Download events and suggested filename',
        'Popup events and same-origin tabs',
        'Navigation events and waitForURL',
      ],
    },
  },
  {
    id: 'frames-contexts',
    title: 'Frames and Contexts Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    primaryConcept: 'Frames and context isolation',
    summary:
      'Practice iframe interactions and isolated browser state without accounts or credentials.',
    tags: ['frames', 'fixtures', 'parallelism', 'assertions'],
    practice: {
      labId: 'frames-contexts',
      title: 'Frames and Contexts Lab',
      route: '/practice/frames-contexts',
    },
    content: {
      scenario:
        'A QA workspace embeds a task board in an iframe while the host page stores a harmless local context label used to illustrate isolated browser state.',
      learningObjective:
        'Move deliberately between host-page content and iframe content, then prove that saved browser state is scoped to the current isolated context.',
      instructions: [
        'Interact with the embedded task board from inside its frame and assert the visible frame-level updates.',
        'Save a harmless context label on the host page and confirm it is visible after a reload in the same context.',
        'Open the same lab in a separate browser context and verify the saved label does not leak into the fresh context.',
      ],
      acceptanceCriteria: [
        'The iframe exposes deterministic buttons, form fields, and status messages that can be verified from within the frame.',
        'A saved context label persists for the current browser context and reloads predictably.',
        'A fresh browser context starts without the previously saved label, demonstrating isolated local storage state.',
      ],
      constraints: [
        'Do not reach into implementation-only React state or generated styling classes.',
        'Do not use real credentials or authentication tokens for this isolation exercise.',
        'Keep frame interactions scoped to framed content and context-state checks scoped to the host page.',
      ],
      hints: [
        'A frame-aware locator changes the search area from the main page into the iframe before finding controls inside it.',
        'Browser contexts act like lightweight isolated profiles with their own local storage, session storage, and cookies.',
        'When proving isolation, compare user-visible state in separate contexts rather than relying on test execution order.',
      ],
      conceptReferences: [
        'Frame locators and iframe ownership',
        'Browser context isolation',
        'Local storage scoped per context',
        'Independent setup for parallel-safe tests',
      ],
    },
  },
  {
    id: 'emulation-input',
    title: 'Emulation and Input Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    primaryConcept: 'Emulation and input interactions',
    summary:
      'Practice responsive viewport checks, keyboard input, pointer actions, and touch-friendly UI.',
    tags: ['mobile-emulation', 'configuration', 'assertions', 'locators'],
    practice: {
      labId: 'emulation-input',
      title: 'Emulation and Input Lab',
      route: '/practice/emulation-input',
    },
    content: {
      scenario:
        'A release dashboard must remain testable across compact and wide viewports while supporting keyboard, pointer, and touch-like interactions.',
      learningObjective:
        'Use emulated browser settings and user-like input actions to verify responsive behavior and input outcomes from the learner-visible UI.',
      instructions: [
        'Change the viewport or device profile in your own test project and verify which layout guidance is visible.',
        'Use keyboard actions to submit and clear the command input, then assert the visible status messages.',
        'Exercise hover, click, double-click, and touch-friendly controls without relying on generated styling classes.',
      ],
      acceptanceCriteria: [
        'Compact, tablet, and desktop viewport modes expose deterministic visible guidance at the expected widths.',
        'Keyboard input produces visible submitted and cleared states without inspecting private event handlers.',
        'Pointer and touch-friendly controls update visible statuses and remain usable in dark mode and responsive layouts.',
      ],
      constraints: [
        'Do not use fixed sleeps to wait for layout changes; assert the visible mode or interaction result.',
        'Do not bypass user-like input by setting component state directly.',
        'Keep mobile-emulation checks focused on observable behavior, not browser internals.',
      ],
      hints: [
        'Device and viewport settings affect browser behavior before the page is exercised, so set them up before asserting responsive content.',
        'Most text input can be driven by filling fields, while key-specific behavior should be checked through keyboard events and visible results.',
        'Pointer actions are more useful when the page exposes a clear hover, click, or double-click outcome for users.',
      ],
      conceptReferences: [
        'Viewport and device emulation',
        'Keyboard input and shortcut handling',
        'Mouse hover, click, and double-click actions',
        'Touch-friendly target behavior',
        'Color scheme and responsive UI checks',
      ],
    },
  },
  {
    id: 'debugging-reporting',
    title: 'Debugging and Reporting Concepts',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    primaryConcept: 'Debugging artifacts and reports',
    summary:
      'Plan how traces, screenshots, videos, retries, timeouts, annotations, and reports help diagnose failures.',
    tags: ['debugging', 'tracing', 'screenshots', 'retries', 'configuration', 'visual'],
    practice: {
      labId: 'debugging-reporting',
      title: 'Debugging and Reporting Concepts',
      route: '/practice/debugging-reporting',
      kind: 'concept',
    },
    content: {
      scenario:
        'A team has a mostly reliable browser test suite, but failures on developer machines and CI are hard to explain after the run has ended.',
      learningObjective:
        'Choose the right failure artifact, retry strategy, timeout boundary, annotation, and report format so debugging evidence is captured without hiding product bugs.',
      instructions: [
        'Review a recent or intentionally created failing test in your own Playwright project and identify which artifact would make the failure easiest to understand.',
        'Decide when traces, screenshots, and videos should be collected locally and in CI so successful runs stay lightweight while failed runs leave useful evidence.',
        'Compare test-level, assertion-level, and suite-level timeouts, then document which boundary should change only after the slow behavior is understood.',
        'Add meaningful titles, tags, annotations, or named steps in your own project so the report explains the intent of the scenario before someone opens the source file.',
        'Use retries as a signal for investigation by distinguishing a genuinely fixed pass from a flaky pass that needs follow-up.',
      ],
      acceptanceCriteria: [
        'You can explain which artifact to inspect first for an actionability failure, a visual mismatch, a slow assertion, and a CI-only failure.',
        'Your own project has a written policy for collecting traces, screenshots, or videos on failure or retry without recording every successful run by default.',
        'Timeout changes are justified by observed behavior and do not replace web-first assertions or deterministic test setup.',
        'Reports include enough names, tags, annotations, and failure artifacts for another person to triage the run without asking what the test was meant to prove.',
      ],
      constraints: [
        'Do not paste generated solution scripts into Stagecraft or into learner-facing notes.',
        'Do not treat a retry that eventually passes as a completed fix without investigating the first failure.',
        'Do not increase timeouts globally until the slow boundary and user impact are understood.',
        'Do not publish traces, videos, screenshots, or reports if they may contain private application data.',
      ],
      hints: [
        'A trace is strongest when you need to inspect actions, DOM snapshots, console output, network activity, and source context together after the run.',
        'Screenshots and videos are useful evidence, but they are artifacts to review, not assertions by themselves.',
        'Retries reduce noise only when paired with investigation of flaky results and targeted artifacts from retry attempts.',
        'Short, intentional annotations can make a report easier to scan than comments hidden inside the test file.',
        'Timeouts describe patience boundaries; they should match realistic user and system behavior rather than mask nondeterminism.',
      ],
      conceptReferences: [
        'Trace viewer actions, snapshots, console, and network panels',
        'Screenshots, videos, and visual comparison artifacts',
        'Retry outcomes and flaky test triage',
        'Test, assertion, action, navigation, fixture, and global timeout boundaries',
        'Tags, annotations, named steps, and reporter output',
      ],
    },
  },
] satisfies readonly Challenge[];
