import React from "react";
import "./ChatbotLauncher.css"; // dùng CSS riêng để dễ kiểm soát

export default function ChatbotLauncher({ onClick }) {
  return (
    <button
      className="chatbot-launcher"
      onClick={onClick}
      aria-label="Trò chuyện với trợ lý"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        fill="white"
        viewBox="0 0 24 24"
      >
        <path d="M4 4h16v12H5.17L4 17.17V4zm0-2a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4z" />
      </svg>
    </button>
  );
}
