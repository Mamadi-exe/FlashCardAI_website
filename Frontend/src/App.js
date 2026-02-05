
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from "./Pages/Home/Home";
import FlashcardPage from './Pages/Flashcard/Flashcard';
import ManualFc from './Pages/ManualFc/ManualFc';
import SavedFc from './Pages/SavedFc/SavedFc';
import AIFcPage from './Pages/AIFcPage/AIFcPage';
import AccountManagement from './Pages/AccountManagement/AccountManagement';


export default function App() {

  function setSelectionStyle(backgroundColor, textColor) {
    // Create a <style> element
    const style = document.createElement('style');
    style.id = 'custom-selection-style'; // Optional: for easy removal later
    
    // Define the new ::selection rule
    style.textContent = `
      ::selection {
        background-color: ${backgroundColor};
        color: ${textColor};
      }
      /* For Firefox */
      ::-moz-selection {
        background-color: ${backgroundColor};
        color: ${textColor};
      }
    `;
    
    // Remove any existing custom style to avoid duplicates
    const existingStyle = document.getElementById('custom-selection-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Append the new style to the <head>
    document.head.appendChild(style);
  }

  // Example: Change selection to pink background and white text
  setSelectionStyle('#4f47e6', '#ffffff');

  
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Flashcard" element={<FlashcardPage />} />
          <Route path="/ManualFc" element={<ManualFc />} />
          <Route path="/SavedFc" element={<SavedFc />} />
          <Route path="/AIFc" element={<AIFcPage />} />
          <Route path="/AccountManagement" element={<AccountManagement/>} />
        </Routes>
      </div>
    </Router>
  );
}
      
