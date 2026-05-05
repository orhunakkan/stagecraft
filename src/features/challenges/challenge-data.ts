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
  // ─── Clock and Time Control Lab ──────────────────────────────────────────────
  {
    id: 'clock-time',
    title: 'Clock and Time Control Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    primaryConcept: 'Clock control and time manipulation',
    summary:
      'Practice freezing time, fast-forwarding countdowns, and triggering scheduled refreshes without real delays.',
    tags: ['assertions', 'configuration', 'clock'],
    practice: {
      labId: 'clock-time',
      title: 'Clock and Time Control Lab',
      route: '/practice/clock-time',
    },
    content: {
      scenario:
        'A release dashboard shows a live clock, a session countdown timer, and a scheduled auto-refresh panel — all driven by real browser timers that must be controlled to make tests fast and deterministic.',
      learningObjective:
        "Use Playwright's clock API to freeze Date.now(), fast-forward setInterval timers, and observe time-dependent UI states without waiting for real seconds or minutes to pass.",
      instructions: [
        'Use page.clock.setFixedTime() before navigating to assert a specific date and time on the live clock display.',
        'Use page.clock.install() and page.clock.fastForward() to skip 5 minutes and trigger the session expiry alert without waiting.',
        'Advance the clock by 30 seconds twice and verify the auto-refresh counter increments to 2.',
      ],
      acceptanceCriteria: [
        'The live clock display reflects the exact time set by setFixedTime and does not change until the clock advances.',
        'The session expired alert is visible after fastForward moves the clock past the 5-minute boundary.',
        'The refresh counter shows 2 and the last-refreshed timestamp is visible after two 30-second advances.',
      ],
      constraints: [
        'Do not use page.waitForTimeout() or fixed sleeps to wait for timer-driven changes.',
        'Do not read private component state or internal timer references.',
        'Call page.clock.install() before navigating to ensure all browser globals are controlled from the start.',
      ],
      hints: [
        'setFixedTime is enough when you only need to freeze Date.now() without controlling timers.',
        'install() must be called before the page loads so all timer globals are replaced from the first tick.',
        'fastForward fires all timers that would have fired during the elapsed period, in order.',
      ],
      conceptReferences: [
        'page.clock.setFixedTime — freezing Date.now()',
        'page.clock.install() + fastForward — skipping real time',
        'page.clock.pauseAt — stopping at a specific moment',
      ],
    },
  },

  // ─── API Request Testing Lab ─────────────────────────────────────────────────
  {
    id: 'api-request-testing',
    title: 'API Request Testing Lab',
    difficulty: 'advanced',
    estimatedMinutes: 35,
    primaryConcept: 'Direct API requests with the request fixture',
    summary:
      'Practice GET, POST, and DELETE requests, JSON assertions, status codes, and hybrid API-plus-UI flows.',
    tags: ['api', 'network', 'assertions', 'fixtures'],
    practice: {
      labId: 'api-request-testing',
      title: 'API Request Testing Lab',
      route: '/practice/api-request-testing',
    },
    content: {
      scenario:
        'A test run registry exposes four HTTP endpoints that let you read, create, and delete run records without opening a browser. The same data is displayed in a live UI table.',
      learningObjective:
        "Use Playwright's request fixture to send typed HTTP requests, assert response status and JSON shape, and compare API-level state with what the browser UI shows.",
      instructions: [
        'Send a GET request to the runs endpoint and assert the status code, the presence of a runs array, and the shape of the first item.',
        'POST a new run with name and status, assert the 201 response, then GET all runs and confirm the new entry is present.',
        'DELETE a run by its id and assert the 204 response, then verify the run is absent from a subsequent GET.',
        'Use the request fixture to create a known run before navigating to the UI, then locate it in the table by name.',
      ],
      acceptanceCriteria: [
        'GET /api/practice/runs returns 200 with a body containing a runs array and a total count.',
        'POST with a valid name and status returns 201 and the created run; a subsequent GET includes it.',
        'DELETE returns 204 and the target run no longer appears in a subsequent GET.',
        'A run created via the request fixture appears in the browser table without page.route() mocking.',
      ],
      constraints: [
        'Do not use page.route() to mock the API when the goal is to verify real server behaviour.',
        'Do not depend on the order of seed runs — use the returned id or name to identify specific items.',
        'Clean up any runs you create so subsequent test runs start from a predictable state.',
      ],
      hints: [
        'The request fixture is available alongside page in the test function arguments.',
        'response.json() returns the parsed body; combine it with expect(...).toHaveProperty() for shape assertions.',
        'A run created via request.post() is immediately visible in a fresh page.goto() without any mocking.',
      ],
      conceptReferences: [
        'request fixture and APIRequestContext',
        'Asserting HTTP status codes and JSON bodies',
        'Hybrid API-plus-UI test patterns',
      ],
    },
  },

  // ─── Page Object Model Lab (concept) ─────────────────────────────────────────
  {
    id: 'page-objects',
    title: 'Page Object Model Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    primaryConcept: 'Page Object Model and test fixtures',
    summary:
      'Plan how page objects, custom fixtures, and reusable helpers reduce duplication and improve test readability.',
    tags: ['fixtures', 'configuration', 'assertions'],
    practice: {
      labId: 'page-objects',
      title: 'Page Object Model Lab',
      route: '/practice/page-objects',
      kind: 'concept',
    },
    content: {
      scenario:
        'A growing test suite for Stagecraft has started repeating the same selectors and setup steps across multiple spec files. Page objects and custom fixtures offer a structured way to reduce that duplication.',
      learningObjective:
        'Identify when a page object is worth extracting, encapsulate locators and actions in a class, connect it to a custom fixture, and keep test code focused on intent rather than implementation.',
      instructions: [
        'Pick one Stagecraft lab that has more than three locators repeated across tests. Extract them into a page object class.',
        'Write a goto() method that navigates and waits for the first stable, user-visible element before returning.',
        'Create a custom fixture with test.extend() that instantiates the page object so tests receive it directly.',
        'Refactor a beforeEach block to use the fixture and confirm each test still expresses its intent clearly.',
      ],
      acceptanceCriteria: [
        'The page object class holds all locators for a lab as readonly Locator properties.',
        'A goto() method navigates, waits for readiness, and can be called from a fixture or a test.',
        'A custom fixture built with test.extend() instantiates the page object and navigates automatically.',
        'The test body reads like a story about user behaviour rather than a list of selectors.',
      ],
      constraints: [
        'Do not add public helper functions to page objects that tests call directly outside the object.',
        'Do not duplicate locators — each selector should appear exactly once inside the page object.',
        'Keep each fixture focused: one page object per fixture unless two pages are always used together.',
      ],
      hints: [
        'Start with a single page object before worrying about a base class or shared hierarchy.',
        'A fixture that calls goto() inside its setup means tests never need to repeat the navigation step.',
        'If a method grows beyond two or three actions, it may be doing too much — consider splitting it.',
      ],
      conceptReferences: [
        'Page Object Model pattern and class structure',
        'test.extend() for custom fixtures',
        'Fixture scope: test vs worker',
      ],
    },
  },

  // ─── Mock Browser APIs Lab ───────────────────────────────────────────────────
  {
    id: 'mock-browser-apis',
    title: 'Mock Browser APIs Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    primaryConcept: 'Browser API mocking with page.addInitScript',
    summary:
      'Practice injecting mock geolocation, network status, and user preferences before the page loads.',
    tags: ['assertions', 'configuration', 'browser-apis'],
    practice: {
      labId: 'mock-browser-apis',
      title: 'Mock Browser APIs Lab',
      route: '/practice/mock-browser-apis',
    },
    content: {
      scenario:
        'A device environment dashboard reads geolocation coordinates, network connection details, and user accessibility preferences from native browser APIs. Tests must inject controlled values before the page loads to produce deterministic results regardless of the machine running them.',
      learningObjective:
        'Use page.addInitScript() to replace browser globals with deterministic mock implementations before any page script runs, then verify the UI correctly reflects the injected values.',
      instructions: [
        'Use page.addInitScript() to inject a mock geolocation implementation that resolves with known coordinates, then click "Request Location" and assert the displayed coordinates.',
        'Override navigator.onLine and navigator.connection via page.addInitScript(), then click "Check Connection" and verify the displayed network status.',
        'Inject a mock window.matchMedia function that returns controlled values for prefers-reduced-motion and prefers-color-scheme, then click "Detect Preferences" and assert the displayed preferences.',
      ],
      acceptanceCriteria: [
        'The geolocation panel displays the latitude and longitude values supplied by your mock implementation when the location button is clicked.',
        'The network status panel reflects the online or offline state and connection type defined in your addInitScript injection.',
        'The user preferences panel shows the motion and color-scheme values returned by your mock matchMedia function.',
      ],
      constraints: [
        'Call page.addInitScript() before page.goto() so the mock is active before the first line of page script executes.',
        'Do not use page.evaluate() after navigation as a substitute for addInitScript — the goal is pre-load injection.',
        'Do not assert implementation details or private function names — verify only the user-visible text and status indicators.',
      ],
      hints: [
        'page.addInitScript() runs in the browser context before any page scripts execute — it is the correct place to replace globals.',
        'window.matchMedia must return a MediaQueryList-compatible object; at minimum supply a .matches boolean property.',
        'navigator.onLine is a read-only property, so use Object.defineProperty to override it from within addInitScript.',
      ],
      conceptReferences: [
        'page.addInitScript — injecting code before page scripts run',
        'Mocking read-only navigator properties with Object.defineProperty',
        'Mock matchMedia and geolocation patterns',
      ],
    },
  },

  // ─── ARIA Snapshots Lab ───────────────────────────────────────────────────────
  {
    id: 'aria-snapshots',
    title: 'ARIA Snapshots Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    primaryConcept: 'Structural accessibility tree snapshots',
    summary:
      'Practice verifying navigation, feature lists, and collapsible FAQ regions using toMatchAriaSnapshot.',
    tags: ['accessibility', 'assertions', 'aria-snapshots'],
    practice: {
      labId: 'aria-snapshots',
      title: 'ARIA Snapshots Lab',
      route: '/practice/aria-snapshots',
    },
    content: {
      scenario:
        'A documentation portal has a navigation landmark, a feature status registry, and a collapsible FAQ. The team needs structural checks that catch role regressions, missing accessible names, and state changes in the accessibility tree.',
      learningObjective:
        'Use toMatchAriaSnapshot() to capture and verify the ARIA tree structure of interactive regions, including expanded and collapsed states and status badge labels.',
      instructions: [
        'Write a toMatchAriaSnapshot() assertion scoped to the site navigation region and verify each link name and the current-page indicator.',
        'Capture the feature status list and confirm each feature name and its status badge label appear in the snapshot template.',
        'Toggle one or more FAQ sections open and verify that the aria-expanded state is reflected in a snapshot taken after interaction.',
      ],
      acceptanceCriteria: [
        'A snapshot template for the navigation region correctly names each link and identifies the active page link.',
        'A snapshot template for the feature list captures all feature names and their status labels as accessible text.',
        'The FAQ accordion snapshot reflects the correct aria-expanded state after toggling one or more items open.',
      ],
      constraints: [
        'Use toMatchAriaSnapshot() for structural checks, not as a replacement for targeted assertions on individual elements.',
        'Scope each snapshot to the relevant landmark or region using a role-based or label-based locator before calling toMatchAriaSnapshot.',
        'Write snapshot templates inline as template literals rather than relying on auto-generated snapshot files for this practice exercise.',
      ],
      hints: [
        'The ARIA snapshot YAML format uses role names followed by the accessible text, for example: - link "Dashboard".',
        'When a disclosure button has aria-expanded set to true, the snapshot shows [expanded] after the role and name.',
        'Scope your snapshot assertion to a region locator so unrelated page content does not cause false failures.',
      ],
      conceptReferences: [
        'toMatchAriaSnapshot — ARIA tree YAML template format',
        'Scoping snapshots to landmarks and named regions',
        'Matching aria-expanded, aria-checked, and aria-selected states in snapshots',
      ],
    },
  },

  // ─── Drag-and-Drop Ordering Lab ───────────────────────────────────────────────
  {
    id: 'drag-drop',
    title: 'Drag-and-Drop Ordering Lab',
    difficulty: 'advanced',
    estimatedMinutes: 35,
    primaryConcept: 'Drag-and-drop with locator.dragTo',
    summary:
      'Practice reordering a sortable deployment checklist and moving Kanban cards between columns using locator.dragTo.',
    tags: ['assertions', 'locators', 'drag-drop'],
    practice: {
      labId: 'drag-drop',
      title: 'Drag-and-Drop Ordering Lab',
      route: '/practice/drag-drop',
    },
    content: {
      scenario:
        'A release pipeline board has a sortable deployment checklist and a two-column Kanban view. Automated tests must verify item order after reordering and card column membership after moving cards.',
      learningObjective:
        'Use locator.dragTo() to trigger drag-and-drop interactions and verify the resulting list order and column membership using visible user-facing content.',
      instructions: [
        'Drag the last deployment step to the first position and verify the visible order changed by reading step names from the list.',
        'Drag a card from the Backlog column into the Active column and assert the column card counts and the card\'s new placement.',
        'Chain multiple drags and verify the final ordering or column state matches your expected outcome.',
      ],
      acceptanceCriteria: [
        'After dragging a step to a new position, the list order visibly reflects the change and the original position is occupied by a different step.',
        'A card dragged from Backlog to Active is no longer present in Backlog and appears in Active.',
        'Column item counts update to reflect the move without requiring a page reload.',
      ],
      constraints: [
        'Use locator.dragTo() or page.dragAndDrop() rather than dispatching synthetic mouse events manually.',
        'Do not read internal React state — assert visible text order and column membership from the rendered DOM.',
        'Run drag tests in Chromium for reliable HTML5 drag event dispatch; note that results may differ across browser engines.',
      ],
      hints: [
        'locator.dragTo() accepts a target locator — use getByText or getByRole to identify items by their visible name.',
        'After a drag, use locator.all() on a container to collect all items and compare text content to the expected order.',
        'If a drag does not register, pass { steps: 5 } to interpolate pointer moves and give the drag handler time to respond.',
      ],
      conceptReferences: [
        'locator.dragTo() — drag from source locator to target locator',
        'page.dragAndDrop() — selector-based drag alternative',
        'Verifying list order with locator.all() and text content',
      ],
    },
  },
  // ─── Test Parameterization Lab ───────────────────────────────────────────────
  {
    id: 'data-driven-testing',
    title: 'Test Parameterization Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    primaryConcept: 'Data-driven testing',
    summary:
      'Practice running the same test logic with multiple input data sets to reduce duplication.',
    tags: ['fixtures', 'parameterization', 'refactoring'],
    practice: {
      labId: 'data-driven-testing',
      title: 'Test Parameterization Lab',
      route: '/practice/data-driven',
      kind: 'concept',
    },
    content: {
      scenario:
        'A badge generation service needs to be tested with several valid combinations of styles and labels. Instead of writing a separate test for each combination, your goal is to write a single, data-driven test that iterates through an array of inputs and expected outcomes, reducing code duplication and improving maintainability.',
      learningObjective:
        'Use a loop (like `forEach`) to run a single test block with multiple data sets, giving each test a unique and descriptive title based on the input.',
      instructions: [
        'Create an array of test data containing different badge labels and styles (e.g., "Info", "Success", "Warning").',
        'Use a `forEach` loop to iterate over your data array.',
        'Inside the loop, create a test block with a dynamic title that describes the current data being tested (e.g., naming it after the badge style and label).',
        'In the test body, fill the form with the current label and style, click "Generate", and assert that the generated badge has the correct text and visual style.',
      ],
      acceptanceCriteria: [
        'A single test file successfully runs multiple test cases based on the provided data array.',
        'Each test case in the test report has a unique name that reflects the data it used.',
        'The test correctly verifies the output for each combination of inputs.',
      ],
      constraints: [
        'Do not write separate, individual test blocks for each data variation.',
        'The test data should be defined in a clear, easy-to-read array of objects.',
        'Focus on the test structure; the UI itself is simple and will not have complex edge cases.',
      ],
      hints: [
        'Wrap all your parameterized test blocks inside a `describe` group for better organization.',
        'Use a template literal string for the test title to embed the current data values dynamically.',
        'Asserting on a CSS class or a `data-` attribute is a good way to check the badge\'s style.',
      ],
      conceptReferences: [
        'Parameterizing tests',
        'Using `test.describe` to group tests',
        'Creating dynamic test titles',
      ],
    },
  },

  // ─── WebSocket Testing Lab ───────────────────────────────────────────────────
  {
    id: 'websockets',
    title: 'WebSocket Testing Lab',
    difficulty: 'advanced',
    estimatedMinutes: 30,
    primaryConcept: 'Mocking real-time communication',
    summary:
      'Practice intercepting and mocking WebSocket connections to test real-time UI updates.',
    tags: ['websockets', 'network', 'api', 'fixtures'],
    practice: {
      labId: 'websockets',
      title: 'WebSocket Testing Lab',
      route: '/practice/websockets',
    },
    content: {
      scenario:
        'A live activity feed for a shipping service needs to display real-time status updates. The UI attempts to connect to a WebSocket endpoint and render messages as they arrive. Your task is to test the UI\'s handling of connection states and incoming messages without a live backend.',
      learningObjective:
        'Use `page.routeWebSocket()` to intercept a WebSocket connection, mock the server-side communication by sending controlled messages, and verify the UI updates correctly.',
      instructions: [
        'Use `page.routeWebSocket()` to intercept the connection attempt made when the "Connect" button is clicked.',
        'Inside the route handler, listen for an initial client message (e.g., "subscribe"), then use `ws.send()` to push a series of mock status updates to the page.',
        'Verify that each message sent from your mock server appears correctly in the activity feed.',
        'In a separate test, use `ws.close()` to simulate a connection failure and assert that the UI displays an appropriate error message.',
      ],
      acceptanceCriteria: [
        'The UI transitions from "Connecting..." to "Connected" when the WebSocket is successfully mocked.',
        'Messages sent from the mock WebSocket server are displayed in the activity feed list.',
        'The UI displays a "Disconnected" or error state if the WebSocket connection is closed by the mock server.',
      ],
      constraints: [
        'Do not require a live WebSocket server; all interaction should be mocked using `page.routeWebSocket`.',
        'Your test should control the timing and content of messages, not depend on real-time events.',
        'Ensure the route handler is set up *before* the action that triggers the WebSocket connection.',
      ],
      hints: [
        'The `page.routeWebSocket` handler gives you a `ws` object that mimics a real WebSocket server.',
        'Remember to `await` the `page.routeWebSocket` call to ensure the handler is active.',
        'You can send JSON payloads by using `JSON.stringify` before calling `ws.send`.',
      ],
      conceptReferences: [
        '`page.routeWebSocket()` for mocking',
        '`ws.onMessage()` to handle client frames',
        '`ws.send()` to push frames to the client',
        '`ws.close()` to terminate the connection',
      ],
    },
  },

  // ─── Visual Comparison Lab ───────────────────────────────────────────────────
  {
    id: 'visual-comparison',
    title: 'Visual Comparison Lab',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    primaryConcept: 'Visual regression testing',
    summary:
      'Practice capturing and comparing screenshots to prevent unintended UI changes.',
    tags: ['visual', 'screenshots', 'assertions'],
    practice: {
      labId: 'visual-comparison',
      title: 'Visual Comparison Lab',
      route: '/practice/visual-comparison',
    },
    content: {
      scenario:
        'A product marketing team needs to ensure their new component library showcase page remains pixel-perfect across releases. Your task is to write screenshot tests that catch unintended visual regressions in layout, styling, and content while ignoring dynamic data like timestamps.',
      learningObjective:
        'Use `toHaveScreenshot()` to catch visual regressions, update golden snapshots when changes are intentional, and mask dynamic content to prevent flaky tests.',
      instructions: [
        'Run an initial test to generate the first set of "golden" screenshot files and inspect the generated images.',
        'Write a targeted screenshot assertion against the main showcase card to verify its overall appearance.',
        'Isolate the dynamic timestamp in the footer and use the `mask` option to exclude it from pixel comparison.',
        'Introduce an intentional style change via script injection, update the snapshot with `--update-snapshots`, and verify the new baseline.',
      ],
      acceptanceCriteria: [
        'A full-page screenshot matches the golden snapshot, proving the overall layout is correct.',
        'A component-level screenshot of the showcase card matches its golden snapshot.',
        'A screenshot of the footer matches even when the timestamp text changes, proving the mask works.',
        'You can successfully update a snapshot when a deliberate visual change is made.',
      ],
      constraints: [
        'Use `toHaveScreenshot()` for visual assertions; do not manually compare image buffers.',
        'Run tests in a consistent environment (like the provided Docker container or CI) to avoid font and rendering differences.',
        'Mask only the parts of the UI that are truly dynamic; do not mask static text or stable images.',
      ],
      hints: [
        'The first run will always "fail" because it needs to create the baseline snapshots. Add them to git.',
        'The `mask` option takes an array of locators to hide before taking the screenshot.',
        'Use the trace viewer to inspect the `before` and `after` images when a screenshot assertion fails.',
      ],
      conceptReferences: [
        'Visual comparisons with `toHaveScreenshot()`',
        'Updating snapshots with `--update-snapshots`',
        'Masking dynamic elements',
        'Component-level screenshot testing',
      ],
    },
  },
] satisfies readonly Challenge[];
