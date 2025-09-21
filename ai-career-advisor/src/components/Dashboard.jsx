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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-gray-700 font-medium">{userProfile?.fullName || user?.email}</span>
              <button
                onClick={goHome}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!profileCompleted && (
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-200 p-8 mb-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2 flex items-center">
                  <span className="mr-3">📋</span>
                  Complete Your Profile
                </h3>
                <p className="text-blue-700 text-lg">
                  Help us provide better career guidance by completing your profile.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={refreshProfileStatus}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  ✨ Complete Profile
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-3">🌟</span>
            Welcome, {userProfile?.fullName || user?.email}!
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            This is your personalized dashboard where you can access career insights, 
            skill recommendations, and track your professional growth journey.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* Career Recommendations Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white relative">
              <div className="absolute top-4 right-4">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 pr-16">AI Career Recommendations</h3>
              <p className="text-purple-100">Get personalized career suggestions based on your profile</p>
            </div>
            <div className="p-6">
              <button 
                onClick={goToCareerRecommendations}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  profileCompleted 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!profileCompleted}
              >
                {profileCompleted ? '✨ Get Recommendations' : '📋 Complete Profile First'}
              </button>
            </div>
          </div>

          {/* Career Roadmap Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white relative">
              <div className="absolute top-4 right-4">
                <span className="text-4xl">🗺️</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 pr-16">Career Roadmap</h3>
              <p className="text-blue-100">View and track your personalized career development plan</p>
            </div>
            <div className="p-6">
              <button 
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  profileCompleted 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!profileCompleted}
              >
                {profileCompleted ? '🗺️ View Roadmap' : '📋 Complete Profile First'}
              </button>
            </div>
          </div>

          {/* Skill Insights Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
              <div className="absolute top-4 right-4">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 pr-16">Skill Insights</h3>
              <p className="text-green-100">Analyze your skills versus current market demand</p>
            </div>
            <div className="p-6">
              <button 
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  profileCompleted 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!profileCompleted}
              >
                {profileCompleted ? '📈 View Insights' : '📋 Complete Profile First'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Settings Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <span className="mr-3">⚙️</span>
            Profile Settings
          </h3>
          <p className="text-gray-700 text-lg mb-6">
            Update your profile information and preferences to get better recommendations
          </p>
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            {profileCompleted ? '✏️ Edit Profile' : '📝 Complete Profile'}
          </button>
        </div>
      </div>


      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSkip={() => setShowProfileModal(false)}
      />
    </div>
  );
}