import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Comprehensive Indian Tech Job Market Data
const techMarketStats = {
  totalJobs: "4.2M+",
  growth: "23%",
  avgSalary: "₹8.5L",
  topCities: ["Bangalore", "Hyderabad", "Pune", "Chennai", "Mumbai"]
};

const topInDemandRoles = [
  { role: "AI/ML Engineer", demand: "High", growth: "+35%", salary: "₹12-45L", companies: 2800 },
  { role: "Full Stack Developer", demand: "Very High", growth: "+28%", salary: "₹6-25L", companies: 5200 },
  { role: "Data Scientist", demand: "High", growth: "+32%", salary: "₹8-30L", companies: 3100 },
  { role: "DevOps Engineer", demand: "High", growth: "+40%", salary: "₹10-35L", companies: 2600 },
  { role: "Cybersecurity Specialist", demand: "Very High", growth: "+45%", salary: "₹9-40L", companies: 1900 },
  { role: "Cloud Architect", demand: "High", growth: "+38%", salary: "₹15-50L", companies: 1400 }
];

const emergingTechnologies = [
  { tech: "Generative AI", jobs: "15,000+", growth: "+150%", description: "ChatGPT, LLMs, AI Content" },
  { tech: "Web3 & Blockchain", jobs: "8,500+", growth: "+85%", description: "DeFi, NFTs, Smart Contracts" },
  { tech: "Quantum Computing", jobs: "1,200+", growth: "+200%", description: "IBM Quantum, Google Quantum" },
  { tech: "Edge Computing", jobs: "12,000+", growth: "+120%", description: "IoT, 5G, Real-time Processing" },
  { tech: "AR/VR/Metaverse", jobs: "9,800+", growth: "+90%", description: "Unity, Unreal, Spatial Computing" },
  { tech: "Low Code/No Code", jobs: "18,000+", growth: "+75%", description: "Automation, Citizen Development" }
];

const topTechHubs = [
  { 
    city: "Bangalore", 
    companies: "3,000+", 
    jobs: "850K+", 
    avgSalary: "₹12.5L",
    highlights: ["Silicon Valley of India", "Startup Capital", "R&D Centers"]
  },
  { 
    city: "Hyderabad", 
    companies: "1,800+", 
    jobs: "520K+", 
    avgSalary: "₹10.2L",
    highlights: ["HITEC City", "Google Campus", "Microsoft Hub"]
  },
  { 
    city: "Pune", 
    companies: "1,500+", 
    jobs: "420K+", 
    avgSalary: "₹9.8L",
    highlights: ["IT Services Hub", "Automotive Tech", "Emerging Startups"]
  },
  { 
    city: "Chennai", 
    companies: "1,200+", 
    jobs: "380K+", 
    avgSalary: "₹9.1L",
    highlights: ["Software Exports", "Hardware Manufacturing", "Fintech Growth"]
  }
];

const industryTrends = [
  {
    trend: "AI Integration Across Industries",
    impact: "85%",
    description: "Companies integrating AI into operations, creating 300K+ new roles",
    timeframe: "2024-2026"
  },
  {
    trend: "Remote-First Work Culture",
    impact: "65%",
    description: "Permanent remote/hybrid options, expanding talent pool nationwide",
    timeframe: "Current"
  },
  {
    trend: "Green Tech & Sustainability",
    impact: "40%",
    description: "Clean energy, smart cities, and carbon-neutral tech solutions",
    timeframe: "2024-2030"
  },
  {
    trend: "Fintech Revolution",
    impact: "70%",
    description: "Digital payments, neobanks, and financial inclusion driving growth",
    timeframe: "Ongoing"
  }
];

const topHiringCompanies = [
  { company: "Tata Consultancy Services", openings: "45,000+", focus: "Digital Transformation" },
  { company: "Infosys", openings: "35,000+", focus: "AI & Cloud Services" },
  { company: "Wipro", openings: "28,000+", focus: "Consulting & Technology" },
  { company: "Amazon", openings: "15,000+", focus: "Cloud & E-commerce" },
  { company: "Microsoft", openings: "8,500+", focus: "Cloud & AI Products" },
  { company: "Google", openings: "6,200+", focus: "Search & Cloud AI" },
  { company: "Flipkart", openings: "5,800+", focus: "E-commerce & Logistics" },
  { company: "Zomato", openings: "4,500+", focus: "Food Tech & Delivery" }
];

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-gray-700 font-medium">{user?.email}</span>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Market Overview Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-blue-100">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {techMarketStats.totalJobs}
              </div>
              <div className="text-gray-600 font-semibold">Total Tech Jobs</div>
              <div className="text-sm text-gray-500 mt-1">Active openings nationwide</div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-green-100">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                +{techMarketStats.growth}
              </div>
              <div className="text-gray-600 font-semibold">YoY Growth</div>
              <div className="text-sm text-gray-500 mt-1">Industry expansion rate</div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-100">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {techMarketStats.avgSalary}
              </div>
              <div className="text-gray-600 font-semibold">Average Salary</div>
              <div className="text-sm text-gray-500 mt-1">Tech professionals</div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-amber-100">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                50+
              </div>
              <div className="text-gray-600 font-semibold">Tech Cities</div>
              <div className="text-sm text-gray-500 mt-1">Major hiring hubs</div>
            </div>
          </div>
        </section>

        {/* Top In-Demand Roles */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🔥 Most In-Demand Tech Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topInDemandRoles.map((role, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative">
                  <div className="absolute top-4 right-4">
                    <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                      {role.demand}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 pr-16">{role.role}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-green-300 font-semibold">📈 {role.growth}</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">💰 Salary Range</span>
                    <span className="font-bold text-blue-600">{role.salary}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">🏢 Companies</span>
                    <span className="font-bold text-purple-600">{role.companies}+</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Emerging Technologies */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🚀 Emerging Technologies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergingTechnologies.map((tech, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:scale-105 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{tech.tech}</h3>
                  <span className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {tech.growth}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{tech.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Available Jobs</span>
                  <span className="font-bold text-blue-600">{tech.jobs}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Tech Hubs */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🏙️ Major Tech Hubs in India</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topTechHubs.map((hub, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{hub.city}</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{hub.companies}</div>
                      <div className="text-sm opacity-90">Companies</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{hub.jobs}</div>
                      <div className="text-sm opacity-90">Jobs</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{hub.avgSalary}</div>
                      <div className="text-sm opacity-90">Avg Salary</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">🌟 Key Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {hub.highlights.map((highlight, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Industry Trends */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">📊 Key Industry Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {industryTrends.map((trend, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:scale-105 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex-1">{trend.trend}</h3>
                  <div className="ml-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{trend.impact}</div>
                    <div className="text-sm text-gray-500">Impact</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{trend.description}</p>
                <div className="flex justify-between items-center">
                  <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {trend.timeframe}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Hiring Companies */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🏢 Top Hiring Companies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topHiringCompanies.map((company, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center transform hover:scale-105 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{company.company}</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">{company.openings}</div>
                <div className="text-sm text-gray-500 mb-3">Open Positions</div>
                <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {company.focus}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">🎯 Ready to Launch Your Tech Career?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join millions of professionals shaping India's digital future
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              🚀 Get Career Recommendations
            </button>
            <button
              onClick={() => navigate("/career-recommendations")}
              className="px-8 py-4 bg-black bg-opacity-20 text-white rounded-xl font-bold hover:bg-opacity-30 transition-all duration-300 transform hover:scale-105"
            >
              📊 Explore Opportunities
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
