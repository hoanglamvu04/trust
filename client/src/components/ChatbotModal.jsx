import React, { useState, useEffect, useRef } from "react";
import menuData from "./menu.json";
import "./ChatbotModal.css";
import { Trash2, X, Maximize, Bot, ChevronLeft } from "lucide-react";

const menuDict = Object.fromEntries(menuData.map(item => [item.id, item]));

export default function ChatbotModal({ open, onClose }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentId, setCurrentId] = useState("root");
  const [awaitingInputType, setAwaitingInputType] = useState(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [history, setHistory] = useState([]);

  const messagesEndRef = useRef(null); // ✅ ref cho auto scroll

  useEffect(() => {
    if (open) resetChat();
  }, [open]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // ✅ mỗi lần có tin nhắn mới sẽ tự cuộn xuống

  const resetChat = () => {
    setMessages([{ from: "bot", text: menuDict["root"].reply, groups: menuDict["root"].groups }]);
    setCurrentId("root");
    setAwaitingInputType(null);
    setHistory([]);
  };

  const showMenu = (id) => {
    const item = menuDict[id];
    if (!item) return;
    setTyping(true);
    setTimeout(() => {
      const botMsg = {
        from: "bot",
        text: item.reply,
        groups: item.groups || []
      };
      setMessages(prev => [...prev, botMsg]);
      setCurrentId(id);
      setAwaitingInputType(item.expectInput || null);
      setTyping(false);
    }, 400);
  };

  const handleSelectOption = (option) => {
    const userMsg = { from: "user", text: option.label };
    setMessages(prev => [...prev, userMsg]);
    setHistory(prev => [...prev, currentId]);
    setTimeout(() => showMenu(option.nextId), 300);
  };

  const handleUserInput = (text) => {
    const userMsg = { from: "user", text };
    setMessages(prev => [...prev, userMsg]);

    if (awaitingInputType) {
      handleTraCuuInput(awaitingInputType, text);
      setAwaitingInputType(null);
    } else {
      const keywordMatch = Object.values(menuDict).find(item =>
        item.keywords?.some(kw => text.toLowerCase().includes(kw))
      );
      if (keywordMatch) {
        setHistory(prev => [...prev, currentId]);
        setTimeout(() => showMenu(keywordMatch.id), 300);
      } else {
        const fallback = {
          from: "bot",
          text: "Em chưa hiểu ý chị. Chị có thể chọn hoặc gõ lại ạ."
        };
        setMessages(prev => [...prev, fallback]);
      }
    }
  };

  const handleTraCuuInput = (type, value) => {
    setTyping(true);
    setTimeout(() => {
      let reply = "";
      switch (type) {
        case "stk":
          reply = `🔍 Kết quả tra cứu STK ${value}:\nKhông có cảnh báo nào.`;
          break;
        case "web":
          reply = `🌐 Đang phân tích website: ${value}...\n(Chức năng demo)`;
          break;
        case "phone":
          reply = `📱 Kết quả kiểm tra số điện thoại ${value}:\nKhông có tố cáo nào.`;
          break;
        case "email":
          reply = `📧 Email ${value} chưa bị cảnh báo.`;
          break;
        default:
          reply = "Chưa xử lý loại dữ liệu này.";
      }
      setMessages(prev => [...prev, { from: "bot", text: reply }]);
      setTyping(false);
    }, 600);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    handleUserInput(input.trim());
    setInput("");
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prev = [...history];
    const lastId = prev.pop();
    setHistory(prev);
    setMessages(prev => [...prev, { from: "bot", text: "⬅️ Quay lại..." }]);
    setTimeout(() => showMenu(lastId), 300);
  };

  if (!open) return null;

  return (
    <div className="chatbot-overlay">
      <div className={`chatbot-modal ${fullscreen ? "fullscreen" : ""}`}>
        <div className="chatbot-header">
          <span><Bot className="inline w-5 h-5 mr-1" /> Trợ lý TrustCheck</span>
          <div className="chatbot-header-actions">
            <button onClick={() => setFullscreen(f => !f)} title="Toàn màn hình">
              <Maximize className="w-5 h-5" />
            </button>
            <button onClick={onClose} title="Đóng">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="quick-suggestions">
          {["Tra cứu STK", "Gửi tố cáo", "Hướng dẫn sử dụng"].map((txt, idx) => (
            <button key={idx} onClick={() => handleUserInput(txt)}>
              {txt}
            </button>
          ))}
        </div>

        <div className="chatbot-body">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-row ${msg.from}`}>
              {msg.from === "bot" && <img src="/images/ai-avatar.png" alt="Bot" className="chat-avatar" />}
              {msg.from === "user" && <div className="user-spacer" />}
              <div className={`chat-msg ${msg.from}`}>
                <div className="msg-text">{msg.text}</div>
                {msg.groups && (
                  <div className="grouped-options">
                    {msg.groups.map((group, gIdx) => (
                      <div className="option-group" key={gIdx}>
                        {group.title && <div className="group-title">{group.title}</div>}
                        <div className="group-items">
                          {group.items.map((item, i) => (
                            <div className="group-item" key={i} onClick={() => handleSelectOption(item)}>
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="chat-row bot">
              <img src="/images/ai-avatar.png" alt="Bot" className="chat-avatar" />
              <div className="chat-msg bot typing">...</div>
            </div>
          )}

          {/* ✅ div ẩn để auto scroll tới đây */}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-footer">
          <button onClick={resetChat} className="clear-btn" title="Xóa hội thoại">
            <Trash2 className="w-5 h-5" />
          </button>
          <button onClick={handleBack} className="clear-btn" title="Quay lại">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} className="send-btn">Gửi</button>
        </div>
      </div>
    </div>
  );
}
