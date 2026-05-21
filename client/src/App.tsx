import { lazy, Suspense, type ComponentType } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Shell } from './layouts/Shell';
import { Home } from './pages/Home';
import { LabFallback } from './pages/LabFallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import { labs } from './labs';

function lazyNamed<TModule extends object, TExport extends keyof TModule & string>(
  load: () => Promise<TModule>,
  exportName: TExport,
) {
  return lazy(async () => ({ default: (await load())[exportName] as ComponentType }));
}

// Component map — keyed by lab slug.  Adding a lab only requires a new entry here.
const labComponentMap: Record<string, ComponentType> = {
  'accessible-locators': lazyNamed(
    () => import('./pages/practice/AccessibleLocators'),
    'AccessibleLocators',
  ),
  'forms-validation': lazyNamed(
    () => import('./pages/practice/FormsValidation'),
    'FormsValidation',
  ),
  'async-ui': lazyNamed(() => import('./pages/practice/AsyncUi'), 'AsyncUi'),
  'network-api': lazyNamed(() => import('./pages/practice/NetworkApi'), 'NetworkApi'),
  'fake-auth': lazyNamed(() => import('./pages/practice/FakeAuth'), 'FakeAuth'),
  'tables-filtering': lazyNamed(
    () => import('./pages/practice/TablesFiltering'),
    'TablesFiltering',
  ),
  'browser-events': lazyNamed(() => import('./pages/practice/BrowserEvents'), 'BrowserEvents'),
  'frames-contexts': lazyNamed(() => import('./pages/practice/FramesContexts'), 'FramesContexts'),
  'emulation-input': lazyNamed(() => import('./pages/practice/EmulationInput'), 'EmulationInput'),
  'debugging-reporting': lazyNamed(
    () => import('./pages/practice/DebuggingReporting'),
    'DebuggingReporting',
  ),
  'aria-snapshots': lazyNamed(() => import('./pages/practice/AriaSnapshots'), 'AriaSnapshots'),
  'clock-timers': lazyNamed(() => import('./pages/practice/ClockTimers'), 'ClockTimers'),
  'visual-regression': lazyNamed(
    () => import('./pages/practice/VisualRegression'),
    'VisualRegression',
  ),
  'drag-and-drop': lazyNamed(() => import('./pages/practice/DragAndDrop'), 'DragAndDrop'),
  'multi-tab': lazyNamed(() => import('./pages/practice/MultiTab'), 'MultiTab'),
  'service-workers': lazyNamed(() => import('./pages/practice/ServiceWorkers'), 'ServiceWorkers'),
  'websocket-interception': lazyNamed(
    () => import('./pages/practice/WebSocketInterception'),
    'WebSocketInterception',
  ),
  'api-request-context': lazyNamed(
    () => import('./pages/practice/ApiRequestContext'),
    'ApiRequestContext',
  ),
  'storage-state': lazyNamed(() => import('./pages/practice/StorageState'), 'StorageState'),
  'har-recording': lazyNamed(() => import('./pages/practice/HarRecording'), 'HarRecording'),
  'geolocation-permissions': lazyNamed(
    () => import('./pages/practice/GeolocationPermissions'),
    'GeolocationPermissions',
  ),
  'locator-handlers': lazyNamed(
    () => import('./pages/practice/LocatorHandlers'),
    'LocatorHandlers',
  ),
  'media-locale': lazyNamed(() => import('./pages/practice/MediaLocale'), 'MediaLocale'),
  'scroll-lazy-loading': lazyNamed(
    () => import('./pages/practice/ScrollLazyLoading'),
    'ScrollLazyLoading',
  ),
  'accessibility-scanning': lazyNamed(
    () => import('./pages/practice/AccessibilityScanning'),
    'AccessibilityScanning',
  ),
};

// Extra sub-routes for labs with multi-page flows (not derivable from a single slug)
const extraRoutes: Array<{ path: string; Component: ComponentType }> = [
  {
    path: '/practice/fake-auth/dashboard',
    Component: lazyNamed(() => import('./pages/practice/FakeAuthDashboard'), 'FakeAuthDashboard'),
  },
  {
    path: '/practice/multi-tab/window',
    Component: lazyNamed(() => import('./pages/practice/MultiTabWindow'), 'MultiTabWindow'),
  },
  {
    path: '/practice/multi-tab/popup',
    Component: lazyNamed(() => import('./pages/practice/MultiTabPopup'), 'MultiTabPopup'),
  },
];

// Derive main practice routes from the registry — paths are always /practice/<slug>
const practiceRoutes = [
  ...labs
    .filter((lab) => lab.slug in labComponentMap)
    .map((lab) => ({ path: `/practice/${lab.slug}`, Component: labComponentMap[lab.slug]! })),
  ...extraRoutes,
];

function lazyElement(Component: ComponentType) {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="rounded-lg border border-dashed border-edge bg-surface p-6 text-sm text-muted">
            Loading lab...
          </div>
        }
      >
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        {practiceRoutes.map(({ path, Component }) => (
          <Route key={path} path={path} element={lazyElement(Component)} />
        ))}
        <Route path="/practice/:slug" element={<LabFallback />} />
      </Route>
    </Routes>
  );
}
