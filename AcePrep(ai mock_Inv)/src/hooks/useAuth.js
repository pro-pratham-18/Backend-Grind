import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../services/firebase.js';
import { setUser, clearUser, setLoading, setError, updateProfile as updateProfileAction } from '../features/auth/authSlice.js';

const parseFirebaseError = (e) => {
  switch (e?.code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null;
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Sign in with the provider you originally used.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in instead.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Contact support.';
    case 'auth/pending-credential':
      return 'A sign-in is already in progress. Please wait.';
    default:
      if (e?.message?.startsWith('Firebase:')) {
        return e.message.replace(/^Firebase:\s*(Error\s*)?\(([^)]+)\)/, '$2').trim();
      }
      return e?.message || 'Something went wrong. Please try again.';
  }
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Firebase not configured — stop loading spinner, user stays null
      dispatch(setLoading(false));
      return;
    }
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          })
        );
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsub();
  }, [dispatch]);

  const ensureUserDoc = async (firebaseUser) => {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || null,
        createdAt: new Date().toISOString(),
        totalInterviews: 0,
        totalTests: 0,
      });
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      dispatch(setError('Firebase is not configured. Please set up your .env file.'));
      return;
    }
    dispatch(setLoading(true));
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(result.user);
      dispatch(setError(null));
    } catch (e) {
      dispatch(setError(parseFirebaseError(e)));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signInWithEmail = async (email, password) => {
    if (!auth) {
      dispatch(setError('Firebase is not configured. Please set up your .env file.'));
      return;
    }
    dispatch(setLoading(true));
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(result.user);
      dispatch(setError(null));
    } catch (e) {
      dispatch(setError(parseFirebaseError(e)));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    if (!auth) {
      dispatch(setError('Firebase is not configured. Please set up your .env file.'));
      return;
    }
    dispatch(setLoading(true));
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      await ensureUserDoc({ ...result.user, displayName: displayName || result.user.displayName });
      dispatch(updateProfileAction({ displayName: displayName || result.user.displayName }));
      dispatch(setError(null));
    } catch (e) {
      dispatch(setError(parseFirebaseError(e)));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logOut = async () => {
    if (!auth) {
      dispatch(clearUser());
      return;
    }
    try {
      await signOut(auth);
      dispatch(clearUser());
    } catch (e) {
      dispatch(setError(e.message));
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logOut,
  };
};
