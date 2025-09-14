import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";


// Login
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Signup
export const signupUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Reset password
export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

// Logout
export const logoutUser = async () => {
  return await signOut(auth);
};

