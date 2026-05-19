import { lazy, Suspense, type ComponentType } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Shell } from './layouts/Shell';
import { Home } from './pages/Home';
import { LabPage } from './pages/LabPage';

function lazyNamed<TModule extends object, TExport extends keyof TModule & string>(
  load: () => Promise<TModule>,
  exportName: TExport,
) {
  return lazy(async () => ({ default: (await load())[exportName] as ComponentType }));
}

const practiceRoutes = [
  {
    path: '/practice/accessible-locators',
    Component: lazyNamed(() => import('./pages/practice/AccessibleLocators'), 'AccessibleLocators'),
  },
  {
    path: '/practice/forms-validation',
    Component: lazyNamed(() => import('./pages/practice/FormsValidation'), 'FormsValidation'),
  },
  {
    path: '/practice/async-ui',
    Component: lazyNamed(() => import('./pages/practice/AsyncUi'), 'AsyncUi'),
  },
  {
    path: '/practice/network-api',
    Component: lazyNamed(() => import('./pages/practice/NetworkApi'), 'NetworkApi'),
  },
  {
    path: '/practice/fake-auth',
    Component: lazyNamed(() => import('./pages/practice/FakeAuth'), 'FakeAuth'),
  },
  {
    path: '/practice/fake-auth/dashboard',
    Component: lazyNamed(() => import('./pages/practice/FakeAuthDashboard'), 'FakeAuthDashboard'),
  },
  {
    path: '/practice/tables-filtering',
    Component: lazyNamed(() => import('./pages/practice/TablesFiltering'), 'TablesFiltering'),
  },
  {
    path: '/practice/browser-events',
    Component: lazyNamed(() => import('./pages/practice/BrowserEvents'), 'BrowserEvents'),
  },
  {
    path: '/practice/frames-contexts',
    Component: lazyNamed(() => import('./pages/practice/FramesContexts'), 'FramesContexts'),
  },
  {
    path: '/practice/emulation-input',
    Component: lazyNamed(() => import('./pages/practice/EmulationInput'), 'EmulationInput'),
  },
  {
    path: '/practice/debugging-reporting',
    Component: lazyNamed(() => import('./pages/practice/DebuggingReporting'), 'DebuggingReporting'),
  },
  {
    path: '/practice/aria-snapshots',
    Component: lazyNamed(() => import('./pages/practice/AriaSnapshots'), 'AriaSnapshots'),
  },
  {
    path: '/practice/clock-timers',
    Component: lazyNamed(() => import('./pages/practice/ClockTimers'), 'ClockTimers'),
  },
  {
    path: '/practice/visual-regression',
    Component: lazyNamed(() => import('./pages/practice/VisualRegression'), 'VisualRegression'),
  },
  {
    path: '/practice/drag-and-drop',
    Component: lazyNamed(() => import('./pages/practice/DragAndDrop'), 'DragAndDrop'),
  },
  {
    path: '/practice/multi-tab',
    Component: lazyNamed(() => import('./pages/practice/MultiTab'), 'MultiTab'),
  },
  {
    path: '/practice/multi-tab/window',
    Component: lazyNamed(() => import('./pages/practice/MultiTabWindow'), 'MultiTabWindow'),
  },
  {
    path: '/practice/multi-tab/popup',
    Component: lazyNamed(() => import('./pages/practice/MultiTabPopup'), 'MultiTabPopup'),
  },
  {
    path: '/practice/service-workers',
    Component: lazyNamed(() => import('./pages/practice/ServiceWorkers'), 'ServiceWorkers'),
  },
  {
    path: '/practice/websocket-interception',
    Component: lazyNamed(
      () => import('./pages/practice/WebSocketInterception'),
      'WebSocketInterception',
    ),
  },
  {
    path: '/practice/api-request-context',
    Component: lazyNamed(() => import('./pages/practice/ApiRequestContext'), 'ApiRequestContext'),
  },
  {
    path: '/practice/storage-state',
    Component: lazyNamed(() => import('./pages/practice/StorageState'), 'StorageState'),
  },
  {
    path: '/practice/har-recording',
    Component: lazyNamed(() => import('./pages/practice/HarRecording'), 'HarRecording'),
  },
];

function lazyElement(Component: ComponentType) {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">
          Loading lab...
        </div>
      }
    >
      <Component />
    </Suspense>
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
        <Route path="/practice/:slug" element={<LabPage />} />
      </Route>
    </Routes>
  );
}
