import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CareerRecommendationPage = () => {
  const navigate = useNavigate();
  const { user, getUserProfile } = useAuth();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Load user profile when component mounts
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile(user.uid);
      setProfileData(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    }
  };

  const generateCareerRecommendations = async () => {
    if (!profileData) {
      setError('Please complete your profile first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/analyze-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileData }),
      });

      const data = await response.json();

      if (response.ok) {
        setCareers(data.careers || []);
      } else {
        setError(data.error || 'Failed to generate recommendations');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Career generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate recommendations when profile loads
  useEffect(() => {
    if (profileData && careers.length === 0) {
      generateCareerRecommendations();
    }
  }, [profileData]);

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Profile First</h2>
          <p className="text-gray-600 mb-6">We need your profile information to generate personalized career recommendations.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Your Personalized Career Recommendations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Based on your comprehensive profile analysis, here are 5 exciting career paths tailored just for you!
          </p>
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm inline-block">
            <p className="text-sm text-gray-500">
              Profile for: <span className="font-semibold text-gray-700">{profileData.fullName}</span> • 
              Stage: <span className="font-semibold text-blue-600">{profileData.stage}</span>
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">🤖 AI is analyzing your profile...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold mb-2">⚠️ Error</p>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={generateCareerRecommendations}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Career Cards Grid */}
        {careers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {careers.map((career, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative">
                    <div className="absolute top-4 right-4">
                      <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                        #{index + 1}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 pr-16">{career.title}</h3>
                    
                    {/* Match Percentage */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${career.matchPercentage || 85}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">
                        {career.matchPercentage || 85}% Match
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Description */}
                    <p className="text-gray-700 leading-relaxed">
                      {career.description}
                    </p>

                    {/* User's Profile Skills */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <span className="mr-2">🎯</span>
                        Mapped from Your Profile
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(career.relevantSkillsFromProfile || ['Your Interests', 'Your Strengths', 'Your Goals']).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Growth Potential */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <span className="mr-2">📈</span>
                        Growth Potential
                      </h4>
                      <p className="text-blue-700 font-semibold">
                        {career.growthPotential || "High growth potential with excellent career progression opportunities"}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6">
                    <button 
                      onClick={() => {
                        // Navigate to action plan page with selected career and skills
                        navigate('/action-plan', {
                          state: {
                            careers: [career.title],
                            skills: profileData.stage === 'School' 
                              ? profileData.favoriteSubjects || [] 
                              : profileData.stage === 'College' 
                                ? profileData.currentSkills || [] 
                                : profileData.coreSkills || []
                          }
                        });
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    >
                      📋 Generate Action Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Generate New Recommendations Button */}
            <div className="text-center">
              <button
                onClick={generateCareerRecommendations}
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white'
                }`}
              >
                {loading ? 'Generating...' : '🔄 Generate New Recommendations'}
              </button>
            </div>
          </>
        )}

        {/* No Careers Message */}
        {!loading && !error && careers.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Ready to Discover Your Perfect Career?</h3>
              <p className="text-gray-600 mb-6">Click below to generate personalized career recommendations based on your profile.</p>
              <button
                onClick={generateCareerRecommendations}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                ✨ Generate Career Recommendations
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default CareerRecommendationPage;
