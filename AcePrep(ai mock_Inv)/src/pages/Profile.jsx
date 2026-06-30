import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  deleteUser,
  updateProfile,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth, db, googleProvider, isFirebaseConfigured } from '../services/firebase.js';
import { updateProfile as updateProfileAction, clearUser } from '../features/auth/authSlice.js';
import { useAuth } from '../hooks/useAuth.js';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const { user } = useSelector((s) => s.auth);
  const [name, setName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!isFirebaseConfigured || !auth || !db) {
      setMessage('Firebase is not configured. Please set up your .env file.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      await updateDoc(doc(db, 'users', user.uid), { displayName: name.trim() });
      dispatch(updateProfileAction({ displayName: name.trim() }));
      setMessage('Profile updated successfully.');
    } catch (e) {
      setMessage('Failed to update: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isFirebaseConfigured || !auth || !db) {
      setMessage('Firebase is not configured. Please set up your .env file.');
      return;
    }
    if (!auth.currentUser) return;
    setDeleting(true);
    setMessage('');
    try {
      // Firebase requires recent login for sensitive operations — reauthenticate first.
      // Use the provider the user originally signed in with.
      const providerId = auth.currentUser.providerData?.[0]?.providerId;
      if (providerId === 'google.com') {
        await reauthenticateWithPopup(auth.currentUser, googleProvider);
      } else if (providerId === 'password') {
        // Email/password users: prompt for password via popup is not available,
        // so we attempt deletion directly and surface a clear error if reauth is required.
        // For email/password, the credential-based reauth requires the user to enter their password,
        // which we handle below by catching the auth/requires-recent-login error.
        try {
          await deleteUser(auth.currentUser);
        } catch (inner) {
          if (inner?.code === 'auth/requires-recent-login') {
            setMessage(
              'For security, please sign out and sign back in before deleting your account, or use the Google sign-in method.'
            );
            setDeleting(false);
            return;
          }
          throw inner;
        }
        try {
          await deleteDoc(doc(db, 'users', user.uid));
        } catch (_) {
          // Firestore doc deletion is best-effort; account is already deleted
        }
        dispatch(clearUser());
        navigate('/');
        return;
      } else {
        setMessage('Unsupported sign-in provider for account deletion.');
        setDeleting(false);
        return;
      }
      // Delete auth user first, then Firestore doc
      await deleteUser(auth.currentUser);
      try {
        await deleteDoc(doc(db, 'users', user.uid));
      } catch (_) {
        // Firestore doc deletion is best-effort; account is already deleted
      }
      dispatch(clearUser());
      navigate('/');
    } catch (e) {
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') {
        setMessage('Account deletion cancelled.');
        return;
      }
      setMessage('Failed to delete account: ' + (e?.message || e?.code || 'unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account settings.</p>
      </div>

      <div className="card p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-16 w-16 rounded-full object-cover ring-4 ring-accent/30" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-accent/30 flex items-center justify-center text-2xl font-bold text-accent-light ring-4 ring-accent/20">
              {user?.displayName?.[0] || user?.email?.[0] || 'U'}
            </div>
          )}
          <div>
            <div className="text-xl font-semibold text-white">{user?.displayName || 'No name set'}</div>
            <div className="text-sm text-slate-400">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Display Name</label>
            <input
              id="name"
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field bg-slate-800/50" value={user?.email || ''} disabled />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              message.includes('success') ? 'bg-success/10 border border-success/30 text-success' : 'bg-error/10 border border-error/30 text-error'
            }`}>
              {message}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleLogout} className="btn-secondary">Sign Out</button>
          <button onClick={() => setShowDelete(true)} className="btn-ghost text-error hover:bg-error/10">
            Delete Account
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-2">Delete Account?</h3>
            <p className="text-slate-400 text-sm mb-6">
              This will permanently delete your account, all interviews, and all tests. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDelete(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="bg-error hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors" disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
