// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSWcepTylLa2avucg8LcY-XtDo78BFMa0",
  authDomain: "yummyfi.firebaseapp.com",
  projectId: "yummyfi",
  storageBucket: "yummyfi.firebasestorage.app",
  messagingSenderId: "620173656169",
  appId: "1:620173656169:web:6610c303ba3b1ed1dce2f8",
  measurementId: "G-Z8NGG52S3F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export {app};