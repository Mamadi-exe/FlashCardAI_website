import React, { useState, useEffect, useRef } from 'react';
import { FaQuestion, FaLightbulb } from 'react-icons/fa';
import CategoryOverview from '../../Components/CategoryOverview/CategoryOverview';
import { FaChevronCircleUp } from "react-icons/fa";
import styles from './AIFc.module.css';
import { data } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { tryParseAndFixJSON } from '../../jsonHelper';
import FullCategoryViewer from '../FullCategoryViewer/FullCategoryViewer';
import ChatHistory from '../ChatHistory/ChatHistory';
import { RiChatNewLine } from "react-icons/ri";
import { GoHome } from "react-icons/go";
import { GiNotebook } from "react-icons/gi";

export default function AIFc({ onAddFlashcard }) {
  const [paragraph, setParagraph] = useState("");
  const [instruction, setInstruction] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [category, setCategory] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [flippedCards, setFlippedCards] = useState([]);
  const [isViewMode, setIsViewMode] = useState(false);
  const [exitAllModes, setExitAllModes] = useState(false);
  const [aiFullText, setAiFullText] = useState("");  // The actual full text from AI
  const [aiDisplayedText, setAiDisplayedText] = useState("");  // What's shown with typing effect
  const typingIndexRef = useRef(0);
  const typingIntervalRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [quizQuestionNum , setQuizQuestionNum] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [testCategory, setTestCategory] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);


  const [categories, setCategories] = useState(() => {
  const saved = localStorage.getItem('categories');
  return saved ? JSON.parse(saved) : [];
  });

  // useEffect(() => {
  //   setIsViewMode(true)
  //   setIsEditMode(false)
  //   setIsSelectionMode(false)
  // })

  const selectionMode = () => {
    setIsSelectionMode(true);
    setIsEditMode(false);
    setIsViewMode(false);
    setExitAllModes(false);
    setSelectedCards([]);
  };

  const buildPrompt = (instruction, history) => {
    const past = history
      .map((item) => `User: ${item.user}\nAI: ${item.ai}`)
      .join("\n\n");

    return `
    You are a smart assistant that helps users learn concepts and generate flashcards.

    Below is the previous conversation history between the user and you. You should use this context **only if it's relevant** to the user's current instruction.

    --- HISTORY START ---
    ${past}
    --- HISTORY END ---

    Now here is the new instruction from the user:
    User: ${instruction}

    Please decide:
    1. Is this a **new topic**, or a continuation of the history above?
    2. Respond helpfully either way.
    3. Output the response in this JSON format with flashcards and content:

    <start-json>
    {
      "flashcards": [ { "question": "...", "answer": "..." } ],
      "content": "Your explanation here in clean HTML",
      "ocrText": ""
    }
    <end-json>
    `;
  };

  const handleGenerate = async () => {
    const newEntry = { user: instruction, ai: "", flashcards: [] };
    const nextHistory = [...history, newEntry];
    setIsGenerating(true);

    try {
      const promptWithHistory = buildPrompt(instruction, history); // Now includes full history

      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: promptWithHistory,
        }),
      });

      const rawText = await response.text(); // Get raw string, not .json()
      const { parsed, error } = tryParseAndFixJSON(rawText);

      if (error) {
        console.error("❌ JSON Parse Error:", error);
        alert("Failed to parse AI response. Please check formatting.");
        return;
      }

      const aiText = parsed.content;
      newEntry.ai = aiText;
      newEntry.flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];

      setExplanation(aiText);
      startTypingAnimation(aiText); // optional UI animation

      console.log("Full response :", parsed)
      console.log("AI content response :", parsed.content)

      // 🔥 Append to full history (no resetting)
      setHistory(nextHistory);
      setIsGenerating(false);

       // If it's the first message in this session, create a new chat history object
      if (currentChatId === null) {
        const newId = crypto.randomUUID(); // or use Date.now()
        const chatObject = {
          id: newId,
          title: instruction.slice(0, 30) + "...", // you can update this later with AI
          messages: [newEntry]
        };
        setChatHistory(prev => [chatObject, ...prev]);
        setCurrentChatId(newId);
      } else {
        // Otherwise, append to existing chat object
        setChatHistory(prev =>
          prev.map(chat =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, newEntry] }
              : chat
          )
        );
        // If this is the first message in the current chat, update the title
        if (nextHistory.length === 1 && instruction.trim()) {
          setChatHistory(prev =>
            prev.map(chat =>
              chat.id === currentChatId
                ? { ...chat, title: instruction.slice(0, 30) + "..." }
                : chat
            )
          );
        }
      }

      // Flashcards always replaced by most recent ones
      if (newEntry.flashcards.length > 0) {
        const cards = newEntry.flashcards.map((card, index) => ({
          id: `${nextHistory.length - 1}-${index}`, // keep ID unique
          question: card.question,
          answer: card.answer,
        }));
        setFlashcards(cards);
      } else {
        setFlashcards([]);
      }

    } catch (err) {
      console.error("Error generating flashcards:", err);
    }
  };

  // const handleStartTest = async () => {
  //   if (!testCategory || !quizQuestionNum) return;

  //   const selected = categories.find(c => c.name === testCategory);
  //   if (!selected) return;
  //   setIsGenerating(true);

  //   try {
  //     setLoadingQuiz(true);

  //     const res = await fetch("http://127.0.0.1:8000/generate-quiz", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         category: selected,
  //         questionCount: parseInt(quizQuestionNum),
  //       }),
  //     });

  //     const data = await res.json();
  //     console.log("Received quiz data:", data);

  //     // ✅ Safely build and shuffle options
  //     const processedQuestions = (data.questions || []).map((q) => {
  //       const shuffledOptions = [q.correctAnswer, ...q.wrongAnswers].sort(() => Math.random() - 0.5);
  //       return {
  //         ...q,
  //         options: shuffledOptions,
  //       };
  //     });

  //     // ✅ Save to state
  //     setQuizQuestions(processedQuestions);
  //     setIsGenerating(false);

  //     if (currentChatId === null) {
  //       const newId = crypto.randomUUID(); // or use Date.now()
  //       const chatObject = {
  //         id: newId,
  //         title: `Quiz from ${testCategory} with ${quizQuestionNum} questions` + "...", // you can update this later with AI
  //         messages: [newEntry]
  //       };
  //       setChatHistory(prev => [chatObject, ...prev]);
  //       setCurrentChatId(newId);
  //     } else {
  //       // Otherwise, append to existing chat object
  //       setChatHistory(prev =>
  //         prev.map(chat =>
  //           chat.id === currentChatId
  //             ? { ...chat, messages: [...chat.messages, newEntry] }
  //             : chat
  //         )
  //       );
  //       // If this is the first message in the current chat, update the title
  //       if (nextHistory.length === 1 && instruction.trim()) {
  //         setChatHistory(prev =>
  //           prev.map(chat =>
  //             chat.id === currentChatId
  //               ? { ...chat, title: instruction.slice(0, 30) + "..." }
  //               : chat
  //           )
  //         );
  //       }
  //     }

  //     if (currentChatId) {
  //       const quizEntry = {
  //         type: "quiz",
  //         user: `Generate a quiz from <strong>${testCategory}</strong> with <strong>${quizQuestionNum}</strong> questions.`,
  //         quizQuestions: processedQuestions,
  //         quizMeta: {
  //           category: testCategory,
  //           numQuestions: quizQuestionNum,
  //         },
  //       };

  //       setChatHistory(prev =>
  //         prev.map(chat =>
  //           chat.id === currentChatId
  //             ? {
  //                 ...chat,
  //                 messages: [...chat.messages, quizEntry],
  //               }
  //             : chat
  //         )
  //       );
  //     }

  //     setHistory(prev => [
  //       ...prev,
  //       {
  //         type: "quiz",
  //         user: `Generate a quiz from <strong>${testCategory}</strong> with <strong>${quizQuestionNum}</strong> questions.`,
  //         quizQuestions: processedQuestions,
  //         quizMeta: {
  //           category: testCategory,
  //           numQuestions: quizQuestionNum,
  //         },
  //       }
  //     ]);

  //   } catch (err) {
  //     console.error("Quiz generation failed:", err);
  //   } finally {
  //     setLoadingQuiz(false);
  //   }
  // };

  const handleStartTest = async () => {
  if (!testCategory || !quizQuestionNum) return;

  const selected = categories.find(c => c.name === testCategory);
  if (!selected) return;

  setIsGenerating(true);
  setLoadingQuiz(true);

  try {
    const res = await fetch("http://127.0.0.1:8000/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: selected,
        questionCount: parseInt(quizQuestionNum),
      }),
    });

    const data = await res.json();
    console.log("Received quiz data:", data);

    // Shuffle and prepare options
    const processedQuestions = (data.questions || []).map((q) => {
      const shuffledOptions = [q.correctAnswer, ...q.wrongAnswers].sort(() => Math.random() - 0.5);
      return {
        ...q,
        options: shuffledOptions,
      };
    });

    setQuizQuestions(processedQuestions);

    // Create the quiz message
    const quizMessage = {
      type: "quiz",
      user: `Generate a quiz from <strong>${testCategory}</strong> with <strong>${quizQuestionNum}</strong> questions.`,
      quizQuestions: processedQuestions,
      quizMeta: {
        category: testCategory,
        numQuestions: quizQuestionNum,
      },
    };

    // Chat creation or update logic
    if (currentChatId === null) {
      const newId = crypto.randomUUID(); // or use Date.now()
      const newChat = {
        id: newId,
        title: `Quiz from ${testCategory} with ${quizQuestionNum} questions...`,
        messages: [quizMessage],
      };
      setChatHistory(prev => [newChat, ...prev]);
      setCurrentChatId(newId);
    } else {
      setChatHistory(prev =>
        prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, quizMessage] }
            : chat
        )
      );
    }

    // Also push to raw history if needed
    setHistory(prev => [
      ...prev,
      quizMessage
    ]);

  } catch (err) {
    console.error("Quiz generation failed:", err);
  } finally {
    setIsGenerating(false);
    setLoadingQuiz(false);
  }
};


  const handleNewChat = () => {
    const newId = crypto.randomUUID(); // or Date.now().toString()
    const newChat = {
      id: newId,
      title: "New Chat",
      messages: [],
    };

    // Add new chat to history
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newId);

    // Reset state for the new session
    setHistory([]);
    setFlashcards([]);
    setInstruction("");
    setParagraph("");
    setSelectedCards([]);
  };

  const handleAnswerSelect = (qIndex, answer) => {
    setUserAnswers(prev => ({ ...prev, [qIndex]: answer }));
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSubmitQuiz = () => {
    let correct = 0;
    

    quizQuestions.forEach((q, i) => {
      const correctText = stripHtml(q.correctAnswer).trim().toLowerCase();
      const userText = stripHtml(userAnswers[i]).trim().toLowerCase();

      console.log(userAnswers[i])

      if (userText === correctText) {
        correct++;
      }
      console.log("corerct AI answer: ",correctText)
      console.log("user answer: ",userText)
    });

    alert(`You got ${correct} out of ${quizQuestions.length} correct!`);
  };

  

  const updateHistoryCardText = (chatIndex, cardIndex, field, value) => {
    setHistory(prev =>
      prev.map((chatItem, i) => {
        if (i !== chatIndex) return chatItem;
        const updatedFlashcards = chatItem.flashcards.map((card, j) =>
          j === cardIndex ? { ...card, [field]: value } : card
        );
        return { ...chatItem, flashcards: updatedFlashcards };
      })
    );
  };



  const startTypingAnimation = (text, onComplete) => {
    setAiFullText(text);
    setAiDisplayedText("");
    typingIndexRef.current = 0;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      typingIndexRef.current++;
      setAiDisplayedText((prev) => {
        const next = text.slice(0, typingIndexRef.current);
        if (typingIndexRef.current >= text.length) {
          clearInterval(typingIntervalRef.current);
          if (onComplete) onComplete(); // Call next one
        }
        return next;
      });
    }, 10);
  };


  const handleSave = async () => {
    const payload = selectedCards.map((card) => ({
      question: card.question,
      answer: card.answer,
      category: category || "Uncategorized",
    }));

    try {
      const res = await fetch("http://localhost:7126/api/Flashcard/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Flashcards saved!");
        setFlashcards([]);
        setSelectedCards([]);
        setParagraph("");
        setInstruction("");
        setCategory("");
      } else {
        alert("Failed to save flashcards.");
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };


  const selectAllCards = () => {
    setIsSelectionMode(true);
    setSelectedCards(flashcards);
  };


  const editSelectedCards = () => {
    if (selectedCards.length === 0) {
      alert("No cards selected for editing.");
      return;
    }
    setIsEditMode(true);
    setIsSelectionMode(false);
    setIsViewMode(false);
  };

  // Handle card click (only if selection mode is on)
  const toggleCard = (card) => {
    if (!isSelectionMode) return;
    if (selectedCards.some((c) => c.id === card.id)) {
      setSelectedCards(selectedCards.filter((c) => c.id !== card.id));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  // Update flashcard content
  const updateCardText = (id, field, value) => {
    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const updateCheckbox = (e) => {
    setIsSelectionMode(e.target.checked);
  };

  const updateCheckboxEdit = (e) => {
    setIsEditMode(e.target.checked);
  };

  const updateCheckboxView = (e) => {
    setIsViewMode(e.target.checked);
  };

  const toggleManualFlip = (id) => {
    setFlippedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

 const exitModes = () => {
   setIsSelectionMode(false);
   setIsEditMode(false);
   setIsViewMode(false);
 };

 const viewMode = () => {
    setIsViewMode(true);
    setIsSelectionMode(false);
    setIsEditMode(false);
    setFlippedCards([]);       // reset manual flips
    setSelectedCards([]);      // clear selections
  };

  const handleDeleteCategories = (namesToDelete) => {
    const updated = categories.filter(cat => !namesToDelete.includes(cat.name));
    setCategories(updated);
  };
  // for unselecting
  useEffect(() => {
      const saved = localStorage.getItem('categories');
      if (saved) setCategories(JSON.parse(saved));
    }, []);

    useEffect(() => {
    const handleClickOutside = () => {
      if (window.getSelection) {
        const sel = window.getSelection();
        if (sel && sel.removeAllRanges) {
          sel.removeAllRanges();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleDropOnCategory = (e, categoryName) => {
    e.preventDefault();

    const jsonData = e.dataTransfer.getData("application/json");
    const plainText = e.dataTransfer.getData("text/plain");

    if (jsonData) {
      try {
        const droppedCards = JSON.parse(jsonData);

        setCategories(prev => {
          const updated = prev.map(cat => {
            if (cat.name === categoryName) {
              const newCards = droppedCards.filter(
                (newCard) => !cat.cards.some((c) => c.question === newCard.question)
              );
              return {
                ...cat,
                cards: [...cat.cards, ...newCards],
              };
            }
            return cat;
          });

          localStorage.setItem("categories", JSON.stringify(updated));
          return updated;
        });

        // Deselect dropped cards
        const droppedIds = droppedCards.map(c => c.id);
        setSelectedCards(prev => prev.filter(c => !droppedIds.includes(c.id)));
      } catch (err) {
        console.error("Error parsing dropped flashcards:", err);
      }
    } else if (plainText) {
      // 💬 Handle plain text drag (text snippet)
      setCategories(prev => {
        const updated = prev.map(cat => {
          if (cat.name === categoryName) {
            const newTexts = [...(cat.textItems || []), plainText];
            return { ...cat, textItems: newTexts };
          }
          return cat;
        });

        localStorage.setItem("categories", JSON.stringify(updated));
        return updated;
      });
    }
  };


  const handleSelectCategory = (categoryName) => {
      setSelectedCategory(categoryName);
    };
  
    const handleCloseViewer = () => {
      setSelectedCategory(null);
    };

  const handleAddCategory = (newCategory) => {
    setCategories(prev => {
      const updated = [...prev, newCategory];
      localStorage.setItem("categories", JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateCategory = (updatedCategory) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.name === updatedCategory.name ? updatedCategory : cat
      )
    );
  };

  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) setChatHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);


  return (
    <div className={styles.container}>
      
      <aside className={styles.sidebar}>
        <div className={styles.commandSide}>
          <button><a href="/"><GoHome /> Home page</a></button>
          <button><a href="/SavedFc"><GiNotebook /> My notes</a></button>
          <button onClick={handleNewChat}><RiChatNewLine /> New chat</button>
        </div>

        <div className={styles.tabSwitcher}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'categories' ? styles.active : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            📁 Categories
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`}
            onClick={() => setActiveTab('history')}
          >
            🧠 Chat History
          </button>
        </div>

        {/* <div className={styles.chatTabs}>
          {chatHistory.map(chat => (
            <button
              key={chat.id}
              className={chat.id === currentChatId ? styles.active : ""}
              onClick={() => {
                setCurrentChatId(chat.id);
                setHistory(chat.messages); // Load selected chat
                setFlashcards([]); // Reset flashcards until a new response comes in
              }}
            >
              {chat.title}
            </button>
          ))}
        </div> */}

        {activeTab === 'categories' && !selectedCategory && (
          <CategoryOverview
            categories={categories}
            onDropCard={handleDropOnCategory}
            onSelectCategory={handleSelectCategory}
            onDeleteCategories={handleDeleteCategories}
            onAddCategory={handleAddCategory}
          />
        )}

        {activeTab === 'history' && (
          <ChatHistory
            history={chatHistory} // Example: [{title: "Photosynthesis", preview: "Explain how plants..."}]
            onSelectChat={(chat) => {
              setHistory(chat.messages);  // restore chat messages to your AI panel
            }}
            onDeleteChat={(index) => {
              const updated = [...chatHistory];
              updated.splice(index, 1);
              setChatHistory(updated);
            }}
          />
        )}

        {selectedCategory && (
            <FullCategoryViewer
              category={categories.find(c => c.name === selectedCategory)}
              onClose={handleCloseViewer}
              onUpdateCategory={handleUpdateCategory}
            />
          )}
      </aside>

      <main className={styles.chatArea}>

        {/* print what the AI responds with */}
          

        <div className={styles.cardgrid}>
          <ul className={styles.historyList}>
            
             {history.map((item, idx) => {
              if (item.type === "quiz") {
                // Render the quiz UI here
                return (
                  <li key={idx} className={styles.historyItem}>
                    <div className={styles.historyUser}>
                      <div dangerouslySetInnerHTML={{ __html: item.user }} />
                    </div>
                    <div className={styles.quizContainer}>
                      <div className={styles.quizMeta}>
                        <strong>Quiz: {item.quizMeta.category} ({item.quizMeta.numQuestions} questions)</strong>
                      </div>
                      {item.quizQuestions.map((q, i) => {
                        return (
                          <div key={i} className="quiz-question mb-6">
                            <div dangerouslySetInnerHTML={{ __html: q.question }} />
                            <div className={`options space-y-2 ${styles.quizQuestion}`}>
                              {q.options.map((option, idx2) => (
                                <label key={idx2} className="block bg-white p-3 rounded shadow hover:bg-yellow-50 transition">
                                  <input
                                    type="radio"
                                    name={`question-${i}`}
                                    value={option}
                                    onClick={() => handleAnswerSelect(i, option)}
                                    checked={userAnswers[i] === option}
                                    readOnly
                                  />
                                  <span dangerouslySetInnerHTML={{ __html: option }} />
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      <button onClick={handleSubmitQuiz} className={styles.submitQuizBtn}>
                        submit quiz
                      </button>
                    </div>
                  </li>
                );
              }
              else {
                return(
              <li key={idx} className={styles.historyItem}>
                <div className={styles.historyUser}>
                  <div dangerouslySetInnerHTML={{ __html: item.user }} />
                </div>
                <div className={styles.historyAI}>
                  <div
                    className=" rounded p-2 mb-2 select-text"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseUp={(e) => {
                      const selection = window.getSelection();
                      if (!selection || selection.isCollapsed) return;
                    
                      const range = selection.getRangeAt(0);
                      const cloned = range.cloneContents();
                    
                      const container = document.createElement("div");
                      container.appendChild(cloned);
                      const htmlContent = container.innerHTML;
                      const plainText = selection.toString();
                    
                      // Create a draggable span that holds the selection
                      const span = document.createElement("span");
                      span.innerHTML = htmlContent;
                      span.setAttribute("draggable", "true");
                      span.style.backgroundColor = "#fffacc";
                      span.style.cursor = "grab";
                      console.log("Dragged HTML:", htmlContent);
                    
                      // Add dragstart event handler
                      span.addEventListener("dragstart", (e) => {
                        e.dataTransfer.setData("text/plain", htmlContent);
                        e.dataTransfer.setData("text/html", htmlContent);
                      
                        // Drag ghost element so it looks good while dragging
                        const ghost = document.createElement("div");
                        ghost.innerHTML = htmlContent;
                        ghost.style.position = "absolute";
                        ghost.style.top = "-9999px";
                        ghost.style.left = "-9999px";
                        document.body.appendChild(ghost);
                        e.dataTransfer.setDragImage(ghost, 0, 0);
                      
                        setTimeout(() => document.body.removeChild(ghost), 0);
                        
                      });
                    
                      // Replace selected text with this draggable span
                      range.deleteContents();
                      range.insertNode(span);
                    
                      // Clear the selection so user sees clean text
                      selection.removeAllRanges();
                      
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: item.ai }} />
                  </div>

                </div>
                {item.flashcards && item.flashcards.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className={styles.historyLabel}>Flashcards:</span>
                    <div className={styles.historyCardGrid}>
                      {item.flashcards.map((card, cardIdx) => {
                        // Use a unique id for each card in history
                        const cardId = `${idx}-${card.id ?? card.question}`;
                        const isSelected = selectedCards.some(c => c.id === `${idx}-${cardIdx}`);
                        const isFlipped = flippedCards.includes(`${idx}-${cardIdx}`);
                      
                        let containerClasses = styles.cardContainer;
                        if ((isViewMode || isEditMode) && isFlipped) {
                          containerClasses += ` ${styles.flipped}`;
                        }
                        if (isSelectionMode && isSelected) {
                          containerClasses += ` ${styles.selectedBorder}`;
                        }
                      
                        // Wrap card with same handlers as main grid
                        return (
                          <div
                            key={`${idx}-${cardIdx}`}
                            className={containerClasses}
                            draggable={isSelectionMode && isSelected}
                            onDragStart={(e) => {
                              const selected = selectedCards.length > 0 ? selectedCards : [{ ...card, id: `${idx}-${cardIdx}` }];
                              e.dataTransfer.setData("application/json", JSON.stringify(selected));
                            }}
                            onClick={() => {
                              if (isSelectionMode) {
                                // Toggle selection for this card in history
                                if (isSelected) {
                                  setSelectedCards(selectedCards.filter(c => c.id !== `${idx}-${cardIdx}`));
                                } else {
                                  setSelectedCards([...selectedCards, { ...card, id: `${idx}-${cardIdx}` }]);
                                }
                              } else if (isViewMode) {
                                // Flip card in view mode
                                if (isFlipped) {
                                  setFlippedCards(flippedCards.filter(id => id !== `${idx}-${cardIdx}`));
                                } else {
                                  setFlippedCards([...flippedCards, `${idx}-${cardIdx}`]);
                                }
                              }
                            }}
                          >
                            <div className={styles.card}>
                              {/* Flip button only in Edit Mode for editing front/back */}
                              {isEditMode && isSelected && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (isFlipped) {
                                      setFlippedCards(flippedCards.filter(id => id !== `${idx}-${cardIdx}`));
                                    } else {
                                      setFlippedCards([...flippedCards, `${idx}-${cardIdx}`]);
                                    }
                                  }}
                                  className={styles.flipBtn}
                                >
                                  Flip
                                </button>
                              )}
          
                              {/* FRONT */}
                              <div className={`${styles.face} ${styles.front}`}>
                                <FaQuestion className={styles.icon} />
                                {isEditMode && isSelected ? (
                                  <textarea
                                    value={card.question}
                                    onChange={e => {
                                      updateHistoryCardText(idx, cardIdx, "question", e.target.value);
                                    }}
                                    className={styles.textareaEdit}
                                  />


                                ) : (
                                  <p className={styles.text}>{card.question}</p>
                                )}
                              </div>
                              
                              {/* BACK */}
                              <div className={`${styles.face} ${styles.back}`}>
                                <FaLightbulb className={styles.icon} />
                                {isEditMode && isSelected ? (
                                  <textarea
                                    value={card.answer}
                                    onChange={e => {
                                      updateHistoryCardText(idx, cardIdx, "answer", e.target.value);
                                    }}
                                    className={styles.textareaEdit}
                                  />




                                ) : (
                                  <p className={styles.text}>{card.answer}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            )}})}

            

            {isGenerating && (
              <li className={styles.historyItem}>
                <div className={styles.historyAI}>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                </div>
              </li>
            )}
          </ul>

        </div> 

          

      <div className={styles.messageBox}>
        <textarea required="" placeholder="Message..."  className={styles.messageInput} value={instruction} onChange={(e) => setInstruction(e.target.value)}/>
        <div className={styles.toolBox}>
          <div className={styles.fileUploadWrapper}>
            <label htmlFor="file">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 337 337">
                <circle
                  strokeWidth="20"
                  stroke="#6c6c6c"
                  fill="none"
                  r="158.5"
                  cy="168.5"
                  cx="168.5"
                ></circle>
                <path
                  strokeLinecap="round"
                  strokeWidth="25"
                  stroke="#6c6c6c"
                  d="M167.759 79V259"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeWidth="25"
                  stroke="#6c6c6c"
                  d="M79 167.138H259"
                ></path>
              </svg>
              <span className={styles.tooltip}>Add an image</span>
            </label>
            <input type="file" id="file" name="file" className={styles.fileInput} />
          </div>

          <div className={styles.testMode}>
            <button className={styles.btnTestMode} onClick={() => setShowTestModal(true)}>
              Test mode 
            </button>
          </div>

          {showTestModal && (
            <div className={styles.modalBackdrop} onClick={() => setShowTestModal(false)}>
              <div className={styles.testModal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={() => setShowTestModal(false)}>✖</button>
                <h2>Test Mode Setup</h2>
                <p>Select a category and number of questions to begin your test.</p>

                {/* Replace this with real controls later */}
                <div className={styles.testForm}>
                  <label>Category:</label>
                  <select
                    value={testCategory}
                    onChange={(e) => setTestCategory(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <label>Number of Questions:</label>
                  <input type="number" placeholder="e.g. 10" min="1" value={quizQuestionNum}  onChange={(e) => setQuizQuestionNum(e.target.value)}/>

                  <button className={styles.startTestBtn} onClick={() => handleStartTest(testCategory, quizQuestionNum) && setShowTestModal(false)}>Start Test</button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.statusDiv}>
            <input type="checkbox" onChange={updateCheckbox} checked={isSelectionMode} className={styles.checkbox} disabled={true}/>
            <label htmlFor="" className="mr-5 font-bold text-xs">Selection mode </label>
            <input type="checkbox" onChange={updateCheckboxEdit} checked={isEditMode} className={styles.checkbox} disabled={true}/>
            <label htmlFor="" className="mr-5 font-bold text-xs">Edit mode </label>
            <input type="checkbox" onChange={updateCheckboxView} checked={isViewMode} className={styles.checkbox} disabled={true}/>
            <label htmlFor="" className="mr-5 font-bold text-xs">View mode </label>
          </div>

          <div className={styles.manageDropdown}>
            <span className={styles.manageText}>
              Options
            </span>
            <ul className={styles.manageMenu}>
              <li><button onClick={selectAllCards} className={styles.dropdownItem}>Select All</button></li>
              <li><button onClick={viewMode} className={styles.dropdownItem}>View mode</button></li>
              <li><button onClick={selectionMode} className={styles.dropdownItem}>Selection mode</button></li>
              <li><button onClick={editSelectedCards} className={styles.dropdownItem}>Edit mode</button></li>
            </ul>
          </div>

          <button className={styles.sendButton} onClick={handleGenerate}>
            <FaChevronCircleUp className={styles.buttonIcon} />
          </button>
        </div>
        
        
      </div>
      </main>
      
    </div>
  );
}