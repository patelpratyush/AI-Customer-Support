// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALoZ1udaj7iCoRkGTYcSdzmPU9ONNaW7A",
  authDomain: "ai-customer-support-651b8.firebaseapp.com",
  projectId: "ai-customer-support-651b8",
  storageBucket: "ai-customer-support-651b8.appspot.com",
  messagingSenderId: "447368286114",
  appId: "1:447368286114:web:21794c79ad46143cf46cfb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Export the initialized Firebase services
export { app, auth, firestore, provider };