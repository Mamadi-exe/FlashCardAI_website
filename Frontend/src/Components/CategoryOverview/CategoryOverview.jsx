// import React from 'react';
// import Styles from './CategoryOverview.module.css';

// export default function CategoryOverview({ categories, onSelectCategory }) {
//   return (
//     <div className={Styles.grid}>
//       {categories.map((category) => (
//         <div
//           key={category.name}
//           className={Styles.card}
//           onClick={() => onSelectCategory(category.name)}
//           tabIndex={0} // makes it focusable for accessibility
//           role="button"
//           onKeyDown={(e) => {
//             if (e.key === 'Enter') onSelectCategory(category.name);
//           }}
//         >
//           <h2 className={Styles.title}>{category.name}</h2>
//           <ul className={Styles.list}>
//             {category.cards.slice(0, 3).map((card, index) => (
//               <li key={index} className={Styles.cardItem}>
//                 {card.question.length > 40
//                   ? card.question.slice(0, 40) + '…'
//                   : card.question}
//               </li>
//             ))}
//           </ul>
//           {category.cards.length > 3 && (
//             <p className={Styles.more}>+ {category.cards.length - 3} more</p>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import Styles from './CategoryOverview.module.css';

export default function CategoryOverview({ categories, onSelectCategory, onDeleteCategories, onDropCard, onAddCategory  }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState([]);


  useEffect(() => {
    console.log("Current category text items:", categories.map(cat => ({
      name: cat.name,
      textItems: cat.textItems
    })));
  }, [categories]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedToDelete([]); // reset selection on toggle
  };

  const toggleCategorySelection = (name) => {
    setSelectedToDelete(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const confirmDelete = () => {
    if (window.confirm('Delete selected categories?')) {
      onDeleteCategories(selectedToDelete);
      setIsEditMode(false);
      setSelectedToDelete([]);
    }
  };

  return (
    <div>
      <div className={Styles.header}>
        <button onClick={toggleEditMode} className={Styles.editBtn}>
          {isEditMode ? 'Cancel' : 'Manage'}
        </button>
        {isEditMode && selectedToDelete.length > 0 && (
          <button onClick={confirmDelete} className={Styles.confirmBtn}>
            Delete Selected ({selectedToDelete.length})
          </button>
        )}
      </div>

      <div className={Styles.grid}>
        {categories.map((category) => (
          <div
            key={category.name}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDropCard(e, category.name)}
            className={`${Styles.card} ${isEditMode ? Styles.shake : ''} ${
              selectedToDelete.includes(category.name) ? Styles.selected : ''
            }`}
            onClick={() =>
              isEditMode
                ? toggleCategorySelection(category.name)
                : onSelectCategory(category.name)
            }
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                isEditMode
                  ? toggleCategorySelection(category.name)
                  : onSelectCategory(category.name);
              }
            }}
          >
            <h2 className={Styles.title}>{category.name}</h2>
            <ul className={Styles.list}>
              {category.cards.slice(0, 3).map((card, index) => (
                <li key={index} className={Styles.cardItem}>
                  {card.question.length > 40
                    ? card.question.slice(0, 40) + '…'
                    : card.question}
                </li>
              ))}
            </ul>
            <ul className={Styles.textBubbles}>
              {category.textItems?.slice(0,3).map((text, index) => (
                <li 
                key={index}
                className={Styles.bubble}
                dangerouslySetInnerHTML={{ __html: text.length > 30 ? text.slice(0, 30) + '…' : text }}
                >
                  {/* {text.length > 30 ? text.slice(0, 30) + '…' : text} */}
                </li>
              ))}
            </ul>
            {(category.cards.length > 3 || (category.textItems?.length ?? 0) > 3) && (
              <p className={Styles.more}> +{" "}
                {Math.max(0, category.cards.length - 3) +
                 Math.max(0, (category.textItems?.length ?? 0) - 3)}{" "} more</p>
            )}
          </div>

          
        ))}

        <div
          className={`${Styles.card} ${Styles.newCategory}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const jsonData = e.dataTransfer.getData("application/json");
            const plainText = e.dataTransfer.getData("text/html");
                    
            const newName = prompt("Enter new category name:");
            if (!newName) return;
                    
            let newCategory = {
              name: newName,
              cards: [],
              textItems: [],
            };
          
            try {
              if (jsonData) {
                const droppedCards = JSON.parse(jsonData);
                newCategory.cards = droppedCards.filter(c => c.question && c.answer);
              } else if (plainText) {
                newCategory.textItems = [plainText];
              } else {
                console.warn("Nothing dropped.");
                return;
              }
            
              const updated = [...categories, newCategory];
              localStorage.setItem("categories", JSON.stringify(updated));
              if (typeof onAddCategory === "function") {
                onAddCategory(newCategory);
              }
            } catch (err) {
              console.error("Drop failed:", err);
            }
          }}
        >
          <h2 className={Styles.title}>+ New Category</h2>
          <p className={Styles.more}>Drop here to create</p>
        </div>
      </div>
    </div>
  );
}
