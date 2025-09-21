import React, { useState, useEffect } from 'react';
import ProfileModal from './ProfileModal';
import CareerCards from './CareerCards';

const ProfileToCareerFlow = ({ isOpen, onClose, onSkip }) => {
  const [showProfile, setShowProfile] = useState(true);
  const [showCareers, setShowCareers] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const handleProfileComplete = (data) => {
    console.log('Profile completed with data:', data);
    setProfileData(data);
    setShowProfile(false);
    setShowCareers(true);
  };

  const handleBackToProfile = () => {
    setShowCareers(false);
    setShowProfile(true);
  };

  const handleCloseFlow = () => {
    setShowProfile(true);
    setShowCareers(false);
    setProfileData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          onClose={handleCloseFlow}
          onSkip={onSkip}
          onProfileComplete={handleProfileComplete}
        />
      )}

      {/* Career Cards */}
      {showCareers && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-white z-50 overflow-y-auto">
          {/* Header with Back Button */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Your Career Recommendations</h1>
                <p className="text-gray-600">Based on your complete profile analysis</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBackToProfile}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Edit Profile
                </button>
                <button
                  onClick={handleCloseFlow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>

          {/* Career Cards Component */}
          <CareerCards
            profileData={profileData}
            isVisible={showCareers}
          />
        </div>
      )}
    </>
  );
};

export default ProfileToCareerFlow;
