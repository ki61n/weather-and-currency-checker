// your Message.js component

import { useState } from "react";
import SafeMarkdown from './SafeMarkdown'; // Import the new component

function Message() {
  // ... your existing state and functions
const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 

const send = async () => {
  if (!message.trim()) return;
  setLoading(true);

  const userMessage = message;
  setMessage("");
  setData((prev) => [...prev, { user: userMessage, ai: "" }]);

  try {
    const response = await fetch("/api/ask/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.body) {
      throw new Error("Response body is not available for streaming.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.startsWith("data:"));

      for (const line of lines) {
        let text = line.replace("data: ", "");

        // Ignore [DONE] signal
        if (text.trim() === "[DONE]") {
          continue;
        }

        // The server is already handling word-level chunks and spacing,
        // so we can simply append the new chunk.
        fullText += text;

        setData((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].ai = fullText;
          return updated;
        });
      }
    }
  } catch (err) {
    console.error(err);
    setData((prev) => {
      const updated = [...prev];
      updated[updated.length - 1].ai = "⚠️ Failed to get response from server";
      return updated;
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className='bg-blue-400 w-full h-[95svh] rounded-2xl p-5'>
      <h1 className='font-bold text-4xl text-center mb-4'>
        Weather and Currency Exchange AI
      </h1>

      <div
        id="chat-container"
        className="h-[70vh] bg-pink-700 rounded-2xl p-5 overflow-y-scroll"
      >
        {data.map((item, index) => (
          <div key={index} className="grid gap-5 pb-5">
            <p className="w-[90%] rounded-xl justify-self-end bg-sky-700 m-2 p-5 text-2xl text-white break-words">
              {item.user}
            </p>
            <div className={`w-[90%] rounded-xl justify-self-start bg-sky-600 m-2 p-5 text-xl text-white break-words ${loading && index === data.length - 1 ? 'typing' : ''} break-words`}>
              <SafeMarkdown content={item.ai} />
            </div>
          </div>
        ))}
      </div>

      <div className='fixed bottom-5 w-full flex justify-center gap-5 left-0'>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask something..."
          className="w-[80%] bg-blue-200 rounded-3xl p-3 text-lg"
        />
        <button
          onClick={send}
          disabled={loading}
          className='border-2 bg-fuchsia-300 rounded-3xl w-20 font-semibold'
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Message;



