import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const goHome = () => {
    navigate("/"); // Navigate to Home page (Job Market Pulse)
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Career Advisor Dashboard</h1>
        <div className="flex gap-4 items-center">
            <span className="text-gray-700 dark:text-gray-300">{user?.email}</span>
          <button
            onClick={goHome}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Home
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Welcome, {user?.email}!
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            This is your Dashboard. From here, you can access your personalized career insights,
            skill recommendations, and progress tracking.
          </p>

          {/* Placeholder for future dashboard widgets */}
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-lg shadow text-center">
              <h3 className="font-bold text-gray-800 dark:text-white">Career Roadmap</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">View and track your career plan.</p>
            </div>
            <div className="bg-green-100 dark:bg-green-800 p-4 rounded-lg shadow text-center">
              <h3 className="font-bold text-gray-800 dark:text-white">Skill Insights</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">Analyze your skills vs market demand.</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-800 p-4 rounded-lg shadow text-center">
              <h3 className="font-bold text-gray-800 dark:text-white">Achievements</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">Track milestones and badges.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
