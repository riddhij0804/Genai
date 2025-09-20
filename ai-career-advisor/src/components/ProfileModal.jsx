import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const ProfileModal = ({ isOpen, onClose, onSkip }) => {
  const { user, checkProfileCompletion } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [stage, setStage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // ADD THIS STATE
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // ADD THIS STATE
  const [formData, setFormData] = useState({
    // Personal Details (All Stages)
    fullName: '',
    age: '',
    dateOfBirth: '',
    city: '',
    email: '',
    
    // Education/Background - School
    currentGrade: '',
    favoriteSubjects: [],
    streamsInterested: [],
    academicStrengths: [],
    clubsExtracurriculars: [],
    
    // Education/Background - College
    degreeAndBranch: '',
    yearOfStudy: '',
    currentSkills: [],
    certificationsOnlineCourses: '',
    internshipsProjects: '',
    
    // Education/Background - Professional
    currentJobRole: '',
    industry: '',
    yearsExperience: '',
    coreSkills: [],
    professionalCertifications: '',
    jobSatisfaction: '',
    
    // Interests & Strengths - School
    personalInterests: [],
    strengthsTalents: [],
    
    // Interests & Strengths - College
    collegeInterests: [],
    softSkillsStrengths: [],
    preferredWorkStyle: '',
    
    // Interests & Strengths - Professional
    areasOfGrowth: [],
    professionalStrengths: [],
    careerPreferences: '',
    
    // Career Aspirations - School
    dreamCareers: [],
    motivationForCareer: '',
    shortTermGoal: '',
    
    // Career Aspirations - College
    careerGoalTargetRole: '',
    desiredIndustry: '',
    preferredLearningMethod: '',
    
    // Career Aspirations - Professional
    careerGrowthPlan: '',
    targetRolesIndustry: '',
    skillsToLearn: [],
    obstaclesFaced: ''
  });

  // Load existing profile data if available
  useEffect(() => {
    if (user && isOpen) {
      loadExistingProfile();
    }
  }, [user, isOpen]);

  const loadExistingProfile = async () => {
    try {
      const docRef = doc(db, 'userProfiles', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        setStage(existingData.stage || '');
        setFormData(prev => ({ ...prev, ...existingData }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (field, value, isChecked) => {
    setFormData(prev => ({
      ...prev,
      [field]: isChecked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      // Scroll to top when moving to next step
      document.querySelector('.overflow-y-auto').scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  
  const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    console.log('Starting save process...');
    
    const userProfileData = {
      stage,
      ...formData,
      updatedAt: new Date(),
      userId: user.uid,
      completed: true
    };
    
    console.log('Saving to Firestore...');
    // Just save to Firestore - don't wait for checkProfileCompletion
    await setDoc(doc(db, 'userProfiles', user.uid), userProfileData);
    console.log('Save complete!');
    
    // Show success immediately
    setShowSuccessPopup(true);
    
    // Run checkProfileCompletion in background without waiting
    checkProfileCompletion(user.uid).catch(err => console.log('Background check failed:', err));
    
    // Auto-close after 1.5 seconds
    setTimeout(() => {
      setShowSuccessPopup(false);
      setIsSubmitting(false);
      onClose();
    }, 1500);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    setIsSubmitting(false);
    alert('Error saving profile. Please try again.');
  }
};

  // FIXED: Don't save anything when skipping or closing
  const handleSkip = () => {
    console.log('User clicked skip - not saving data');
    onSkip();
  };

  const handleClose = () => {
    console.log('User clicked close - not saving data');
    onClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return stage !== '';
      case 1:
        return formData.fullName.trim() !== '' && formData.age !== '';
      case 2:
        if (stage === 'School') {
          return formData.currentGrade !== '' && 
                 formData.favoriteSubjects.length > 0 && 
                 formData.streamsInterested.length > 0 && 
                 formData.academicStrengths.length > 0 && 
                 formData.clubsExtracurriculars.length > 0;
        } else if (stage === 'College') {
          return formData.degreeAndBranch !== '' && 
                 formData.yearOfStudy !== '' && 
                 formData.currentSkills.length > 0;
        } else if (stage === 'Professional') {
          return formData.currentJobRole !== '' && 
                 formData.industry !== '' && 
                 formData.yearsExperience !== '' && 
                 formData.coreSkills.length > 0;
        }
        return true;
      case 3:
        if (stage === 'School') {
          return formData.personalInterests.length > 0 && formData.strengthsTalents.length > 0;
        } else if (stage === 'College') {
          return formData.collegeInterests.length > 0 && 
                 formData.softSkillsStrengths.length > 0 && 
                 formData.preferredWorkStyle !== '';
        } else if (stage === 'Professional') {
          return formData.areasOfGrowth.length > 0 && 
                 formData.professionalStrengths.length > 0 && 
                 formData.careerPreferences !== '';
        }
        return true;
      case 4:
        if (stage === 'School') {
          return formData.dreamCareers.length > 0;
        } else if (stage === 'College') {
          return formData.careerGoalTargetRole !== '' && formData.desiredIndustry !== '';
        } else if (stage === 'Professional') {
          return formData.careerGrowthPlan !== '' && formData.targetRolesIndustry !== '';
        }
        return true;
      default:
        return true;
    }
  };

  const renderStageSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome! Let's Get Started</h2>
        <p className="text-gray-600">Tell us about your current stage to personalize your experience</p>
      </div>
      <div className="space-y-4">
        {[
          { value: 'School', label: 'School (15-18)', desc: 'High school student exploring career options', icon: '🎓' },
          { value: 'College', label: 'College (18-22)', desc: 'College student preparing for career', icon: '📚' },
          { value: 'Professional', label: 'Professional (22-25)', desc: 'Early career professional', icon: '💼' }
        ].map(option => (
          <label key={option.value} className="flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
            <input
              type="radio"
              name="stage"
              value={option.value}
              checked={stage === option.value}
              onChange={(e) => setStage(e.target.value)}
              className="w-5 h-5 text-blue-600"
            />
            <div className="text-2xl">{option.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-800">{option.label}</div>
              <div className="text-sm text-gray-600">{option.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  // ...existing code...

const renderPersonalDetails = () => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Tell Us About Yourself</h2>
      <p className="text-gray-600">Help us personalize your career guidance</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => updateFormData('fullName', e.target.value)}
          className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="Enter your full name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Age *</label>
        {/* FIXED: Simplified age input validation */}
        <input
          type="text"
          inputMode="numeric"
          value={formData.age}
          onChange={(e) => {
            const value = e.target.value;
            // Allow only digits and check length
            if (/^\d*$/.test(value) && value.length <= 2) {
              updateFormData('age', value);
            }
          }}
          className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="Enter your age"
          maxLength="2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
          className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">City / State</label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => updateFormData('city', e.target.value)}
          className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="e.g., Mumbai, Maharashtra"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email / Contact</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="For saving progress"
        />
      </div>
    </div>
  </div>
);

  const renderEducationBackground = () => {
    if (stage === 'School') {
      const subjects = ['Math', 'Science', 'English', 'History', 'Geography', 'Arts', 'Commerce', 'Languages', 'Physical Education', 'Computer Science'];
      const streams = ['Science', 'Commerce', 'Arts'];
      const strengths = ['Problem-Solving', 'Creativity', 'Communication', 'Logical Thinking', 'Leadership', 'Teamwork'];
      const activities = ['Sports', 'Coding', 'Debate', 'Music', 'Art', 'Volunteering', 'Drama', 'Dance', 'Photography', 'Writing'];

      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Education & Background</h2>
            <p className="text-gray-600">Tell us about your academic journey</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Current Grade / Year *</label>
            <select
              value={formData.currentGrade}
              onChange={(e) => updateFormData('currentGrade', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              required
            >
              <option value="">Select Grade</option>
              <option value="9">9th Grade</option>
              <option value="10">10th Grade</option>
              <option value="11">11th Grade</option>
              <option value="12">12th Grade</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Favorite Subjects * (Select multiple)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map(subject => (
                <label key={subject} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.favoriteSubjects.includes(subject)}
                    onChange={(e) => handleMultiSelect('favoriteSubjects', subject, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Streams Interested In *</label>
            <div className="grid grid-cols-2 gap-3">
              {streams.map(stream => (
                <label key={stream} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.streamsInterested.includes(stream)}
                    onChange={(e) => handleMultiSelect('streamsInterested', stream, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{stream}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Academic Strengths *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {strengths.map(strength => (
                <label key={strength} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.academicStrengths.includes(strength)}
                    onChange={(e) => handleMultiSelect('academicStrengths', strength, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{strength}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Clubs / Extracurriculars *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {activities.map(activity => (
                <label key={activity} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.clubsExtracurriculars.includes(activity)}
                    onChange={(e) => handleMultiSelect('clubsExtracurriculars', activity, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{activity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (stage === 'College') {
      // REMOVED "Other" from degrees array
      const degrees = ['B.Tech CSE', 'B.Tech IT', 'B.Tech Mechanical', 'B.Tech Civil', 'B.Sc', 'B.Com', 'BA', 'BBA', 'B.Des'];
      const skills = ['Programming', 'Data Analysis', 'Design', 'Communication', 'Management', 'Writing', 'Marketing', 'Finance', 'Research'];

      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Education & Background</h2>
            <p className="text-gray-600">Tell us about your college experience</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Degree & Branch *</label>
            <select
              value={formData.degreeAndBranch}
              onChange={(e) => updateFormData('degreeAndBranch', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              required
            >
              <option value="">Select Degree</option>
              {degrees.map(degree => (
                <option key={degree} value={degree}>{degree}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Year of Study *</label>
            <select
              value={formData.yearOfStudy}
              onChange={(e) => updateFormData('yearOfStudy', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              required
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Current Skills *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {skills.map(skill => (
                <label key={skill} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.currentSkills.includes(skill)}
                    onChange={(e) => handleMultiSelect('currentSkills', skill, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Certifications / Online Courses Taken</label>
            <textarea
              value={formData.certificationsOnlineCourses}
              onChange={(e) => updateFormData('certificationsOnlineCourses', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors h-24 resize-none"
              placeholder="e.g., AWS Certified, Google Analytics, Coursera ML Course"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Internships / Projects</label>
            <textarea
              value={formData.internshipsProjects}
              onChange={(e) => updateFormData('internshipsProjects', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors h-24 resize-none"
              placeholder="Brief description of internships or projects"
            />
          </div>
        </div>
      );
    } else if (stage === 'Professional') {
      // REMOVED "Other" from industries array
      const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Government'];
      const coreSkills = ['Technical Skills', 'Managerial Skills', 'Communication', 'Leadership', 'Project Management', 'Problem Solving', 'Analytical Thinking'];

      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Professional Background</h2>
            <p className="text-gray-600">Tell us about your professional journey</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Current Job Role *</label>
            <input
              type="text"
              value={formData.currentJobRole}
              onChange={(e) => updateFormData('currentJobRole', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g., Software Developer, Marketing Analyst"
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Industry *</label>
            <select
              value={formData.industry}
              onChange={(e) => updateFormData('industry', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              required
            >
              <option value="">Select Industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Years of Experience *</label>
            <select
              value={formData.yearsExperience}
              onChange={(e) => updateFormData('yearsExperience', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              required
            >
              <option value="">Select Experience</option>
              <option value="0-1">0-1 years</option>
              <option value="1-2">1-2 years</option>
              <option value="2-3">2-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Core Skills *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {coreSkills.map(skill => (
                <label key={skill} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.coreSkills.includes(skill)}
                    onChange={(e) => handleMultiSelect('coreSkills', skill, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Certifications / Upskilling Courses</label>
            <textarea
              value={formData.professionalCertifications}
              onChange={(e) => updateFormData('professionalCertifications', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors h-24 resize-none"
              placeholder="e.g., PMP, Scrum Master, AWS Certified"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Current Job Satisfaction / Career Goal</label>
            <textarea
              value={formData.jobSatisfaction}
              onChange={(e) => updateFormData('jobSatisfaction', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors h-24 resize-none"
              placeholder="Rate 1-5 or describe your satisfaction and goals"
            />
          </div>
        </div>
      );
    }
  };

  const renderInterestsStrengths = () => {
    if (stage === 'School') {
      const interests = ['AI', 'Robotics', 'Arts', 'Sports', 'Entrepreneurship', 'Environment', 'Writing', 'Music', 'Gaming', 'Social Work'];
      const talents = ['Creativity', 'Problem-Solving', 'Leadership', 'Teamwork', 'Analytical Thinking', 'Communication', 'Organization', 'Innovation'];

      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Interests & Strengths</h2>
            <p className="text-gray-600">What drives you and what are you good at?</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Personal Interests *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interests.map(interest => (
                <label key={interest} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.personalInterests.includes(interest)}
                    onChange={(e) => handleMultiSelect('personalInterests', interest, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Strengths / Talents *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {talents.map(talent => (
                <label key={talent} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.strengthsTalents.includes(talent)}
                    onChange={(e) => handleMultiSelect('strengthsTalents', talent, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{talent}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (stage === 'College') {
      const collegeInterests = ['AI', 'Web Development', 'Product Design', 'Business', 'Finance', 'Social Work', 'Research', 'Entrepreneurship', 'Marketing', 'Data Science'];
      const softSkills = ['Time Management', 'Critical Thinking', 'Collaboration', 'Communication', 'Leadership', 'Creativity', 'Problem-Solving', 'Adaptability'];

      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Interests & Strengths</h2>
            <p className="text-gray-600">What excites you about your future career?</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Interests *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {collegeInterests.map(interest => (
                <label key={interest} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.collegeInterests.includes(interest)}
                    onChange={(e) => handleMultiSelect('collegeInterests', interest, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Soft Skills / Strengths *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {softSkills.map(skill => (
                <label key={skill} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.softSkillsStrengths.includes(skill)}
                    onChange={(e) => handleMultiSelect('softSkillsStrengths', skill, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred Work Style *</label>
            <div className="grid grid-cols-3 gap-4">
              {['Team', 'Individual', 'Flexible'].map(style => (
                <label key={style} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-2">
                  <input
                    type="radio"
                    name="workStyle"
                    value={style}
                    checked={formData.preferredWorkStyle === style}
                    onChange={(e) => updateFormData('preferredWorkStyle', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">{style}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (stage === 'Professional') {
      const growthAreas = ['Technical Mastery', 'Management', 'Entrepreneurship', 'Research', 'Design', 'AI', 'Cloud', 'Leadership', 'Strategy'];
      const professionalStrengths = ['Technical', 'Leadership', 'Communication', 'Problem-Solving', 'Creativity', 'Networking', 'Innovation', 'Project Management'];
      const workplaceTypes = ['Startup', 'Corporate', 'Freelance', 'Remote', 'Hybrid'];

      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Interests & Strengths</h2>
            <p className="text-gray-600">Where do you want to grow professionally?</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Areas of Interest / Growth *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {growthAreas.map(area => (
                <label key={area} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.areasOfGrowth.includes(area)}
                    onChange={(e) => handleMultiSelect('areasOfGrowth', area, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{area}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Strengths *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {professionalStrengths.map(strength => (
                <label key={strength} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.professionalStrengths.includes(strength)}
                    onChange={(e) => handleMultiSelect('professionalStrengths', strength, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{strength}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Career Preferences (Workplace Type) *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {workplaceTypes.map(type => (
                <label key={type} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-2">
                  <input
                    type="radio"
                    name="careerPreferences"
                    value={type}
                    checked={formData.careerPreferences === type}
                    onChange={(e) => updateFormData('careerPreferences', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  const renderCareerAspirations = () => {
    if (stage === 'School') {
      // REMOVED "Other" from dreamCareers array
      const dreamCareers = ['Doctor', 'Engineer', 'Teacher', 'Artist', 'Entrepreneur', 'Scientist', 'Lawyer', 'Designer', 'Writer', 'Athlete'];

      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Career Aspirations</h2>
            <p className="text-gray-600">What are your dreams and goals?</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Dream Careers *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dreamCareers.map(career => (
                <label key={career} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dreamCareers.includes(career)}
                    onChange={(e) => handleMultiSelect('dreamCareers', career, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{career}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Motivation for Career Choice</label>
            <textarea
              value={formData.motivationForCareer}
              onChange={(e) => updateFormData('motivationForCareer', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors h-28 resize-none"
              placeholder="Why do you like this career? What drives your interest?"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Short-Term Goal (next year)</label>
            <textarea
              value={formData.shortTermGoal}
              onChange={(e) => updateFormData('shortTermGoal', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors h-24 resize-none"
              placeholder="What do you want to achieve in the next year?"
            />
          </div>
        </div>
      );
    } else if (stage === 'College') {
      // REMOVED "Other" from targetRoles array
      const targetRoles = ['Data Scientist', 'Product Manager', 'Software Developer', 'Designer', 'Lawyer', 'Consultant', 'Researcher', 'Entrepreneur', 'Analyst'];
      const industries = ['Tech', 'Finance', 'Healthcare', 'Research', 'Government', 'Arts', 'Education', 'Manufacturing', 'Retail'];
      const learningMethods = ['Courses', 'Projects', 'Internships', 'Mentorship', 'Self-Study', 'Bootcamps'];

      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Career Aspirations</h2>
            <p className="text-gray-600">What's your target after graduation?</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Career Goal / Target Role *</label>
            <select
              value={formData.careerGoalTargetRole}
              onChange={(e) => updateFormData('careerGoalTargetRole', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              required
            >
              <option value="">Select Target Role</option>
              {targetRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Desired Industry *</label>
            <select
              value={formData.desiredIndustry}
              onChange={(e) => updateFormData('desiredIndustry', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              required
            >
              <option value="">Select Industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred Learning Method</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {learningMethods.map(method => (
                <label key={method} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-2">
                  <input
                    type="radio"
                    name="learningMethod"
                    value={method}
                    checked={formData.preferredLearningMethod === method}
                    onChange={(e) => updateFormData('preferredLearningMethod', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (stage === 'Professional') {
      const growthPlans = ['Promotions', 'Switch Roles', 'Upskill', 'Start Own Venture', 'Change Industry'];
      const skillsToLearn = ['Machine Learning', 'Leadership', 'Public Speaking', 'Data Science', 'Product Management', 'Digital Marketing', 'Cloud Computing', 'Design Thinking'];

      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Career Aspirations</h2>
            <p className="text-gray-600">What's your next career move?</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Career Growth Plan *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {growthPlans.map(plan => (
                <label key={plan} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-2">
                  <input
                    type="radio"
                    name="growthPlan"
                    value={plan}
                    checked={formData.careerGrowthPlan === plan}
                    onChange={(e) => updateFormData('careerGrowthPlan', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">{plan}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Target Roles / Industry *</label>
            <input
              type="text"
              value={formData.targetRolesIndustry}
              onChange={(e) => updateFormData('targetRolesIndustry', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g., Senior Developer in FinTech, Product Manager in HealthTech"
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Skills You Want to Learn Next</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {skillsToLearn.map(skill => (
                <label key={skill} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.skillsToLearn.includes(skill)}
                    onChange={(e) => handleMultiSelect('skillsToLearn', skill, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Obstacles You Face</label>
            <textarea
              value={formData.obstaclesFaced}
              onChange={(e) => updateFormData('obstaclesFaced', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors h-28 resize-none"
              placeholder="e.g., lack of mentorship, time constraints, funding, guidance"
            />
          </div>
        </div>
      );
    }
  };

  const renderReviewAndSubmit = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Review & Submit</h2>
        <p className="text-gray-600">Please review your information before submitting</p>
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center">
          <span className="bg-blue-100 p-2 rounded-full mr-3">📋</span>
          Profile Summary
        </h3>
        
        <div className="grid gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">👤</span>Personal Details
            </h4>
            <div className="space-y-2">
              <p><span className="font-medium">Stage:</span> {stage}</p>
              <p><span className="font-medium">Name:</span> {formData.fullName}</p>
              <p><span className="font-medium">Age:</span> {formData.age}</p>
              {formData.city && <p><span className="font-medium">City:</span> {formData.city}</p>}
              {formData.email && <p><span className="font-medium">Email:</span> {formData.email}</p>}
            </div>
          </div>

          {stage === 'School' && (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <span className="mr-2">🎓</span>Education & Background
              </h4>
              <div className="space-y-2">
                <p><span className="font-medium">Grade:</span> {formData.currentGrade}th Grade</p>
                {formData.favoriteSubjects.length > 0 && (
                  <p><span className="font-medium">Favorite Subjects:</span> {formData.favoriteSubjects.join(', ')}</p>
                )}
                {formData.streamsInterested.length > 0 && (
                  <p><span className="font-medium">Streams:</span> {formData.streamsInterested.join(', ')}</p>
                )}
                {formData.academicStrengths.length > 0 && (
                  <p><span className="font-medium">Strengths:</span> {formData.academicStrengths.join(', ')}</p>
                )}
                {formData.personalInterests.length > 0 && (
                  <p><span className="font-medium">Interests:</span> {formData.personalInterests.join(', ')}</p>
                )}
                {formData.dreamCareers.length > 0 && (
                  <p><span className="font-medium">Dream Careers:</span> {formData.dreamCareers.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {stage === 'College' && (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <span className="mr-2">📚</span>Education & Career
              </h4>
              <div className="space-y-2">
                <p><span className="font-medium">Degree:</span> {formData.degreeAndBranch}</p>
                <p><span className="font-medium">Year:</span> {formData.yearOfStudy} Year</p>
                {formData.currentSkills.length > 0 && (
                  <p><span className="font-medium">Skills:</span> {formData.currentSkills.join(', ')}</p>
                )}
                {formData.collegeInterests.length > 0 && (
                  <p><span className="font-medium">Interests:</span> {formData.collegeInterests.join(', ')}</p>
                )}
                <p><span className="font-medium">Target Role:</span> {formData.careerGoalTargetRole}</p>
                <p><span className="font-medium">Desired Industry:</span> {formData.desiredIndustry}</p>
              </div>
            </div>
          )}

          {stage === 'Professional' && (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <span className="mr-2">💼</span>Professional Profile
              </h4>
              <div className="space-y-2">
                <p><span className="font-medium">Current Role:</span> {formData.currentJobRole}</p>
                <p><span className="font-medium">Industry:</span> {formData.industry}</p>
                <p><span className="font-medium">Experience:</span> {formData.yearsExperience}</p>
                {formData.coreSkills.length > 0 && (
                  <p><span className="font-medium">Core Skills:</span> {formData.coreSkills.join(', ')}</p>
                )}
                <p><span className="font-medium">Growth Plan:</span> {formData.careerGrowthPlan}</p>
                <p><span className="font-medium">Target:</span> {formData.targetRolesIndustry}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting} // Disable while submitting
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg transform ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:scale-105'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Profile...
            </span>
          ) : (
            '🚀 Submit Profile & Get Started'
          )}
        </button>
        <button
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={isSubmitting}
          className="px-6 py-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Edit
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStageSelection();
      case 1: return renderPersonalDetails();
      case 2: return renderEducationBackground();
      case 3: return renderInterestsStrengths();
      case 4: return renderCareerAspirations();
      case 5: return renderReviewAndSubmit();
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-indigo-200">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Complete Your Profile</h1>
              <p className="text-gray-600 mt-2">Help us create your personalized career roadmap</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for now
              </button>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Step {currentStep + 1} of 6</span>
              <span className="text-sm font-semibold text-blue-600">{Math.round(((currentStep + 1) / 6) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${((currentStep + 1) / 6) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step Content */}
          <div className="mb-10">
            {renderCurrentStep()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className="px-8 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={nextStep}
                disabled={!isStepValid() || isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUCCESS POPUP - ADD THIS */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform animate-pulse">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Profile Saved Successfully! 🎉</h3>
              <p className="text-gray-600 mb-4">Your career profile has been created. Get ready for personalized recommendations!</p>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2 text-sm text-gray-500">Redirecting...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;