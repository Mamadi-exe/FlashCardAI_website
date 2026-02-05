import React, { useState, useEffect } from 'react';
import ManualFlashInput from '../../Components/ManualFlashInput/ManualFlashInput';
import CategoryOverview from '../../Components/CategoryOverview/CategoryOverview';
import NavBar from '../../Components/NavBar/NavBar';
import FullCategoryViewer from '../../Components/FullCategoryViewer/FullCategoryViewer'; // Uncomment when ready
import Footer from '../../Components/Footer/Footer'; 

export default function ManualFc() {
    const [categories, setCategories] = useState(() => {
      const saved = localStorage.getItem('categories');
      return saved
        ? JSON.parse(saved)
        : [
            {
              name: 'Science',
              cards: [
                { question: 'What is photosynthesis?', answer: 'Process plants convert sunlight...' },
                { question: 'What is gravity?', answer: 'Force that attracts objects...' },
              ],
            },
            {
              name: 'History',
              cards: [
                { question: 'Who was Napoleon?', answer: 'French military leader.' },
                { question: 'What was WWII?', answer: 'Global war from 1939-1945.' },
              ],
            },
          ];
    });
    
    
      const [selectedCategory, setSelectedCategory] = useState(null);
    
      // Load categories (or flashcards) from localStorage on mount
      useEffect(() => {
        const saved = localStorage.getItem('categories');
        if (saved) setCategories(JSON.parse(saved));
      }, []);
    
      // Delete selected categories
      const handleDeleteCategories = (namesToDelete) => {
        const updated = categories.filter(cat => !namesToDelete.includes(cat.name));
        setCategories(updated);
      };
    
    
      // Save categories to localStorage on change
      useEffect(() => {
        localStorage.setItem('categories', JSON.stringify(categories));
      }, [categories]);
    
      // Add a new flashcard to a category
      const handleAddFlashcard = (categoryName, question, answer) => {
        if (!question.trim() || !answer.trim()) return; // ignore empty inputs
    
        setCategories(prevCats => {
          const updatedCats = prevCats.map(cat => {
            if (cat.name === categoryName) {
              return {
                ...cat,
                cards: [...cat.cards, { question, answer }],
              };
            }
            return cat;
          });
    
          // If category does not exist, create it with the card
          if (!prevCats.some(cat => cat.name === categoryName)) {
            updatedCats.push({
              name: categoryName,
              cards: [{ question, answer }],
            });
          }
    
          return updatedCats;
        });
      };
    
      const handleSelectCategory = (categoryName) => {
        setSelectedCategory(categoryName);
      };
    
      const handleCloseViewer = () => {
        setSelectedCategory(null);
      };
    
      return (
        <div>
          <NavBar />
          
          <ManualFlashInput
            categories={categories.map(cat => cat.name)}
            onAddFlashcard={handleAddFlashcard}
          />
          
          {!selectedCategory && (
            <CategoryOverview
              categories={categories}
              onSelectCategory={handleSelectCategory}
              onDeleteCategories={handleDeleteCategories}
            />
          )}
    
          {/* Uncomment when FullCategoryViewer is ready */}
          {selectedCategory && (
            <FullCategoryViewer
              category={categories.find(c => c.name === selectedCategory)}
              onClose={handleCloseViewer}
            />
          )}
    
          <Footer />
        </div>
      );
}