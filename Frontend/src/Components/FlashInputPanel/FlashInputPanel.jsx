


import React, { useState } from 'react';
import styles from './FlashInputPanel.module.css';


export default function FlashcardInputPanel({ categories, onAddFlashcard }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [paragraph, setParagraph] = useState('');
  const [numFlashcards, setNumFlashcards] = useState('1');
  const [loading, setLoading] = useState(false);

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

  const handleAutoGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const request = {
        inputs: `generate questions: ${paragraph}`,
    };

    try {
        const res = await fetch("http://127.0.0.1:8000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        });

        if (!res.ok) throw new Error("Something went wrong");

        const data = await res.json();

        const categoryName = useNewCategory ? newCategory : category;

        // Save each flashcard
        data.forEach(flashcard => {
            onAddFlashcard(
                categoryName,
                flashcard.Question,
                flashcard.Answer
            );
        });

    } catch (err) {
        console.error("Error generating flashcards:", err);
    } finally {
        setLoading(false);
    }
};

  return (
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

      {/* Auto Generate */}
      <h1 className="text-3xl font-extrabold text-center mt-10 text-gray-800">Or</h1>
      <h1 className="text-2xl font-light text-center mb-10 text-gray-800">Let us do it for you</h1>

      <form onSubmit={handleAutoGenerate} className={styles.panel}>
        <div className={styles.left}>
          <textarea
            placeholder="Paste your paragraph here..."
            value={paragraph}
            onChange={(e) => setParagraph(e.target.value)}
            className={styles.input}
          />
          <select
            value={numFlashcards}
            onChange={(e) => setNumFlashcards(e.target.value)}
            className={styles.select}
          >
            <option value="">Select Number of Flashcards</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
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

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Generating...' : '✨ Auto Generate'}
          </button>
        </div>
      </form>
    </div>
  );
}
