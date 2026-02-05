import React from "react";
import styles from "./ChatHistory.module.css"; // create this CSS file

function ChatHistory({ history, onSelectChat, onDeleteChat }) {
  if (!history || history.length === 0) {
    return <p className={styles.empty}>No chats yet.</p>;
  }

  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {history.map((chat, index) => (
          <li key={index} className={styles.item}>
            <button
              className={styles.chatBtn}
              onClick={() => onSelectChat(chat)}
            >
              {chat.title || chat.preview || `Chat #${index + 1}`}
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => onDeleteChat(index)}
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatHistory;
