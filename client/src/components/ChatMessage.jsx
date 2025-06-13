export default function ChatMessage({ sender, text }) {
  const isUser = sender === "user";
  const avatar = isUser
    ? "https://i.pravatar.cc/40?u=user" // Avatar user random
    : "/ai-avatar.png"; // Avatar AI từ thư mục public

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && <img src={avatar} alt="AI" className="w-8 h-8 rounded-full" />}
      <div className={`px-3 py-2 rounded-lg max-w-[70%] text-sm ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
        {text}
      </div>
      {isUser && <img src={avatar} alt="User" className="w-8 h-8 rounded-full" />}
    </div>
  );
}
