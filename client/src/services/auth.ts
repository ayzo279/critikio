import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import firebaseApp from "./firebase-config.ts";

const auth = getAuth(firebaseApp);

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("User registration failed.", error);
    throw error;
  }
};
export const signinUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Signin failed.", error);
    throw error;
  }
};

export const signoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out failed.", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};
