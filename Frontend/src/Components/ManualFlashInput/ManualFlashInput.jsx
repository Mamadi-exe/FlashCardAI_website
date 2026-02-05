import React, { useState } from 'react';
import styles from './ManualFlashInput.module.css';

export default function ManualFlashInput({categories, onAddFlashcard }){
    const [question, setQuestion] = useState('');
      const [answer, setAnswer] = useState('');
      const [category, setCategory] = useState('');
      const [newCategory, setNewCategory] = useState('');
      const [useNewCategory, setUseNewCategory] = useState(false);
    
      const finalCategory = useNewCategory ? newCategory : category;
    
      const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!question || !answer || !finalCategory) return;
        onAddFlashcard(finalCategory, question, answer);
        setQuestion('');
        setAnswer('');
        setNewCategory('');
        setUseNewCategory(false);
      };


    return(
        
        <div className={styles.wrapper}>
            <h1 className="text-3xl font-extrabold text-center mb-10 text-gray-800">Start creating</h1>
        
            {/* Manual Form */}
            <form onSubmit={handleManualSubmit} className={styles.panel}>
              <div className={styles.left}>
                <textarea
                  placeholder="Enter your question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className={styles.input}
                />
                <textarea
                  placeholder="Enter the answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className={styles.input}
                />
              </div>
        
              <div className={styles.right}>
                {!useNewCategory ? (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="New Category Name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={styles.input}
                  />
                )}
        
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setUseNewCategory(!useNewCategory)}
                >
                  {useNewCategory ? 'Use Existing' : 'Add New Category'}
                </button>
        
                <button type="submit" className={styles.submit}>
                  ➕ Add Flashcard
                </button>
              </div>
            </form>
        </div>
    )
}