import React, { useState } from "react";
import axios from "axios";

function ChatBox() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);

    try {
      const res = await axios.post("/api/ask", { message });
      const log = res.data;
      setHistory((prev) => [...prev, { user: message, ai: log.airesponse }]);
    } catch (err) {
      console.error(err);
      setHistory((prev) => [
        ...prev,
        { user: message, ai: " Failed to get response from server." },
      ]);
    }

    setMessage("");
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-4">
        🌤️ Multi-API AI Assistant
      </h1>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto mb-4 border p-3 rounded-lg bg-gray-50 max-h-[60vh]">
        {history.length === 0 && (
          <p className="text-gray-400 text-center">Ask something like “What’s the weather in Kerala and convert 100 USD to INR?”</p>
        )}
        {history.map((item, index) => (
          <div key={index} className="mb-4">
            <div className="text-right">
              <p className="bg-blue-100 inline-block p-2 rounded-lg text-blue-800">
                🧑‍💻 {item.user}
              </p>
            </div>
            <div className="text-left mt-2">
              <p className="bg-green-100 inline-block p-2 rounded-lg text-green-800 whitespace-pre-wrap">
                🤖 {item.ai}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg  outline-none p-5"
          placeholder="Type your question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
