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
    
    const calculatePosition = (id, total) => {
      if (total <= 5) {
        return { x: (id - 1) * 400, y: 100 };
      } 
      const perRow = Math.min(3, Math.ceil(Math.sqrt(total)));
      const xPos = ((id - 1) % perRow) * 400;
      const yPos = Math.floor((id - 1) / perRow) * 220;
      return { x: xPos, y: yPos };
    };
    
    const nodes = roadmapData.map((step) => ({
      id: step.id.toString(),
      type: 'default',
      data: { 
        label: (
          <div className="p-3">
            <div className="font-bold text-blue-700">{step.title}</div>
            <div className="text-sm mt-1">{step.description.substring(0, 100)}...</div>
          </div>
        )
      },
      position: calculatePosition(step.id, roadmapData.length),
      style: { 
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        width: 300,
        padding: 5
      }
    }));
    
    const edges = [];
    roadmapData.forEach(step => {
      if (step.dependencies && step.dependencies.length) {
        step.dependencies.forEach(depId => {
          edges.push({
            id: `e${depId}-${step.id}`,
            source: depId.toString(),
            target: step.id.toString(),
            type: 'smoothstep',
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            animated: true,
            label: 'depends on',
            labelStyle: { fill: '#6b7280', fontSize: 10, fontFamily: 'Arial', fontWeight: 500 },
            labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        });
      }
    });
    
    return { nodes, edges };
  }, []);
  
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
          setActionPlan(data);
          if (data.roadmap_json) {
            const flowData = convertRoadmapToFlow(data.roadmap_json);
            setNodes(flowData.nodes);
            setEdges(flowData.edges);
          }
          console.warn("Using simplified action plan due to API limits");
        } else {
          throw new Error(data.error || 'Failed to fetch action plan');
        }
      } else {
        setActionPlan(data);
        if (data.roadmap_json) {
          const flowData = convertRoadmapToFlow(data.roadmap_json);
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
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
  
  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-700">Generating comprehensive action plan...</p>
        <p className="text-sm text-gray-500">This may take a minute or two</p>
      </div>
    </div>
  );
  
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
              The Gemini API has usage limits that have been exceeded. The system will provide basic guidance.
            </p>
          </div>
        ) : (
          <p className="text-red-600">{error}</p>
        )}
        <button 
          onClick={fetchActionPlan} 
          className={`mt-4 px-4 py-2 text-white rounded-md ${isQuotaError ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {isQuotaError ? 'Continue with Simplified Plan' : 'Try Again'}
        </button>
      </div>
    );
  }
  
  if (!actionPlan) return (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
      <h3 className="text-blue-700 text-lg font-semibold">No Action Plan Yet</h3>
      <p className="text-blue-600">Select a career to generate an action plan</p>
    </div>
  );
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Career Action Plan: {careers.join(', ')}
      </h2>
      
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
      
      <div className="mt-6">
        {activeTab === 'roadmap' && (
          <>
            <h3 className="text-lg font-semibold mb-4">Career Development Roadmap</h3>
            <div style={{ height: 600 }} className="border border-gray-200 rounded-lg">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                fitViewOptions={{ padding: 40 }}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                nodesDraggable
                elementsSelectable
                minZoom={0.5}
                maxZoom={1.5}
              >
                <Controls />
                <Background color="#f8f8f8" gap={16} variant="dots" />
              </ReactFlow>
            </div>
          </>
        )}

        {activeTab === 'skills' && (
          <>
            {/* Skills tab content... (copy your existing JSX for skills & learning) */}
          </>
        )}

        {activeTab === 'situation' && actionPlan.situation_specific && (
          <>
            {/* Situation-specific tab content... (copy your existing JSX for situation analysis) */}
          </>
        )}
      </div>
    </div>
  );
};

export default ActionPlanVisualizer;
