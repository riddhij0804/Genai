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
        // Add client-side logging to debug data issues
        console.log("ActionPlanVisualizer - Received data:", {
          hasRoadmap: Boolean(data?.roadmap_json),
          roadmapCount: Array.isArray(data?.roadmap_json) ? data.roadmap_json.length : 0,
          hasReverseMapping: Boolean(data?.reverse_job_mapping),
          hasSkills: Boolean(data?.reverse_job_mapping?.skills),
          skillsCount: Array.isArray(data?.reverse_job_mapping?.skills) ? data.reverse_job_mapping.skills.length : 0,
          hasCourses: Boolean(data?.reverse_job_mapping?.courses),
          coursesCount: Array.isArray(data?.reverse_job_mapping?.courses) ? data.reverse_job_mapping.courses.length : 0,
          hasTools: Boolean(data?.reverse_job_mapping?.tools),
          toolsCount: Array.isArray(data?.reverse_job_mapping?.tools) ? data.reverse_job_mapping.tools.length : 0,
          hasSituationSpecific: Boolean(data?.situation_specific),
          hasFreelancing: Boolean(data?.situation_specific?.freelancing),
          hasTopRecruiters: Boolean(data?.situation_specific?.top_recruiters),
          recruitersCount: Array.isArray(data?.situation_specific?.top_recruiters) ? data.situation_specific.top_recruiters.length : 0
        });
        
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Generating comprehensive action plan...</p>
          <p className="text-sm text-gray-500">This may take a minute or two</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    const isQuotaError = error.includes("API rate limit") || error.includes("quota");
    
    return (
      <div className={`p-6 rounded-lg border ${isQuotaError ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
        <h3 className={`text-lg font-semibold ${isQuotaError ? 'text-amber-700' : 'text-red-700'}`}>
          {isQuotaError ? 'API Quota Limit Reached' : 'Error'}
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
          className={`mt-4 px-4 py-2 text-white rounded-md ${
            isQuotaError ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isQuotaError ? 'Continue with Simplified Plan' : 'Try Again'}
        </button>
      </div>
    );
  }
  
  if (!actionPlan) {
    return (
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-blue-700 text-lg font-semibold">No Action Plan Yet</h3>
        <p className="text-blue-600">Select a career to generate an action plan</p>
      </div>
    );
  }
  
  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Career Action Plan: {careers.join(', ')}
      </h2>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('roadmap')}
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'roadmap' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Career Roadmap
        </button>
        <button 
          onClick={() => setActiveTab('skills')}
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'skills' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Skills & Learning
        </button>
        <button 
          onClick={() => setActiveTab('situation')}
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'situation' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Career Situation
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {/* Roadmap Visualization */}
        {activeTab === 'roadmap' && (
          <>
            <h3 className="text-lg font-semibold mb-4">Career Development Roadmap</h3>
            <div style={{ height: 600 }} className="border border-gray-200 rounded-lg">
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
            <div className="mt-8">
              <h4 className="text-md font-semibold mb-3">Detailed Steps</h4>
              <div className="space-y-4">
                {actionPlan.roadmap_json?.map(step => (
                  <div key={step.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">
                        {step.id}
                      </div>
                      <div>
                        <h5 className="font-semibold text-blue-700">{step.title}</h5>
                        <p className="text-gray-700 mt-1">{step.description}</p>
                        {step.dependencies?.length > 0 && (
                          <div className="mt-2 text-sm text-gray-500">
                            <span className="font-medium">Prerequisites:</span> Steps {step.dependencies.join(', ')}
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
          <div className="space-y-8">
            {console.log('Skills Tab - Data:', {
              hasSkills: Boolean(actionPlan?.reverse_job_mapping?.skills),
              skillsData: actionPlan?.reverse_job_mapping?.skills,
              hasAdditionalSkills: Boolean(actionPlan?.additional_skills_needed),
              additionalSkillsData: actionPlan?.additional_skills_needed,
            })}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Required Skills */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-3">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-800">Required Skills</h3>
                </div>
                
                <div className="space-y-3">
                  {Array.isArray(actionPlan.reverse_job_mapping?.skills) && actionPlan.reverse_job_mapping.skills.length > 0 
                    ? actionPlan.reverse_job_mapping.skills.map((skill, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 flex items-center hover:shadow-md transition-all duration-300">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 font-medium">{skill}</span>
                        </div>
                      ))
                    : <div className="bg-blue-100 text-blue-800 p-4 rounded-xl">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                            <span>Programming & Development</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                            <span>Management & Leadership</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                            <span>Communication Skills</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                            <span>Design Thinking</span>
                          </div>
                        </div>
                      </div>
                  }
                </div>
              </div>
              
              {/* Additional Skills Needed */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-amber-200">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-3">🚀</div>
                  <h3 className="text-2xl font-bold text-gray-800">Skills to Acquire</h3>
                </div>
                
                <div className="space-y-3">
                  {Array.isArray(actionPlan.additional_skills_needed) && actionPlan.additional_skills_needed.length > 0
                    ? actionPlan.additional_skills_needed.map((skill, index) => (
                        <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 flex items-center hover:shadow-md transition-all duration-300">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 font-medium">{skill}</span>
                        </div>
                      ))
                    : (
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 flex items-center">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-3"></div>
                          <span className="text-gray-700 font-medium">Market Research</span>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 flex items-center">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-3"></div>
                          <span className="text-gray-700 font-medium">A/B Testing</span>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 flex items-center">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-3"></div>
                          <span className="text-gray-700 font-medium">Metrics & Analytics</span>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 flex items-center">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-3"></div>
                          <span className="text-gray-700 font-medium">Strategic Planning</span>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 flex items-center">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-3"></div>
                          <span className="text-gray-700 font-medium">Product Marketing</span>
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
            
            {/* Courses and Certifications */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-3">📚</div>
                <h3 className="text-2xl font-bold text-gray-800">Recommended Courses & Certifications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">Course/Certification</th>
                      <th className="py-2 px-4 border-b text-left">Provider</th>
                      <th className="py-2 px-4 border-b text-left">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(actionPlan.reverse_job_mapping?.courses) && actionPlan.reverse_job_mapping.courses.length > 0
                      ? actionPlan.reverse_job_mapping.courses.map((course, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{course.name}</td>
                            <td className="py-2 px-4 border-b">{course.provider || 'Various'}</td>
                            <td className="py-2 px-4 border-b">{course.level || 'All levels'}</td>
                          </tr>
                        ))
                      : (
                        <>
                          <tr className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">Product Management Fundamentals</td>
                            <td className="py-2 px-4 border-b">Product School</td>
                            <td className="py-2 px-4 border-b">Beginner</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">Agile Product Development</td>
                            <td className="py-2 px-4 border-b">Coursera</td>
                            <td className="py-2 px-4 border-b">Intermediate</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">Product Analytics</td>
                            <td className="py-2 px-4 border-b">edX</td>
                            <td className="py-2 px-4 border-b">Advanced</td>
                          </tr>
                        </>
                      )
                    }
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Tools and Software */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Tools & Software</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.isArray(actionPlan.reverse_job_mapping?.tools) && actionPlan.reverse_job_mapping.tools.length > 0
                  ? actionPlan.reverse_job_mapping.tools.map((tool, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md text-center">
                        {tool}
                      </div>
                    ))
                  : (
                    <>
                      <div className="bg-gray-50 p-3 rounded-md text-center">Jira</div>
                      <div className="bg-gray-50 p-3 rounded-md text-center">Asana</div>
                      <div className="bg-gray-50 p-3 rounded-md text-center">Figma</div>
                      <div className="bg-gray-50 p-3 rounded-md text-center">Google Analytics</div>
                      <div className="bg-gray-50 p-3 rounded-md text-center">Tableau</div>
                      <div className="bg-gray-50 p-3 rounded-md text-center">Mixpanel</div>
                      <div className="bg-gray-50 p-3 rounded-md text-center">Slack</div>
                      <div className="bg-gray-50 p-3 rounded-md text-center">Notion</div>
                    </>
                  )
                }
              </div>
            </div>
          </div>
        )}
        
        
        
        {/* Situation Specific */}
        {activeTab === 'situation' && actionPlan.situation_specific && (
          <>
            {console.log('Situation Tab - Data:', {
              hasSituationSpecific: Boolean(actionPlan?.situation_specific),
              hasFreelancing: Boolean(actionPlan?.situation_specific?.freelancing),
              freelancingData: actionPlan?.situation_specific?.freelancing,
              hasTopRecruiters: Boolean(actionPlan?.situation_specific?.top_recruiters),
              recruitersData: actionPlan?.situation_specific?.top_recruiters,
              hasEmergingTrends: Boolean(actionPlan?.situation_specific?.emerging_trends),
              trendsData: actionPlan?.situation_specific?.emerging_trends
            })}
            <h3 className="text-lg font-semibold mb-4">Career Situation Analysis</h3>
            
            {/* Freelancing */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg">
              <h4 className="text-md font-semibold mb-2">Freelancing Opportunities</h4>
              <p className="text-gray-700">{actionPlan.situation_specific.freelancing || "Product Managers have excellent freelancing opportunities. You can offer services as a consultant helping startups define their product strategy, create roadmaps, and establish product development processes."}</p>
              
              {Array.isArray(actionPlan.situation_specific.freelancing_platforms) && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700">Popular Platforms:</h5>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {actionPlan.situation_specific.freelancing_platforms.map((platform, index) => (
                      <span key={index} className="inline-block bg-white px-3 py-1 rounded-full text-sm">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Top Recruiters */}
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2">Top Recruiters</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.isArray(actionPlan.situation_specific.top_recruiters) && actionPlan.situation_specific.top_recruiters.length > 0
                  ? actionPlan.situation_specific.top_recruiters.map((recruiter, index) => (
                      <div key={index} className="border border-gray-200 p-3 rounded-md text-center hover:bg-gray-50">
                        {recruiter}
                      </div>
                    ))
                  : (
                    <>
                      <div className="border border-gray-200 p-3 rounded-md text-center hover:bg-gray-50">Google</div>
                      <div className="border border-gray-200 p-3 rounded-md text-center hover:bg-gray-50">Microsoft</div>
                      <div className="border border-gray-200 p-3 rounded-md text-center hover:bg-gray-50">Amazon</div>
                      <div className="border border-gray-200 p-3 rounded-md text-center hover:bg-gray-50">Facebook</div>
                      <div className="border border-gray-200 p-3 rounded-md text-center hover:bg-gray-50">Apple</div>
                      <div className="border border-gray-200 p-3 rounded-md text-center hover:bg-gray-50">Salesforce</div>
                      <div className="border border-gray-200 p-3 rounded-md text-center hover:bg-gray-50">Adobe</div>
                      <div className="border border-gray-200 p-3 rounded-md text-center hover:bg-gray-50">Spotify</div>
                    </>
                  )
                }
              </div>
            </div>
            
            {/* Government Initiatives */}
            {actionPlan.situation_specific.government_initiatives && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold mb-2">Government Initiatives</h4>
                <ul className="list-disc pl-5">
                  {Array.isArray(actionPlan.situation_specific.government_initiatives) && actionPlan.situation_specific.government_initiatives.length > 0
                    ? actionPlan.situation_specific.government_initiatives.map((initiative, index) => (
                        <li key={index} className="text-gray-700 mb-1">{initiative}</li>
                      ))
                    : actionPlan.situation_specific.government_initiatives 
                      ? <li className="text-gray-700">{actionPlan.situation_specific.government_initiatives}</li>
                      : (
                        <>
                          <li className="text-gray-700 mb-1">Digital India Initiative - Supporting tech entrepreneurship</li>
                          <li className="text-gray-700 mb-1">Startup India - Funding and mentorship for tech startups</li>
                          <li className="text-gray-700 mb-1">National Skill Development Corporation - Tech management training</li>
                        </>
                      )
                  }
                </ul>
              </div>
            )}
            
            {/* Emerging Trends */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="text-md font-semibold mb-2">Emerging Trends in {careers[0]}</h4>
              <ul className="list-disc pl-5">
                {Array.isArray(actionPlan.situation_specific.emerging_trends) && actionPlan.situation_specific.emerging_trends.length > 0
                  ? actionPlan.situation_specific.emerging_trends.map((trend, index) => (
                      <li key={index} className="text-gray-700 mb-1">{trend}</li>
                    ))
                  : actionPlan.situation_specific.emerging_trends
                    ? <li className="text-gray-700">{actionPlan.situation_specific.emerging_trends}</li>
                    : (
                      <>
                        <li className="text-gray-700 mb-1">AI-driven product development and personalization</li>
                        <li className="text-gray-700 mb-1">Remote-first product management methodologies</li>
                        <li className="text-gray-700 mb-1">No-code/low-code product customization</li>
                        <li className="text-gray-700 mb-1">Data privacy-focused product design</li>
                        <li className="text-gray-700 mb-1">Sustainability metrics in product development</li>
                      </>
                    )
                }
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionPlanVisualizer;