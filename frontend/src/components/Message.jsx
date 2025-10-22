// your Message.js component

import { useState } from "react";
import SafeMarkdown from './SafeMarkdown'; // Import the new component

function Message() {
  // ... your existing state and functions
const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // const send = async () => {
  //   if (!message.trim()) return;
  //   setLoading(true);
  //   // Append the user message first
  //   setData((prev) => [...prev, { user: message, ai: "" }]);

  //   try {
  //     const response = await fetch("/api/ask/stream", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ message }),
  //     });

  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder("utf-8");
  //     let fullText = "";
      
  //     while (true) {
  //       const { value, done } = await reader.read();
  //       if (done) {
  //         setLoading(false);
  //         setMessage("");
  //         break;
  //       }

  //       const chunk = decoder.decode(value, { stream: true });
  //       const lines = chunk.split("\n").filter((line) => line.startsWith("data:"));

  //       for (const line of lines) {
  //         const text = line.replace("data: ", "").trim();

  //         // Ignore [DONE] signal
  //         if (text === "[DONE]") {
  //           continue;
  //         }

  //         // Append tokens to the full text
  //         fullText += text;
          
  //         // Update the state for each token
  //         setData((prev) => {
  //           const updated = [...prev];
  //           updated[updated.length - 1].ai = fullText;
  //           return updated;
  //         });
  //       }
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setData((prev) => {
  //       const updated = [...prev];
  //       updated[updated.length - 1].ai = "⚠️ Failed to get response from server";
  //       return updated;
  //     });
  //     setLoading(false);
  //   }
  // };

//   const send = async () => {
//   if (!message.trim()) return;
//   setLoading(true);
  
//   const userMessage = message;
//   setMessage("");
//   setData((prev) => [...prev, { user: userMessage, ai: "" }]);

//   try {
//     const response = await fetch("/api/ask/stream", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: userMessage }),
//     });

//     if (!response.body) {
//       throw new Error("Response body is not available for streaming.");
//     }

//     const reader = response.body.getReader();
//     const decoder = new TextDecoder("utf-8");
//     let fullText = "";
    
//     // Regular expression to collapse multiple spaces into one and trim
//     const normalizeSpace = (text) => text.replace(/\s+/g, " ").trim();

//     while (true) {
//       const { value, done } = await reader.read();
//       if (done) break;

//       const chunk = decoder.decode(value, { stream: true });
//       const lines = chunk.split("\n").filter((line) => line.startsWith("data:"));

//       for (const line of lines) {
//         let text = line.replace("data: ", "").trim();

//         if (text === "[DONE]") {
//           continue;
//         }

//         // 1. **Handle missing spaces:** Check if the last character of `fullText`
//         // and the first character of the new token (`text`) both need a space
//         // inserted between them.
//         const requiresSpace = fullText.length > 0 && 
//                               !fullText.endsWith(" ") && 
//                               !['.', ',', '!', '?'].includes(fullText.slice(-1)) &&
//                               !text.startsWith(" ");

//         if (requiresSpace) {
//           fullText += " ";
//         }
        
//         fullText += text;

//         // 2. **Handle extra spaces:** Normalize the string to fix over-spacing.
//         // This is necessary because some models produce tokens like "Th ir uv anan".
//         // Perform this before updating the state to provide cleaner output.
//         const normalizedText = normalizeSpace(fullText);

//         setData((prev) => {
//           const updated = [...prev];
//           updated[updated.length - 1].ai = normalizedText;
//           return updated;
//         });
//       }
//     }
//   } catch (err) {
//     console.error(err);
//     setData((prev) => {
//       const updated = [...prev];
//       updated[updated.length - 1].ai = "⚠️ Failed to get response from server";
//       return updated;
//     });
//   } finally {
//     setLoading(false);
//   }
// };
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



// import React, { useState } from 'react';
// import '../App.css';
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// // Safe Markdown component to avoid crashes
// function SafeMarkdown({ content }) {
//   if (!content) return <em>Waiting for response...</em>;
//   try {
//     return (
//       <ReactMarkdown
//         children={String(content)}
//         remarkPlugins={[remarkGfm]}
//       />
//     );
//   } catch (err) {
//     console.error("Markdown render error:", err);
//     return <div style={{ color: "red" }}>⚠️ Error rendering AI response.</div>;
//   }
// }

// function Message() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const send = async () => {
//     if (!message.trim()) return;
//     setLoading(true);
//     setData((prev) => [...prev, { user: message, ai: "" }]);

//     try {
//       const response = await fetch("/api/ask/stream", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message }),
//       });

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder("utf-8");
//       let fullText = "";

//       while (true) {
//         const { value, done } = await reader.read();
//         if (done) break;

//         const chunk = decoder.decode(value, { stream: true });
//         const lines = chunk.split("\n").filter((line) => line.startsWith("data:"));

//         for (let line of lines) {
//           // let text = line.replace("data: ", "").trim();

//           // if (text === "[DONE]") {
//           //   setLoading(false);
//           //   setMessage("");
//           //   return;
//           // }

//           // // Add missing space if needed
//           // if (fullText && !fullText.endsWith(" ") && !text.startsWith(" ")) {
//           //   fullText += " " + text;
//           // } else {
//           //   fullText += text;
//           // }

//           // // Clean Markdown spacing issues
//           // fullText = fullText
//           //   .replace(/\*\s+\*/g, "**")      // fix bold spacing
//           //   .replace(/\n\s*\n/g, "\n\n")   // clean extra newlines
//           //   .replace(/-\s+/g, "- ");       // clean list dashes
// let text = line.replace("data: ", "").trim();

// // ignore [DONE]
// if (text === "[DONE]") {
//   setLoading(false);
//   setMessage("");
//   return;
// }

// // add space if previous token and current token need it
// if (fullText && !fullText.endsWith(" ") && !text.startsWith(" ")) {
//   fullText += " " + text;
// } else {
//   fullText += text;
// }

// // 🧩 normalize Markdown
// fullText = fullText
//   .replace(/\*\s+\*/g, "**")     // fix bold spacing
//   .replace(/__\s+__/g, "__")     // fix underline spacing
//   .replace(/\n\s*\n/g, "\n\n")   // normalize blank lines
//   .replace(/-\s+/g, "- ");       // normalize list dashes

//           setData((prev) => {
//   const updated = [...prev];
//   updated[updated.length - 1].ai = fullText;
//   return updated;
// });

//         }
//       }
//     } catch (err) {
//       console.error(err);
//       setData((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1].ai = "⚠️ Failed to get response from server";
//         return updated;
//       });
//       setLoading(false);
//     }
//   };

//   return (
//     <div className='bg-blue-400 w-full h-[95svh] rounded-2xl p-5'>
//       <h1 className='font-bold text-4xl text-center mb-4'>
//         Weather and Currency Exchange AI
//       </h1>

//       <div
//         id="chat-container"
//         className="h-[70vh] bg-pink-700 rounded-2xl p-5 overflow-y-scroll"
//       >
//         {data.map((item, index) => (
//           <div key={index} className="grid gap-5 pb-5">
//             <p className="w-[90%] rounded-xl justify-self-end bg-sky-700 m-2 p-5 text-2xl text-white break-words">
//               {item.user}
//             </p>
//             <div className={`w-[90%] rounded-xl justify-self-start bg-sky-600 m-2 p-5 text-xl text-white break-words ${loading ? 'typing' : ''} break-words`}>
//               <SafeMarkdown content={item.ai} />
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='fixed bottom-5 w-full flex justify-center gap-5 left-0'>
//         <textarea
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter' && !e.shiftKey) {
//               e.preventDefault(); // stops newline
//               send(); // send only once
//             }
//           }}
//           placeholder="Ask something..."
//           className="w-[80%] bg-blue-200 rounded-3xl p-3 text-lg"
//         />
//         <button
//           onClick={send}
//           disabled={loading}
//           className='border-2 bg-fuchsia-300 rounded-3xl w-20 font-semibold'
//         >
//           {loading ? "Thinking..." : "Send"}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Message;




// import React from 'react'
// import '../App.css'
// import { useState } from 'react'
// // import axios from 'axios'
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// // Safe Markdown component to avoid crashes
// function SafeMarkdown({ content }) {
//   try {
//     return (
//       <ReactMarkdown
//         children={String(content || "")}
//         remarkPlugins={[remarkGfm]}
//       />
//     );
//   } catch (err) {
//     console.error("Markdown render error:", err);
//     return (
//       <div style={{ color: "red" }}>
//         ⚠️ Error rendering AI response.
//       </div>
//     );
//   }
// }

// function Message() {
//   const [data,setData]=useState([])
//   const [loading,setLoading]=useState(false)
//   const [message,setMessage]=useState("")
  
 
//   // const [sending, setSending] = useState(false);

// // const send = async () => {
// //   if (sending) return; // prevent double send
// //   if (!message.trim()) return;
// //   setSending(true);
// //   setLoading(true);
// //   try {
// //     const res = await axios.post("/api/ask", { message });
// //     const log = res.data;
// //     setData((prev) => [...prev, { user: message, ai: log.airesponse }]);
// //   } catch (err) {
// //     console.error(err);
// //     setData((prev) => [...prev, { user: message, ai: "⚠️ Failed to get response from server" }]);
// //   }
// //   setMessage("");
// //   setLoading(false);
// const send = async () => {
//   if (!message.trim()) return;
//   setLoading(true);
//   setData((prev) => [...prev, { user: message, ai: "" }]);

//   const response = await fetch("/api/ask/stream", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ message }),
//   });

//   const reader = response.body.getReader();
//   const decoder = new TextDecoder("utf-8");

//   let fullText = "";
//   while (true) {
//     const { value, done } = await reader.read();
//     if (done) break;
//     const chunk = decoder.decode(value, { stream: true });

//     const lines = chunk.split("\n").filter((line) => line.startsWith("data:"));
//     // for (let line of lines) {
//     //   const text = line.replace("data: ", "").trim();
//     //   if (text === "[DONE]") {
//     //     setLoading(false);
//     //     setMessage("");
//     //     return;
//     //   }
//     //   fullText += text;
//     //   setData((prev) => {
//     //     const updated = [...prev];
//     //     updated[updated.length - 1].ai = fullText;
//     //     return updated;
//     //   });
//     // }
//     for (let line of lines) {
//   const text = line.replace("data: ", "").trim();
//   if (text === "[DONE]") {
//     setLoading(false);
//     setMessage("");
//     return;
//   }

//   // 🧩 FIX: Add missing space when joining tokens
//   if (fullText && !fullText.endsWith(" ") && !text.startsWith(" ")) {
//     fullText += " " + text;
//   } else {
//     fullText += text;
//   }

//   setData((prev) => {
//     const updated = [...prev];
//     updated[updated.length - 1].ai = fullText;
//     return updated;
//   });
// }

//   }
// };

// //   setSending(false);
// // };

//   return (
//     <div className='bg-blue-400 w-full h-[95svh] mt-0 rounded-2xl'>
//       <h1 className='font-bold text-4xl'>Weather and Currancy Exchange AI  </h1>
//       <div className="h-170 relative top-7 rounded-4xl p-5 m-50 bg-pink-700 overflow-scroll ">
//         {data.map((item,index)=>(
//           <div key={index}
//           className='grid gap-10 pb-10'>
//                     <p className={`w-[90%] rounded-sm justify-self-end self] bg-sky-700 m-5 h-[content] p-5 text-2xl`}>{item.user} </p>
//                     <div className={`w-[90%] rounded-xl justify-self-start self] bg-sky-700 m-5 h-[content] p-5 text-2xl/12 text-white ${loading ? 'typing' : ''}`}><SafeMarkdown content={item.ai}/></div>
//                     {/* <div className={`text-white ${loading ? 'typing' : ''}`}>
//   <SafeMarkdown content={item.ai} />
// </div> */}

//           </div>


// ))}
//          <div className='fixed bottom-5 w-full flex justify-center gap-5 left-5'>
//         <textarea
//   value={message}
//   onChange={(e) => setMessage(e.target.value)}
//   onKeyDown={(e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault(); // stops newline
//       send(); // send only once
//     }
//   }}
//   placeholder="Ask something..."
//   className="w-[80%] bg-blue-200 rounded-3xl p-3 text-lg"
// />

//         <button 
//         onClick={send}
//         disabled={loading}
//         className='border-2 bg-fuchsia-300 rounded-3xl w-20'>{loading? "Thinking":"send"}</button>
//       </div>
//       </div>
      
//     </div>
//   )
// }

// export default Message




