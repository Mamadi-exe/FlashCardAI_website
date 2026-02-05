import React, { useState, useEffect } from 'react';
import styles from './Account.module.css';
import { getAuth, updateProfile, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { MdOutlineModeEdit } from "react-icons/md";

export default function Account() {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, setUser);
      return unsubscribe;
      
    }, []);

  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
      setPhotoUrl(user.photoURL || '');
    }
  }, [user]);

  const handleNameUpdate = async () => {
    await updateProfile(user, { displayName: name });
    setEditingName(false);
    alert('Name updated!');
  };

  const handlePasswordReset = async () => {
    await sendPasswordResetEmail(auth, email);
    alert('Password reset email sent!');
  };

  if (!user) {
    return <div className={styles.accountContainer}>Loading account info...</div>;
  }

  const isPasswordUser = user.providerData?.[0]?.providerId === 'password';

  return (
    <div className={styles.accountContainer}>
      <h2 className={styles.heading}>Account Settings</h2>

      <div className={styles.infoRow}>
        <label>Name:</label>
        {editingName ? (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={handleNameUpdate}>Save</button>
          </>
        ) : (
          <>
            <span>{name || 'Not set'}</span>
            <button onClick={() => setEditingName(true)}><MdOutlineModeEdit /></button>
          </>
        )}
      </div>

      <div className={styles.infoRow}>
        <label>Email:</label>
        <span>{email?.slice(0, 4)}****@***</span>
      </div>

      <div className={styles.infoRow}>
        <label>Password:</label>
        {isPasswordUser ? (
          <button onClick={handlePasswordReset}>Send Reset Link</button>
        ) : (
          <span>Google Account – Password cannot be changed</span>
        )}
      </div>

      <div className={styles.infoRow}>
        <label>Profile Picture:</label>
        <img src={photoUrl || 'https://via.placeholder.com/50'} alt="Profile" className={styles.profilePic} />
      </div>
    </div>
  );
}
