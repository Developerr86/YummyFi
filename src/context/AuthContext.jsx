import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  
  useEffect(() => {
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // When auth state changes, fetch the user's custom data (like role) from Firestore.
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
      
        if (userDoc.exists()) {
          // Combine the auth data with the Firestore document data.
          setUser({
            ...currentUser,
            ...userDoc.data()
          });
        } else {
          // Fallback in case the user doc doesn't exist yet.
          setUser(currentUser);
        }
      } else {
        setUser(null);
      } 
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user data from Firestore after login
      const db = getFirestore(app);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUser({
          ...userCredential.user,
          ...userDoc.data()
        });
      } else {
        setUser(userCredential.user);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const db = getFirestore(app);
      // Create a document in the 'users' collection with the user's details.
      await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          email: email,
          role: 'user' // All new signups default to the 'user' role.
      });
      
      // Update the user state with the new data
      setUser({
        ...userCredential.user,
        name: name,
        email: email,
        role: 'user'
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};