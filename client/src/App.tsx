import { Routes, Route } from 'react-router-dom';
import { Shell } from './layouts/Shell';
import { Home } from './pages/Home';
import { LabPage } from './pages/LabPage';
import { AccessibleLocators } from './pages/practice/AccessibleLocators';
import { FormsValidation } from './pages/practice/FormsValidation';
import { AsyncUi } from './pages/practice/AsyncUi';
import { NetworkApi } from './pages/practice/NetworkApi';
import { FakeAuth } from './pages/practice/FakeAuth';
import { FakeAuthDashboard } from './pages/practice/FakeAuthDashboard';
import { TablesFiltering } from './pages/practice/TablesFiltering';
import { BrowserEvents } from './pages/practice/BrowserEvents';
import { FramesContexts } from './pages/practice/FramesContexts';
import { EmulationInput } from './pages/practice/EmulationInput';
import { DebuggingReporting } from './pages/practice/DebuggingReporting';
import { AriaSnapshots } from './pages/practice/AriaSnapshots';
import { ClockTimers } from './pages/practice/ClockTimers';
import { VisualRegression } from './pages/practice/VisualRegression';
import { DragAndDrop } from './pages/practice/DragAndDrop';
import { MultiTab } from './pages/practice/MultiTab';
import { MultiTabWindow } from './pages/practice/MultiTabWindow';
import { MultiTabPopup } from './pages/practice/MultiTabPopup';
import { ServiceWorkers } from './pages/practice/ServiceWorkers';
import { WebSocketInterception } from './pages/practice/WebSocketInterception';
import { ApiRequestContext } from './pages/practice/ApiRequestContext';
import { StorageState } from './pages/practice/StorageState';
import { HarRecording } from './pages/practice/HarRecording';

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        {/* Ready labs */}
        <Route path="/practice/accessible-locators" element={<AccessibleLocators />} />
        <Route path="/practice/forms-validation" element={<FormsValidation />} />
        <Route path="/practice/async-ui" element={<AsyncUi />} />
        <Route path="/practice/network-api" element={<NetworkApi />} />
        <Route path="/practice/fake-auth" element={<FakeAuth />} />
        <Route path="/practice/fake-auth/dashboard" element={<FakeAuthDashboard />} />
        {/* Newly implemented labs */}
        <Route path="/practice/tables-filtering" element={<TablesFiltering />} />
        <Route path="/practice/browser-events" element={<BrowserEvents />} />
        <Route path="/practice/frames-contexts" element={<FramesContexts />} />
        <Route path="/practice/emulation-input" element={<EmulationInput />} />
        <Route path="/practice/debugging-reporting" element={<DebuggingReporting />} />
        <Route path="/practice/aria-snapshots" element={<AriaSnapshots />} />
        <Route path="/practice/clock-timers" element={<ClockTimers />} />
        <Route path="/practice/visual-regression" element={<VisualRegression />} />
        <Route path="/practice/drag-and-drop" element={<DragAndDrop />} />
        <Route path="/practice/multi-tab" element={<MultiTab />} />
        <Route path="/practice/multi-tab/window" element={<MultiTabWindow />} />
        <Route path="/practice/multi-tab/popup" element={<MultiTabPopup />} />
        <Route path="/practice/service-workers" element={<ServiceWorkers />} />
        <Route path="/practice/websocket-interception" element={<WebSocketInterception />} />
        <Route path="/practice/api-request-context" element={<ApiRequestContext />} />
        <Route path="/practice/storage-state" element={<StorageState />} />
        <Route path="/practice/har-recording" element={<HarRecording />} />
        {/* Coming-soon catch-all */}
        <Route path="/practice/:slug" element={<LabPage />} />
      </Route>
    </Routes>
  );
}
