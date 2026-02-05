

import React, { useState, useRef, useEffect } from 'react';
import styles from './FullCategoryViewer.module.css';
import { FaQuestion, FaLightbulb, FaEdit, FaTrash, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaTable, FaUndo, FaRedo } from 'react-icons/fa';

export default function FullCategoryViewer({ category, onClose, onUpdateCategory }) {
  const [showToolbarFor, setShowToolbarFor] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedToEdit, setSelectedToEdit] = useState([]);
  const [selectedToDelete, setSelectedToDelete] = useState([]);
  const [selectedTextToDelete, setSelectedTextToDelete] = useState([]);
  const [editValues, setEditValues] = useState({}); // { idx: { question, answer } }
  const [textEditValues, setTextEditValues] = useState({}); // { idx: text }
  const [selectedCardsToEdit, setSelectedCardsToEdit] = useState([]); // For flashcards
  const [selectedTextsToEdit, setSelectedTextsToEdit] = useState([]); // For text items
  const [openMenuIdx, setOpenMenuIdx] = useState(null); // track which card/text's menu is open
  const [editingCardIdx, setEditingCardIdx] = useState(null);
  const [editingTextIdx, setEditingTextIdx] = useState(null);

  const toggleFlip = (idx) => {
    setFlippedCards(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
    setSelectedToEdit([]);
    setSelectedToDelete([]);
    setSelectedTextToDelete([]);
    setEditValues({});
    setTextEditValues({});
  };

  const textItemRefs = useRef([]);
  const editHistory = useRef({});
  const historyPointer = useRef({});
  const lastCursorPos = useRef({});
  const isComposing = useRef(false);

  const initializedRefs = useRef({}); // Track which idx has been initialized

  useEffect(() => {
  category.textItems.forEach((text, idx) => {
    if (!textEditValues.hasOwnProperty(idx)) {
      setTextEditValues(prev => ({
        ...prev,
        [idx]: text
      }));
    }
  });
}, [category.textItems]);

  const handleSelect = (idx) => {
    if (selectedToDelete.includes(idx)) {
      setSelectedToDelete(selectedToDelete.filter(i => i !== idx));
    } else {
      setSelectedToDelete([...selectedToDelete, idx]);
    }
  };

  const handleTextSelect = (idx) => {
    if (selectedTextToDelete.includes(idx)) {
      setSelectedTextToDelete(selectedTextToDelete.filter(i => i !== idx));
    } else {
      setSelectedTextToDelete([...selectedTextToDelete, idx]);
    }
  };

  const handleCardEditSelect = (idx) => {
  if (selectedCardsToEdit.includes(idx)) {
    setSelectedCardsToEdit(selectedCardsToEdit.filter(i => i !== idx));
    setEditValues(prev => {
      const newVals = { ...prev };
      delete newVals[idx];
      return newVals;
    });
  } else {
    setSelectedCardsToEdit([...selectedCardsToEdit, idx]);
    setEditValues(prev => ({
      ...prev,
      [idx]: {
        question: category.cards[idx]?.question || '',
        answer: category.cards[idx]?.answer || '',
      }
    }));
  }
};

  const handleTextEditSelect = (idx) => {
    if (selectedTextsToEdit.includes(idx)) {
      setSelectedTextsToEdit(selectedTextsToEdit.filter(i => i !== idx));
      setTextEditValues(prev => {
        const newVals = { ...prev };
        delete newVals[idx];
        return newVals;
      });
      delete initializedRefs.current[idx];
    } else {
      setSelectedTextsToEdit([...selectedTextsToEdit, idx]);
      setTextEditValues(prev => ({
        ...prev,
        [idx]: category.textItems[idx] || ''
      }));
      initializedRefs.current[idx] = false;
    }
  };

  const handleEditChange = (idx, field, value) => {
    setEditValues(prev => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        [field]: value,
      }
    }));
  };

   const initHistory = (idx) => {
    if (!editHistory.current[idx]) {
      editHistory.current[idx] = [textEditValues[idx] || category.textItems[idx]];
      historyPointer.current[idx] = 0;
    }
  };

  // Save current state to history
  const saveToHistory = (idx) => {
    const currentContent = textItemRefs.current[idx]?.innerHTML || '';
    editHistory.current[idx] = editHistory.current[idx].slice(0, historyPointer.current[idx] + 1);
    editHistory.current[idx].push(currentContent);
    historyPointer.current[idx] = editHistory.current[idx].length - 1;
  };


  const handleTextContentChange = (idx) => {
    saveToHistory(idx);
    const newValue = textItemRefs.current[idx]?.innerHTML || '';
    setTextEditValues(prev => ({
      ...prev,
      [idx]: newValue
    }));
  };


  const confirmDelete = () => {
    if (window.confirm(`Delete ${selectedToDelete.length + selectedTextToDelete.length} selected item(s)?`)) {
      const updatedCards = category.cards.filter((_, idx) => !selectedToDelete.includes(idx));
      const updatedTextItems = category.textItems.filter((_, idx) => !selectedTextToDelete.includes(idx));
      onUpdateCategory({ 
        ...category, 
        cards: updatedCards, 
        textItems: updatedTextItems 
      });
      setSelectedToDelete([]);
      setSelectedTextToDelete([]);
      setIsEditMode(false);
    }
  };

  const saveCursorPosition = (editor) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    
    const range = selection.getRangeAt(0);
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(editor);
    clonedRange.setEnd(range.endContainer, range.endOffset);
    
    return {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      startContainer: range.startContainer,
      endContainer: range.endContainer,
      charCount: clonedRange.toString().length
    };
  };

  // Restore cursor position with better handling
  const restoreCursorPosition = (editor, savedPosition) => {
    if (!editor || !savedPosition) return;
    
    try {
      const selection = window.getSelection();
      selection.removeAllRanges();
      const range = document.createRange();
      
      // First try to restore exact position
      if (savedPosition.startContainer && editor.contains(savedPosition.startContainer)) {
        range.setStart(savedPosition.startContainer, savedPosition.startOffset);
        range.setEnd(savedPosition.endContainer, savedPosition.endOffset);
      } else {
        // Fallback to character count method
        let charCount = 0;
        const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
        
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const nodeLength = node.nodeValue.length;
          
          if (charCount + nodeLength >= savedPosition.charCount) {
            const offset = savedPosition.charCount - charCount;
            range.setStart(node, offset);
            range.setEnd(node, offset);
            break;
          }
          charCount += nodeLength;
        }
      }
      
      selection.addRange(range);
    } catch (error) {
      console.error('Error restoring cursor:', error);
      // Final fallback: move cursor to end
      const selection = window.getSelection();
      selection.selectAllChildren(editor);
      selection.collapseToEnd();
    }
  };

  // Apply formatting with proper selection handling
  const applyFormat = (idx, command, value = null) => {
  const editor = textItemRefs.current[idx];
  if (!editor) return;

  // Focus the editor
  editor.focus();

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  // Save selection range
  lastCursorPos.current[idx] = {
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    startContainer: range.startContainer,
    endContainer: range.endContainer,
    charCount: range.toString().length
  };

  try {
    // Restore cursor position
    restoreCursorPosition(editor, lastCursorPos.current[idx]);

    // Execute command
    if (['bold', 'italic', 'underline'].includes(command)) {
      document.execCommand(command, false, null);
    } else if (command === 'formatBlock') {
      document.execCommand('formatBlock', false, value);
    } else if (['insertUnorderedList', 'insertOrderedList'].includes(command)) {
      document.execCommand(command, false, null);
    } else if (command === 'createLink') {
      var sText = prompt('Enter text:');
      const url = value || prompt('Enter URL:');
      if (url) document.execCommand('insertHTML', false, '<a href="' + url + '" target="_blank">' + sText + '</a>');
    } else if (command === 'insertTable') {
      const tableHtml = `
        <table border="1" style="width:100%;border-collapse:collapse;margin:8px 0;">
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
          <tr><td>Cell 3</td><td>Cell 4</td></tr>
        </table>
      `;
      document.execCommand('insertHTML', false, tableHtml);
    }

    // Save updated content
    handleTextContentChange(idx);

  } catch (e) {
    console.error('Formatting error:', e);
  }

  // Update last position
  setTimeout(() => {
    lastCursorPos.current[idx] = saveCursorPosition(editor);
  }, 0);
};

  // Render editable content with better event handling
  const renderEditableContent = (text, idx) => {
  return (
    <div
      ref={(el) => {
        if (el) {
          textItemRefs.current[idx] = el;
          // Set initial content only once
          if (!initializedRefs.current[idx]) {
            const html = textEditValues[idx] ?? category.textItems[idx] ?? '';
            el.innerHTML = html;
            initializedRefs.current[idx] = true;
            initHistory(idx); // Initialize history
          }
        }
      }}
      contentEditable
      onFocus={() => {
        const editor = textItemRefs.current[idx];
        if (editor && lastCursorPos.current[idx]) {
          setTimeout(() => restoreCursorPosition(editor, lastCursorPos.current[idx]), 10);
        }
      }}
      onInput={(e) => {
        if (isComposing.current) return;
        const editor = e.currentTarget;
        lastCursorPos.current[idx] = saveCursorPosition(editor);
        handleTextContentChange(idx);
      }}
      onCompositionStart={() => {
        isComposing.current = true;
      }}
      onCompositionEnd={(e) => {
        isComposing.current = false;
        const editor = e.currentTarget;
        lastCursorPos.current[idx] = saveCursorPosition(editor);
        handleTextContentChange(idx);
      }}
      onBlur={() => {
        const editor = textItemRefs.current[idx];
        lastCursorPos.current[idx] = saveCursorPosition(editor);
        handleTextContentChange(idx);
      }}
      className={styles.editableContent}
      suppressContentEditableWarning
    />
  );
};

  // Undo/redo functionality
  const handleUndo = (idx) => {
    if (historyPointer.current[idx] > 0) {
      historyPointer.current[idx]--;
      textItemRefs.current[idx].innerHTML = editHistory.current[idx][historyPointer.current[idx]];
      setTextEditValues(prev => ({
        ...prev,
        [idx]: editHistory.current[idx][historyPointer.current[idx]]
      }));
    }
  };

  const handleRedo = (idx) => {
    if (historyPointer.current[idx] < editHistory.current[idx].length - 1) {
      historyPointer.current[idx]++;
      textItemRefs.current[idx].innerHTML = editHistory.current[idx][historyPointer.current[idx]];
      setTextEditValues(prev => ({
        ...prev,
        [idx]: editHistory.current[idx][historyPointer.current[idx]]
      }));
    }
  };

  const confirmEdit = () => {
    // Update cards
    const updatedCards = category.cards.map((card, idx) =>
      selectedCardsToEdit.includes(idx) && editValues[idx]
        ? {
            ...card,
            question: editValues[idx].question,
            answer: editValues[idx].answer,
          }
        : card
    );
  
    // Update text items
    const updatedTextItems = category.textItems.map((text, idx) =>
      selectedTextsToEdit.includes(idx) && textEditValues[idx] !== undefined
        ? textEditValues[idx]
        : text
    );
  
    onUpdateCategory({ 
      ...category, 
      cards: updatedCards,
      textItems: updatedTextItems
    });
    
    setSelectedCardsToEdit([]);
    setSelectedTextsToEdit([]);
    setEditValues({});
    setTextEditValues(prev => {
    const newVals = { ...prev };
      selectedTextsToEdit.forEach(idx => delete newVals[idx]);
      return newVals;
    });
      setIsEditMode(false);
  };


  return (
    <div className={styles.fullscreenwrapper}>
      <div className={styles.fullscreenheader}>
        <h2 className="text-4xl font-extrabold mb-4">{category.name}</h2>
        <button onClick={onClose} className={styles.closebtn}>×</button>
      </div>

      <div className={styles.manageBtn}>
        <button onClick={toggleEditMode} className={styles.editBtn}>
          {isEditMode ? 'Cancel' : 'Manage'}
        </button>
        {isEditMode && (selectedToDelete.length > 0 || selectedTextToDelete.length > 0) && (
          <button onClick={confirmDelete} className={styles.confirmBtn}>
            <FaTrash className={styles.manageIcons}/> Delete Selected ({selectedToDelete.length + selectedTextToDelete.length})
          </button>
        )}
        {isEditMode && (selectedCardsToEdit.length > 0 || selectedTextsToEdit.length> 0) && (
          <button onClick={confirmEdit} className={styles.confirmBtn}>
            <FaEdit className={styles.manageIcons} /> Save Edits ({selectedCardsToEdit.length + selectedTextsToEdit.length})
          </button>
        )}
      </div>

      {category.textItems && category.textItems.length > 0 && (
    <div className={styles.textBubbleWrapper}>
      <h3 className="text-lg font-semibold mb-2">Notes:</h3>
      <ul className={styles.textBubbleList}>
        {category.textItems.map((text, idx) => {
          initHistory(idx);
          return (
            <li key={idx} className={`${styles.bubble} ${isEditMode && (selectedTextToDelete.includes(idx) || selectedToEdit.includes(idx)) ? styles.selectedBorder : ''}`}>
              {isEditMode && selectedTextsToEdit.includes(idx) ? (
    <div className={styles.wysiwygEditor}>
      <div className={styles.toolbar}>
        <button onClick={() => applyFormat(idx, 'bold')} title="Bold"><FaBold /></button>
        <button onClick={() => applyFormat(idx, 'italic')} title="Italic"><FaItalic /></button>
        <button onClick={() => applyFormat(idx, 'underline')} title="Underline"><FaUnderline /></button>
        <select onChange={(e) => applyFormat(idx, 'formatBlock', e.target.value)}>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <button onClick={() => applyFormat(idx, 'insertUnorderedList')} title="Bullet List"><FaListUl /></button>
        <button onClick={() => applyFormat(idx, 'insertOrderedList')} title="Numbered List"><FaListOl /></button>
        <button onClick={() => applyFormat(idx, 'createLink')} title="Link"><FaLink /></button>
        <button onClick={() => applyFormat(idx, 'insertTable')} title="Table"><FaTable /></button>
        <button onClick={() => handleUndo(idx)} title="Undo"><FaUndo /></button>
        <button onClick={() => handleRedo(idx)} title="Redo"><FaRedo /></button>
      </div>
      {renderEditableContent(text, idx)}
    </div>
  ) : (
    <div dangerouslySetInnerHTML={{ __html: text }} />
  )}
              
              {/* Management buttons */}
              {isEditMode && (
                <div className={styles.manageBtns}>
                  <button
                    className={styles.selectBtn}
                    onClick={e => {
                      e.stopPropagation();
                      handleTextSelect(idx);
                    }}
                    style={{
                      background: selectedTextToDelete.includes(idx) ? '#f87171' : '#e5e7eb'
                    }}
                    title="Select for delete"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className={styles.selectBtn}
                    onClick={e => {
                      e.stopPropagation();
                      handleTextEditSelect(idx);
                    }}
                    style={{
                      background: selectedTextsToEdit.includes(idx) ? '#60a5fa' : '#e5e7eb'
                    }}
                    title="Select for edit"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  )}


      <h3 className="text-lg font-semibold mb-2">Flashcards:</h3>
      <div className={styles.cardgrid}>
        
        {category.cards.map((card, idx) => (
          <div
            className={`${styles.cardContainer} ${flippedCards[idx] ? styles.flipped : ''} ${isEditMode && (selectedToDelete.includes(idx) || selectedToEdit.includes(idx)) ? styles.selectedBorder : ''}`}
            onClick={() => !isEditMode && toggleFlip(idx)}
            key={idx}
          >
            <div className={styles.card}>
              <div className={`${styles.face} ${styles.front}`}>
                <FaQuestion className={styles.icon} />
                {isEditMode && selectedCardsToEdit.includes(idx) ? (
                  <textarea
                    value={editValues[idx]?.question ?? card.question}
                    onChange={e => handleEditChange(idx, 'question', e.target.value)}
                    className={styles.textareaEdit}
                  />
                ) : (
                  <p className={styles.text}>{card.question}</p>
                )}
              </div>
              <div className={`${styles.face} ${styles.back}`}>
                <FaLightbulb className={styles.icon} />
                {isEditMode && selectedCardsToEdit.includes(idx) ? (
                  <textarea
                    value={editValues[idx]?.answer ?? card.answer}
                    onChange={e => handleEditChange(idx, 'answer', e.target.value)}
                    className={styles.textareaEdit}
                  />
                ) : (
                  <p className={styles.text}>{card.answer}</p>
                )}
              </div>
            </div>
            {isEditMode && (
              <div className={styles.manageBtns}>
                {/* <div className={styles.manageBtns}>
                <div className={styles.manageDropdown}>
                  <span className={styles.manageText}>
                    ⋮
                  </span>
                  <ul className={styles.manageMenu}>
                    <li><button onClick={e => {e.stopPropagation();handleCardEditSelect(idx);}} className={styles.dropdownItem}>edit <FaEdit/></button></li>
                    <li><button onClick={e => {e.stopPropagation();handleSelect(idx);}} className={styles.dropdownItem}>delete <FaTrash /></button></li>
                  </ul>
                </div>
              </div>
            
          </div> */}
                <button
                  className={styles.selectBtn}
                  onClick={e => {
                    e.stopPropagation();
                    handleSelect(idx);
                  }}
                  style={{
                    background: selectedToDelete.includes(idx) ? '#f87171' : '#e5e7eb'
                  }}
                  title="Select for delete"
                >
                  <FaTrash />
                </button>
                <button
                  className={styles.selectBtn}
                  onClick={e => {
                    e.stopPropagation();
                    handleCardEditSelect(idx);
                  }}
                  style={{
                    background: selectedCardsToEdit.includes(idx) ? '#60a5fa' : '#e5e7eb'
                  }}
                  title="Select for edit"
                >
                  <FaEdit />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
