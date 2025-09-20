import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileModal from './ProfileModal';

const OnboardingFlow = ({ children }) => {
  const { user, profileCompleted } = useAuth(); // Changed from currentUser to user
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding modal after login/signup if profile not completed
    if (user && !profileCompleted && !hasShownOnboarding) {
      console.log('Showing onboarding for user:', user.email); // Debug log
      const timer = setTimeout(() => {
        setShowOnboarding(true);
        setHasShownOnboarding(true);
      }, 1500); // Increased delay to ensure auth context is ready

      return () => clearTimeout(timer);
    }
  }, [user, profileCompleted, hasShownOnboarding]);

  const handleSkipOnboarding = () => {
    console.log('User skipped onboarding'); // Debug log
    setShowOnboarding(false);
  };

  const handleCloseOnboarding = () => {
    console.log('User closed onboarding'); // Debug log
    setShowOnboarding(false);
  };

  // Debug logs to see what's happening
  console.log('OnboardingFlow - user:', !!user, 'profileCompleted:', profileCompleted, 'showOnboarding:', showOnboarding);

  return (
    <>
      {children}
      <ProfileModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onSkip={handleSkipOnboarding}
      />
    </>
  );
};

export default OnboardingFlow;