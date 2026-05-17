import { lazy, Suspense, type ComponentType } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Shell } from './layouts/Shell';
import { Home } from './pages/Home';
import { LabPage } from './pages/LabPage';

const AccessibleLocators = lazy(() =>
  import('./pages/practice/AccessibleLocators').then((module) => ({
    default: module.AccessibleLocators,
  })),
);
const FormsValidation = lazy(() =>
  import('./pages/practice/FormsValidation').then((module) => ({ default: module.FormsValidation })),
);
const AsyncUi = lazy(() =>
  import('./pages/practice/AsyncUi').then((module) => ({ default: module.AsyncUi })),
);
const NetworkApi = lazy(() =>
  import('./pages/practice/NetworkApi').then((module) => ({ default: module.NetworkApi })),
);
const FakeAuth = lazy(() =>
  import('./pages/practice/FakeAuth').then((module) => ({ default: module.FakeAuth })),
);
const FakeAuthDashboard = lazy(() =>
  import('./pages/practice/FakeAuthDashboard').then((module) => ({
    default: module.FakeAuthDashboard,
  })),
);
const TablesFiltering = lazy(() =>
  import('./pages/practice/TablesFiltering').then((module) => ({ default: module.TablesFiltering })),
);
const BrowserEvents = lazy(() =>
  import('./pages/practice/BrowserEvents').then((module) => ({ default: module.BrowserEvents })),
);
const FramesContexts = lazy(() =>
  import('./pages/practice/FramesContexts').then((module) => ({ default: module.FramesContexts })),
);
const EmulationInput = lazy(() =>
  import('./pages/practice/EmulationInput').then((module) => ({ default: module.EmulationInput })),
);
const DebuggingReporting = lazy(() =>
  import('./pages/practice/DebuggingReporting').then((module) => ({
    default: module.DebuggingReporting,
  })),
);
const AriaSnapshots = lazy(() =>
  import('./pages/practice/AriaSnapshots').then((module) => ({ default: module.AriaSnapshots })),
);
const ClockTimers = lazy(() =>
  import('./pages/practice/ClockTimers').then((module) => ({ default: module.ClockTimers })),
);
const VisualRegression = lazy(() =>
  import('./pages/practice/VisualRegression').then((module) => ({
    default: module.VisualRegression,
  })),
);
const DragAndDrop = lazy(() =>
  import('./pages/practice/DragAndDrop').then((module) => ({ default: module.DragAndDrop })),
);
const MultiTab = lazy(() =>
  import('./pages/practice/MultiTab').then((module) => ({ default: module.MultiTab })),
);
const MultiTabWindow = lazy(() =>
  import('./pages/practice/MultiTabWindow').then((module) => ({ default: module.MultiTabWindow })),
);
const MultiTabPopup = lazy(() =>
  import('./pages/practice/MultiTabPopup').then((module) => ({ default: module.MultiTabPopup })),
);
const ServiceWorkers = lazy(() =>
  import('./pages/practice/ServiceWorkers').then((module) => ({ default: module.ServiceWorkers })),
);
const WebSocketInterception = lazy(() =>
  import('./pages/practice/WebSocketInterception').then((module) => ({
    default: module.WebSocketInterception,
  })),
);
const ApiRequestContext = lazy(() =>
  import('./pages/practice/ApiRequestContext').then((module) => ({
    default: module.ApiRequestContext,
  })),
);
const StorageState = lazy(() =>
  import('./pages/practice/StorageState').then((module) => ({ default: module.StorageState })),
);
const HarRecording = lazy(() =>
  import('./pages/practice/HarRecording').then((module) => ({ default: module.HarRecording })),
);

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
        {/* Ready labs */}
        <Route path="/practice/accessible-locators" element={lazyElement(AccessibleLocators)} />
        <Route path="/practice/forms-validation" element={lazyElement(FormsValidation)} />
        <Route path="/practice/async-ui" element={lazyElement(AsyncUi)} />
        <Route path="/practice/network-api" element={lazyElement(NetworkApi)} />
        <Route path="/practice/fake-auth" element={lazyElement(FakeAuth)} />
        <Route path="/practice/fake-auth/dashboard" element={lazyElement(FakeAuthDashboard)} />
        {/* Newly implemented labs */}
        <Route path="/practice/tables-filtering" element={lazyElement(TablesFiltering)} />
        <Route path="/practice/browser-events" element={lazyElement(BrowserEvents)} />
        <Route path="/practice/frames-contexts" element={lazyElement(FramesContexts)} />
        <Route path="/practice/emulation-input" element={lazyElement(EmulationInput)} />
        <Route path="/practice/debugging-reporting" element={lazyElement(DebuggingReporting)} />
        <Route path="/practice/aria-snapshots" element={lazyElement(AriaSnapshots)} />
        <Route path="/practice/clock-timers" element={lazyElement(ClockTimers)} />
        <Route path="/practice/visual-regression" element={lazyElement(VisualRegression)} />
        <Route path="/practice/drag-and-drop" element={lazyElement(DragAndDrop)} />
        <Route path="/practice/multi-tab" element={lazyElement(MultiTab)} />
        <Route path="/practice/multi-tab/window" element={lazyElement(MultiTabWindow)} />
        <Route path="/practice/multi-tab/popup" element={lazyElement(MultiTabPopup)} />
        <Route path="/practice/service-workers" element={lazyElement(ServiceWorkers)} />
        <Route path="/practice/websocket-interception" element={lazyElement(WebSocketInterception)} />
        <Route path="/practice/api-request-context" element={lazyElement(ApiRequestContext)} />
        <Route path="/practice/storage-state" element={lazyElement(StorageState)} />
        <Route path="/practice/har-recording" element={lazyElement(HarRecording)} />
        {/* Coming-soon catch-all */}
        <Route path="/practice/:slug" element={<LabPage />} />
      </Route>
    </Routes>
  );
}
