import React, { useState } from 'react';
import Styles from './BannerCo.module.css';
import { FaQuestion, FaLightbulb } from 'react-icons/fa';


  

export default function BannerCo() {

  const [flipped, setFlipped] = useState(false);
    return (
        <div className={Styles.Banner}>
          <div className={Styles.contentWrapper}>
            {/* Left: Banner content */}
            <div className={`max-w-7xl px-4 ${Styles.BannerContent}`}>
              <h1 className="text-4xl font-extrabold mb-4">Welcome to FlashMind</h1>
              <p className="text-lg mb-2">Your go-to platform for quick and effective learning.</p>
              <p className="text-md mb-6">Join us to create your milestone with our innovative tools.</p>
              <div className={Styles.buttonWrapper}>
                <a href="/AIFc" className={Styles.StartLink}>
                  <button className={Styles.StartButton}>
                    <p>Start</p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>

                </a>
                {/* <button className={Styles.StartButton}>
                  <p>Start</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button> */}
              </div>
              <p className="text-sm mt-6">Keep on scrolling to learn more!</p>
            </div>

            {/* Right: Flashcard */}
            <div
              className={`${Styles.cardContainer} ${flipped ? Styles.flipped : ''}`}
              onClick={() => setFlipped(!flipped)}
            >
              <div className={Styles.card}>
                <div className={`${Styles.face} ${Styles.front}`}>
                  <FaQuestion className={Styles.icon} />
                  <p className={Styles.text}>What is photosynthesis?</p>
                </div>
                <div className={`${Styles.face} ${Styles.back}`}>
                  <FaLightbulb className={Styles.icon} />
                  <p className={Styles.text}>
                    It's the process by which plants convert sunlight into energy.
                  </p>
                </div>
                
                
              </div>
              <p className={`${Styles.tip}`}>Click the card to flip it!</p>
            </div>
            
          </div>

          
        </div>

    );
}