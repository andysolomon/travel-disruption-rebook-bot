import { Routes, Route } from "react-router";
import Nav from "./components/Nav.tsx";
import HomePage from "./pages/HomePage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import ClaimsPage from "./pages/ClaimsPage.tsx";
import ClaimDetailPage from "./pages/ClaimDetailPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import { ClaimsProvider } from "./context/ClaimsContext.tsx";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Nav />
      <main id="main-content" className="page-container">
        <ClaimsProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/claims/:claimId" element={<ClaimDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </ClaimsProvider>
      </main>
    </div>
  );
}

export default App;
