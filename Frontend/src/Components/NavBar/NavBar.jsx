import styles from './NavBar.module.css';
import { CiUser } from "react-icons/ci";
import { signInWithPopup, signOut, provider, auth, onAuthStateChanged } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import React, { useState, useEffect } from "react";

export default function NavBar() {

  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLogInModal, setshowLogInModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setShowModal(false);
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };
  return (
    <nav className={styles.navBar}>
      <div className={`max-w-7xl mx-auto px-4 py-3 flex justify-start items-center ${styles.navContainer}`}>
        <div className="text-black text-2xl font-extrabold tracking-wide drop-shadow-sm">FlashMind</div>
        <div className={`ml-5 ${styles.ulContainer}`}>
<ul className="flex space-x-6">
          <li><a href="/" className={`text-black text-md transition duration-300 ${styles.navItem}`}>Home</a></li>
          <li className={styles.dropdown}>
              <span className={`text-black text-md transition duration-300 ${styles.navItem}`}>
                  Tools ▾
              </span>
              <ul className={styles.dropdownMenu}>
                  <li><a href="/ManualFc" className={styles.dropdownItem}>Create manually</a></li>
                  <li><a href="/AIFc" className={styles.dropdownItem}>AI Generator</a></li>
                  <li><a href="/SavedFc" className={styles.dropdownItem}>My notes</a></li>
              </ul>
          </li>
          <li><a href="/contact" className={`text-black text-md transition duration-300 ${styles.navItem}`}>Contact</a></li>
        </ul>
        </div>
        
      </div>
      <div className={`max-w-7xl mx-auto px-4 py-3 flex justify-end items-center ${styles.userAccount}`}>
        <div className={styles.userDropdown}>
          <button className={styles.userBtn} onClick={() => setShowModal(!user && !showModal)}>
             
             {user ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className={styles.profilePic}
                />
              ) : (
                <CiUser className={styles.userPic} />
              )}
              
             
          </button>
              {/* <li><a href="/ManualFc" className={styles.userDropdownItem}>settings</a></li>
              <li><a href="/AIFc" className={styles.userDropdownItem}>Sign out</a></li> */}

              {user && (
                <ul className={styles.userDropdownMenu}>
                  <li className={styles.userDropdownItem}><a href="/AccountManagement">{user.displayName} settings</a></li>
                  <li className={styles.userDropdownItem} onClick={handleLogout}>
                    Sign out
                  </li>
                </ul>
              )}
        </div>
        
      </div>
        {showLogInModal &&(
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">Log in</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full p-2 border rounded" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" className="w-full p-2 border rounded" placeholder="********" />
                </div>

                <div className={styles.autoLoginDiv}>
                  <hr></hr>
                  <p>Or</p>
                  <hr></hr>
                </div>

                <div className="text-center mt-6 flex flex-col items-center">

                  <button
                    onClick={handleGoogleLogin}
                    className={styles.signin}>
                    <svg
                      viewBox="0 0 256 262"
                      preserveAspectRatio="xMidYMid"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                        fill="#4285F4"
                      ></path>
                      <path
                        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                        fill="#34A853"
                      ></path>
                      <path
                        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                        fill="#FBBC05"
                      ></path>
                      <path
                        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                        fill="#EB4335"
                      ></path>
                    </svg>
                    Log in with Google
                  </button>
                </div>

                <div className="text-center mt-4">
                  <button
                    onClick={() => setshowLogInModal(false)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

       {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">Sign Up</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full p-2 border rounded" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" className="w-full p-2 border rounded" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" className="w-full p-2 border rounded" placeholder="********" />
              </div>
              <div className="text-center">
                <p>already have an account? <button className="text-blue-500 no-underline hover:underline" onClick={() => {
                                                                                                                if (!user && !showLogInModal) {
                                                                                                                  setshowLogInModal(true);
                                                                                                                }
                                                                                                                setShowModal(false);
                                                                                                              }}> log in</button></p>
              </div>
              
              <div className={styles.autoLoginDiv}>
                <hr></hr>
                <p>Or</p>
                <hr></hr>
              </div>
              
              <div className="text-center mt-6 flex flex-col items-center">
                
                <button
                  onClick={handleGoogleLogin}
                  className={styles.signin}>
                  <svg
                    viewBox="0 0 256 262"
                    preserveAspectRatio="xMidYMid"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.googleSvg}
                  >
                    <path
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                      fill="#EB4335"
                    ></path>
                  </svg>
                  Sign up with Google
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
