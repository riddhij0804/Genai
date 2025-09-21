import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext'; 
import Login from "./components/Login";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import CareerRecommendationPage from "./components/CareerRecommendationPage";
import OnboardingFlow from './components/OnboardingFlow'; 
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css';

export default function App() {
  return (
    <AuthProvider> {/* ADD THIS WRAPPER */}
      <Router>
        <OnboardingFlow> {/* ADD THIS WRAPPER */}
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Home is protected, accessible after login */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Dashboard is also protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Career Recommendations Page */}
            <Route
              path="/career-recommendations"
              element={
                <ProtectedRoute>
                  <CareerRecommendationPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          </Routes>
        </OnboardingFlow> 
      </Router>
    </AuthProvider> 
  );
}