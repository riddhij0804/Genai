import React, { useEffect, useState } from "react"; // ADD useState
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileModal from './ProfileModal';

export default function Dashboard() {
  const { user, logout, profileCompleted, getUserProfile, checkProfileCompletion } = useAuth(); 
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false); 
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (user && profileCompleted) {
      loadUserProfile();
    }
  }, [user, profileCompleted]);

  // Add effect to recheck profile completion when modal closes
  useEffect(() => {
    if (user && !showProfileModal) {
      // Small delay to ensure Firebase has updated
      setTimeout(() => {
        checkProfileCompletion(user.uid);
      }, 1000);
    }
  }, [showProfileModal, user, checkProfileCompletion]);

  const loadUserProfile = async () => {
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
  };

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const refreshProfileStatus = async () => {
    if (user) {
      await checkProfileCompletion(user.uid);
      await loadUserProfile();
    }
  };

  const goToCareerRecommendations = () => {
    navigate("/career-recommendations");
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
            <span className="text-gray-700 dark:text-gray-300">{userProfile?.fullName || user?.email}</span>
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

      {!profileCompleted && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-4 m-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Complete Your Profile
              </h3>
              <p className="text-blue-700 dark:text-blue-200">
                Help us provide better career guidance by completing your profile.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refreshProfileStatus}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="p-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Welcome, {userProfile?.fullName || user?.email}!
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            This is your Dashboard. From here, you can access your personalized career insights,
            skill recommendations, and progress tracking.
          </p>

          {/* Placeholder for future dashboard widgets */}
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* NEW: Career Recommendations Card */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 p-4 rounded-lg shadow text-center">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center justify-center">
                <span className="mr-2">🎯</span>
                AI Career Recommendations
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">Get personalized career suggestions based on your profile.</p>

              <button 
                onClick={goToCareerRecommendations}
                className={`mt-3 px-4 py-2 rounded font-medium ${
                  profileCompleted 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!profileCompleted}
              >
                {profileCompleted ? '✨ Get Recommendations' : 'Complete Profile First'}
              </button>
            </div>

            <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-lg shadow text-center">
              <h3 className="font-bold text-gray-800 dark:text-white">Career Roadmap</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">View and track your career plan.</p>

              <button 
                className={`mt-3 px-4 py-2 rounded font-medium ${
                  profileCompleted 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!profileCompleted}
              >
                {profileCompleted ? 'View Roadmap' : 'Complete Profile First'}
              </button>
            </div>
            <div className="bg-green-100 dark:bg-green-800 p-4 rounded-lg shadow text-center">
              <h3 className="font-bold text-gray-800 dark:text-white">Skill Insights</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">Analyze your skills vs market demand.</p>
    
              <button 
                className={`mt-3 px-4 py-2 rounded font-medium ${
                  profileCompleted 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!profileCompleted}
              >
                {profileCompleted ? 'View Insights' : 'Complete Profile First'}
              </button>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-800 p-4 rounded-lg shadow text-center">
              <h3 className="font-bold text-gray-800 dark:text-white">Achievements</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">Track milestones and badges.</p>
 
              <button 
                className={`mt-3 px-4 py-2 rounded font-medium ${
                  profileCompleted 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!profileCompleted}
              >
                {profileCompleted ? 'View Achievements' : 'Complete Profile First'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-purple-100 dark:bg-purple-800 p-4 rounded-lg shadow text-center">
              <h3 className="font-bold text-gray-800 dark:text-white">Profile Settings</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">Update your profile information and preferences.</p>
              <button
                onClick={() => setShowProfileModal(true)}
                className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
              >
                {profileCompleted ? 'Edit Profile' : 'Complete Profile'}
              </button>
            </div>
          </div>
        </div>
      </main>


      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSkip={() => setShowProfileModal(false)}
      />
    </div>
  );
}