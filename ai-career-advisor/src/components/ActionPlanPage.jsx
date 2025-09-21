import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ActionPlanVisualizer from './ActionPlanVisualizer';

const ActionPlanPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get careers and skills from location state
    if (location.state?.careers && location.state?.skills) {
      setCareers(location.state.careers);
      setSkills(location.state.skills);
      setLoading(false);
    } else {
      // If no data is passed, redirect back to career recommendation page
      navigate('/career-recommendations');
    }
  }, [location.state, navigate]);

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBackClick}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Career Action Plan</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading your personalized action plan...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Action Plan for {careers.join(', ')}
              </h2>
              <p className="text-gray-600 mt-2">
                Below is a personalized action plan based on your selected career path and skills.
              </p>
              <p className="text-sm text-blue-600 mt-1">
                <span className="font-medium">Skills analyzed:</span> {skills.join(', ')}
              </p>
            </div>

            <div className="mt-6">
              <ActionPlanVisualizer careers={careers} skills={skills} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionPlanPage;