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
        {/* Coming-soon catch-all */}
        <Route path="/practice/:slug" element={<LabPage />} />
      </Route>
    </Routes>
  );
}

