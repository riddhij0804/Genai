import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";


const topJobs = ["AI Engineer", "Full Stack Developer", "Data Scientist", "Cloud Engineer"];
const emergingTech = ["Generative AI", "Web3", "Quantum Computing", "Edge AI"];
const salaryTrends = [
  { role: "AI Engineer", salary: "₹12L - ₹35L" },
  { role: "Full Stack Developer", salary: "₹6L - ₹20L" },
  { role: "Data Scientist", salary: "₹8L - ₹25L" },
];
const topCompanies = ["Google", "Microsoft", "Amazon", "Infosys", "Tata Consultancy Services"];

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Market Pulse</h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-700 dark:text-gray-300">{user?.email}</span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
           <button
            onClick={() => {
              navigate("/dashboard");
            }}
            
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Jobs */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Top In-Demand Jobs</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
            {topJobs.map((job, index) => (
              <li key={index}>{job}</li>
            ))}
          </ul>
        </div>

        {/* Emerging Technologies */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Top Emerging Technologies</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
            {emergingTech.map((tech, index) => (
              <li key={index}>{tech}</li>
            ))}
          </ul>
        </div>

        {/* Salary Trends */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Real-Time Salary Trends</h2>
          <ul className="text-gray-700 dark:text-gray-300">
            {salaryTrends.map((item, index) => (
              <li key={index} className="mb-1">
                <span className="font-medium">{item.role}:</span> {item.salary}
              </li>
            ))}
          </ul>
        </div>

        {/* Top Companies */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 md:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Top Companies Hiring</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
            {topCompanies.map((company, index) => (
              <li key={index}>{company}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
