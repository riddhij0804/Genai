import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // ADD THIS IMPORT

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // ADD THIS STATE
  const [profileCompleted, setProfileCompleted] = useState(false); // ADD THIS STATE

  // ADD THIS FUNCTION - Check if user has completed profile
  const checkProfileCompletion = async (userId) => {
    try {
      const docRef = doc(db, 'userProfiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setUserProfile(profileData);
        // Consider profile complete if they have at least stage and name
        setProfileCompleted(!!profileData.stage && !!profileData.name);
      } else {
        setUserProfile(null);
        setProfileCompleted(false);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setProfileCompleted(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => { // ADD async
      setUser(firebaseUser);
      // ADD PROFILE CHECK
      if (firebaseUser) {
        await checkProfileCompletion(firebaseUser.uid);
      } else {
        setUserProfile(null);
        setProfileCompleted(false);
      }
    });
    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ 
      user, 
      logout,
      userProfile, // ADD THIS
      profileCompleted, // ADD THIS
      setProfileCompleted, // ADD THIS
      checkProfileCompletion // ADD THIS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Optional helper for teammates
export function getCurrentUserId() {
  return auth.currentUser?.uid;
}