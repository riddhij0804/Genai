import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

const ActionPlanVisualizer = ({ careers, skills }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionPlan, setActionPlan] = useState(null);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [activeTab, setActiveTab] = useState('roadmap');
  
  // Convert roadmap data to React Flow nodes and edges
  const convertRoadmapToFlow = useCallback((roadmapData) => {
    if (!roadmapData) return { nodes: [], edges: [] };
    
    const nodes = roadmapData.map((step) => ({
      id: step.id.toString(),
      type: 'default',
      data: { 
        label: (
          <div className="p-2">
            <div className="font-bold">{step.title}</div>
            <div className="text-xs">{step.description.substring(0, 80)}...</div>
          </div>
        )
      },
      position: { x: (step.id % 3) * 300, y: Math.floor(step.id / 3) * 150 }
    }));
    
    // Create edges based on dependencies
    const edges = [];
    roadmapData.forEach(step => {
      if (step.dependencies && step.dependencies.length) {
        step.dependencies.forEach(depId => {
          edges.push({
            id: `e${depId}-${step.id}`,
            source: depId.toString(),
            target: step.id.toString(),
            type: 'smoothstep',
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        });
      }
    });
    
    return { nodes, edges };
  }, []);
  
  // Fetch action plan data when careers change
  const fetchActionPlan = useCallback(async () => {
    if (!careers || careers.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careers, skills })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429 || data.limitExceeded) {
          // This is a quota limit error, but we'll show the fallback data
          setActionPlan(data);
          // If there's roadmap data in the fallback, process it
          if (data.roadmap_json) {
            const flowData = convertRoadmapToFlow(data.roadmap_json);
            setNodes(flowData.nodes);
            setEdges(flowData.edges);
          }
          // Show a warning but don't block the UI completely
          console.warn("Using simplified action plan due to API limits");
        } else {
          throw new Error(data.error || 'Failed to fetch action plan');
        }
      } else {
        setActionPlan(data);
        
        // Process roadmap data
        if (data.roadmap_json) {
          const flowData = convertRoadmapToFlow(data.roadmap_json);
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
        }
        
        // Show a notice if we're using a fallback plan
        if (data.limitExceeded) {
          console.warn("Using simplified action plan due to API limits");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [careers, skills, convertRoadmapToFlow, setNodes, setEdges]);
  
  useEffect(() => {
    fetchActionPlan();
  }, [fetchActionPlan]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">🤖 Generating comprehensive action plan...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a minute or two</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    const isQuotaError = error.includes("API rate limit") || error.includes("quota");
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className={`bg-white p-8 rounded-2xl shadow-lg border ${isQuotaError ? 'border-amber-200' : 'border-red-200'}`}>
            <h3 className={`text-lg font-semibold ${isQuotaError ? 'text-amber-700' : 'text-red-700'}`}>
              {isQuotaError ? '⚠️ API Quota Limit Reached' : '❌ Error'}
            </h3>
            
            {isQuotaError ? (
              <div>
                <p className="text-amber-600 mb-2">
                  The AI service has reached its request limit. We'll provide a simplified career plan instead.
                </p>
                <p className="text-sm text-gray-600">
                  The Gemini API has usage limits that have been exceeded. The system will provide basic guidance, 
                  but for detailed AI-generated career plans, please try again later.
                </p>
              </div>
            ) : (
              <p className="text-red-600">{error}</p>
            )}
            
            <button 
              onClick={fetchActionPlan} 
              className={`mt-4 px-6 py-3 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                isQuotaError ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              }`}
            >
              {isQuotaError ? 'Continue with Simplified Plan' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!actionPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-200 text-center">
            <h3 className="text-blue-700 text-xl font-bold mb-4">🎯 No Action Plan Yet</h3>
            <p className="text-blue-600">Select a career to generate a personalized action plan</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Title is now handled by parent component */}
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            <button 
              onClick={() => setActiveTab('roadmap')}
              className={`py-3 px-6 text-sm font-semibold rounded-t-lg transition-all duration-300 ${
                activeTab === 'roadmap' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform -translate-y-1' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              🗺️ Career Roadmap
            </button>
            <button 
              onClick={() => setActiveTab('skills')}
              className={`py-3 px-6 text-sm font-semibold rounded-t-lg transition-all duration-300 ${
                activeTab === 'skills' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform -translate-y-1' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              🎯 Skills & Learning
            </button>
            <button 
              onClick={() => setActiveTab('situation')}
              className={`py-3 px-6 text-sm font-semibold rounded-t-lg transition-all duration-300 ${
                activeTab === 'situation' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform -translate-y-1' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              📊 Career Situation
            </button>
          </div>      {/* Tab Content */}
      <div className="mt-6">
        {/* Roadmap Visualization */}
        {activeTab === 'roadmap' && (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🗺️ Career Development Roadmap</h3>
            <div style={{ height: 600 }} className="border-2 border-gray-200 rounded-2xl shadow-lg bg-gradient-to-br from-gray-50 to-white">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
              >
                <Controls />
                <Background color="#f8f8f8" gap={16} />
              </ReactFlow>
            </div>
            
            {/* Detailed Roadmap Steps */}
            <div className="mt-12">
              <h4 className="text-xl font-bold mb-6 text-gray-800 text-center">📋 Detailed Action Steps</h4>
              <div className="grid gap-6">
                {actionPlan.roadmap_json?.map(step => (
                  <div key={step.id} className="bg-white p-6 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center mr-4 font-bold shadow-lg">
                        {step.id}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-lg text-gray-800 mb-2">{step.title}</h5>
                        <p className="text-gray-700 leading-relaxed">{step.description}</p>
                        {step.dependencies?.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <span className="font-semibold text-blue-700">📋 Prerequisites:</span> 
                            <span className="text-blue-600 ml-2">Steps {step.dependencies.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        

        
        {/* Skills and Learning */}
        {activeTab === 'skills' && (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🎯 Skills & Learning Path</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Required Skills */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                  <span className="mr-3">✅</span>
                  Required Skills
                </h3>
                
                {actionPlan.reverse_job_mapping?.skills?.map((skill, index) => (
                  <div key={index} className="mb-3 flex items-center bg-blue-50 p-3 rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3"></div>
                    <span className="font-medium text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
              
              {/* Additional Skills Needed */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                  <span className="mr-3">🚀</span>
                  Skills to Acquire
                </h3>
                
                {actionPlan.additional_skills_needed?.map((skill, index) => (
                  <div key={index} className="mb-3 flex items-center bg-white p-3 rounded-lg shadow-sm">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 mr-3"></div>
                    <span className="font-medium text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Courses and Certifications */}
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6 text-gray-800 text-center">📚 Recommended Courses & Certifications</h3>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <th className="py-4 px-6 text-left font-bold">📖 Course/Certification</th>
                        <th className="py-4 px-6 text-left font-bold">🏢 Provider</th>
                        <th className="py-4 px-6 text-left font-bold">📊 Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionPlan.reverse_job_mapping?.courses?.map((course, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100">
                          <td className="py-4 px-6 font-medium text-gray-800">{course.name}</td>
                          <td className="py-4 px-6 text-gray-600">{course.provider || 'Various'}</td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {course.level || 'All levels'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Tools and Software */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-gray-800 text-center">🛠️ Tools & Software</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actionPlan.reverse_job_mapping?.tools?.map((tool, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200">
                    <span className="font-semibold text-gray-700">{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Situation Specific */}
        {activeTab === 'situation' && actionPlan.situation_specific && (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Career Situation Analysis</h3>
            {/* Freelancing */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl shadow-lg border border-blue-200">
              <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <span className="mr-3">💼</span>
                Freelancing Opportunities
              </h4>
              <p className="text-gray-700 leading-relaxed text-lg">{actionPlan.situation_specific.freelancing}</p>
              
              {Array.isArray(actionPlan.situation_specific.freelancing_platforms) && (
                <div className="mt-6">
                  <h5 className="text-lg font-semibold text-gray-800 mb-3">🌐 Popular Platforms:</h5>
                  <div className="flex flex-wrap gap-3">
                    {actionPlan.situation_specific.freelancing_platforms.map((platform, index) => (
                      <span key={index} className="inline-block bg-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>            {/* Top Recruiters */}
            <div className="mb-8">
              <h4 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="mr-3">🏢</span>
                Top Recruiters
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {actionPlan.situation_specific.top_recruiters?.map((recruiter, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 p-4 rounded-xl text-center hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <span className="font-semibold text-gray-700">{recruiter}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Government Initiatives */}
            {actionPlan.situation_specific.government_initiatives && (
              <div className="mb-8 bg-green-50 p-8 rounded-2xl shadow-lg border border-green-200">
                <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <span className="mr-3">🏛️</span>
                  Government Initiatives
                </h4>
                <ul className="list-none space-y-3">
                  {Array.isArray(actionPlan.situation_specific.government_initiatives) 
                    ? actionPlan.situation_specific.government_initiatives.map((initiative, index) => (
                        <li key={index} className="bg-white p-4 rounded-lg shadow-sm flex items-start">
                          <span className="text-green-600 mr-3 mt-1">✅</span>
                          <span className="text-gray-700 font-medium">{initiative}</span>
                        </li>
                      ))
                    : <li className="bg-white p-4 rounded-lg shadow-sm flex items-start">
                        <span className="text-green-600 mr-3 mt-1">✅</span>
                        <span className="text-gray-700 font-medium">{actionPlan.situation_specific.government_initiatives}</span>
                      </li>
                  }
                </ul>
              </div>
            )}
            
            {/* Emerging Trends */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl shadow-lg border border-amber-200">
              <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <span className="mr-3">🚀</span>
                Emerging Trends in {careers[0]}
              </h4>
              <ul className="list-none space-y-3">
                {Array.isArray(actionPlan.situation_specific.emerging_trends) 
                  ? actionPlan.situation_specific.emerging_trends.map((trend, index) => (
                      <li key={index} className="bg-white p-4 rounded-lg shadow-sm flex items-start">
                        <span className="text-amber-600 mr-3 mt-1">⭐</span>
                        <span className="text-gray-700 font-medium">{trend}</span>
                      </li>
                    ))
                  : <li className="bg-white p-4 rounded-lg shadow-sm flex items-start">
                      <span className="text-amber-600 mr-3 mt-1">⭐</span>
                      <span className="text-gray-700 font-medium">{actionPlan.situation_specific.emerging_trends}</span>
                    </li>
                }
              </ul>
            </div>
          </>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPlanVisualizer;