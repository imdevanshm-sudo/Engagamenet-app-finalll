/// <reference types="vite/client" />

// firebase.ts — Fully fixed & clean
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc
} from "firebase/firestore";

// --- 🔥 Firebase Web Config ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- Init ---
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

//
// --------------------------------------------------------
// 🔥 GLOBAL CONFIG
// --------------------------------------------------------
//

export const subscribeGlobalConfig = (callback: (cfg: any) => void) => {
  return onSnapshot(doc(db, "config", "global"), (snap) => {
    if (!snap.exists()) return callback(null);
    callback(snap.data());
  });
};

export const saveGlobalConfig = async (data: any) => {
  return await setDoc(doc(db, "config", "global"), data, { merge: true });
};

//
// --------------------------------------------------------
// 🔥 PROFILES (GUEST | COUPLE)
// --------------------------------------------------------
//

export const subscribeProfiles = (callback: (profiles: any[]) => void) => {
  return onSnapshot(collection(db, "profiles"), (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
};

export const saveProfile = async (profile: any) => {
  return await setDoc(doc(db, "profiles", profile.id), profile, { merge: true });
};

//
// --------------------------------------------------------
// 🔥 MESSAGES
// --------------------------------------------------------
//

export const subscribeMessages = (callback: (msgs: any[]) => void) => {
  return onSnapshot(collection(db, "messages"), (snapshot) => {
    const msgs = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      // Explicitly type a and b as any to access 'timestamp'
      .sort((a: any, b: any) => a.timestamp - b.timestamp);
    callback(msgs);
  });
};

export const postMessage = async (msg: any) => {
  return await addDoc(collection(db, "messages"), msg);
};

//
// --------------------------------------------------------
// 🔥 GALLERY (PHOTOS / VIDEOS)
// --------------------------------------------------------
//

export const subscribeGallery = (callback: (media: any[]) => void) => {
  return onSnapshot(collection(db, "gallery"), (snapshot) => {
    const media = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      // Explicitly type a and b as any to access 'timestamp'
      .sort((a: any, b: any) => b.timestamp - a.timestamp);

    callback(media);
  });
};

export const addPhoto = async (photo: any) => {
  return await addDoc(collection(db, "gallery"), photo);
};

//
// --------------------------------------------------------
// 🔥 HEARTS COUNTER
// --------------------------------------------------------
//

export const subscribeHearts = (callback: (count: number) => void) => {
  return onSnapshot(doc(db, "hearts", "global"), (snap) => {
    if (!snap.exists()) return callback(0);
    callback(snap.data().count || 0);
  });
};

export const updateHearts = async (increment: number) => {
  const ref = doc(db, "hearts", "global");
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data().count || 0 : 0;

  await setDoc(ref, { count: current + increment }, { merge: true });
};