import { initializeApp } from "firebase/app";
import * as dotenv from "dotenv";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

dotenv.config();

// export const firebaseConfig = {
//   apiKey: process.env.API_KEY_FIREBASE!,
//   authDomain: process.env.AUTH_DOMAIN_FIREBASE!,
//   projectId: process.env.PROJECT_ID_FIREBASE!,
//   storageBucket: process.env.STORAGE_BUCKET_FIREBASE!,
//   messagingSenderId: process.env.MESSAGING_SENDER_FIREBASE!,
//   appId: process.env.APP_ID! 
// };

export const firebaseConfig = {
  apiKey: "AIzaSyCtnaKb6KDC2jMaAebWOqq5osAGHvyh2dI",
  authDomain: "imagenes-nanas-amas.firebaseapp.com",
  projectId: "imagenes-nanas-amas",
  storageBucket: "imagenes-nanas-amas.appspot.com",
  messagingSenderId: "438942706964",
  appId: "1:438942706964:web:67692a2686e6f367e22601"
};