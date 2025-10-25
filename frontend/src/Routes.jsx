import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import { AuthProvider } from "contexts/AuthContext";
import Header from "components/ui/Header";
import Navigation from "components/ui/Navigation";
import OverviewDashboard from "pages/overview-dashboard";
import AIRecommendationsEngine from "pages/ai-recommendations-engine";
import ScenarioSimulator from "pages/scenario-simulator";
import AlertsAnomaliesMonitor from "pages/alerts-anomalies-monitor";
import ReportsInsights from "pages/reports-insights";
import { Login, Signup } from "pages/auth";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Auth Routes - No Header/Navigation */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Dashboard Routes - With Header/Navigation */}
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-background">
                  <Header />
                  <Navigation />
                  <main className="pt-32 md:pt-28">
                    <RouterRoutes>
                      <Route path="/" element={<OverviewDashboard />} />
                      <Route path="/overview-dashboard" element={<OverviewDashboard />} />
                      <Route path="/ai-recommendations-engine" element={<AIRecommendationsEngine />} />
                      <Route path="/scenario-simulator" element={<ScenarioSimulator />} />
                      <Route path="/alerts-anomalies-monitor" element={<AlertsAnomaliesMonitor />} />
                      <Route path="/reports-insights" element={<ReportsInsights />} />
                      <Route path="*" element={<NotFound />} />
                    </RouterRoutes>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;