import React, { useState } from 'react';
import axios from 'axios';

/**
 * Component for recommending careers based on user skills
 */
const CareerRecomender = () => {
  const [skills, setSkills] = useState('');
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input change
  const handleSkillsChange = (e) => {
    setSkills(e.target.value);
  };

  // Submit skills to get career recommendations
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!skills.trim()) {
      setError('Please enter some skills');
      return;
    }
    
    const skillsArray = skills.split(',').map(skill => skill.trim());
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/recommend', {
        skills: skillsArray
      });
      
      setCareers(response.data.careers);
    } catch (error) {
      console.error('Error fetching career recommendations:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Find Career Recommendations</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="skills" className="block text-gray-700 mb-2">
            Enter your skills (separated by commas)
          </label>
          <textarea
            id="skills"
            value={skills}
            onChange={handleSkillsChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="e.g., programming, design, communication, leadership"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </form>
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      
      {careers.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Recommended Careers</h3>
          <div className="space-y-4">
            {careers.map((career, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md hover:bg-gray-50">
                <h4 className="font-bold text-lg text-blue-700">{career.title}</h4>
                <p className="text-gray-700">{career.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRecomender;
