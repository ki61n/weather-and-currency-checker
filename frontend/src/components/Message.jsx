import React from 'react'
import '../App.css'
import { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Safe Markdown component to avoid crashes
function SafeMarkdown({ content }) {
  try {
    return (
      <ReactMarkdown
        children={String(content || "")}
        remarkPlugins={[remarkGfm]}
      />
    );
  } catch (err) {
    console.error("Markdown render error:", err);
    return (
      <div style={{ color: "red" }}>
        ⚠️ Error rendering AI response.
      </div>
    );
  }
}

function Message() {
  const [data,setData]=useState([])
  const [loading,setLoading]=useState(false)
  const [message,setMessage]=useState("")
  
  // const send=async()=>{
  //   console.log("clicked")
  //   if(!message.trim())return;
  //   setLoading(true);
  //   try{
  //     const res=await axios.post('/api/ask',{message})
  //    const log=res.data
  //     console.log("log is :",log)
  //     setData((prev) => [...prev, { user: message, ai: log.airesponse }]);
  //     console.log(ai)
  //   }catch(err){
  //     console.error(err);
  //     setData((prev)=>[...prev,{user:message,ai:"failed to get response from server"}])
  //   }
  //   setMessage("")
  //   setLoading(false)

  // }
  const [sending, setSending] = useState(false);

const send = async () => {
  if (sending) return; // prevent double send
  if (!message.trim()) return;
  setSending(true);
  setLoading(true);
  try {
    const res = await axios.post("/api/ask", { message });
    const log = res.data;
    setData((prev) => [...prev, { user: message, ai: log.airesponse }]);
  } catch (err) {
    console.error(err);
    setData((prev) => [...prev, { user: message, ai: "⚠️ Failed to get response from server" }]);
  }
  setMessage("");
  setLoading(false);
  setSending(false);
};

  return (
    <div className='bg-blue-400 w-full h-[95svh] mt-0 rounded-2xl'>
      <h1 className='font-bold text-4xl'>Weather and Currancy Exchange AI  </h1>
      <div className="h-170 relative top-7 rounded-4xl p-5 m-50 bg-pink-700 overflow-scroll ">
        {data.map((item,index)=>(
          <div key={index}
          className='grid gap-10 pb-10'>
                    <p className={`w-[90%] rounded-sm justify-self-end self] bg-sky-700 m-5 h-[content] p-5 text-2xl`}>{item.user} </p>
                    <div className='w-[90%] rounded-xl justify-self-start self] bg-sky-700 m-5 h-[content] p-5 text-2xl/12 '><SafeMarkdown content={item.ai}/></div>

          </div>


))}
         <div className='fixed bottom-5 w-full flex justify-center gap-5 left-5'>
        <textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // stops newline
      send(); // send only once
    }
  }}
  placeholder="Ask something..."
  className="w-[80%] bg-blue-200 rounded-3xl p-3 text-lg"
/>

        <button 
        onClick={send}
        disabled={loading}
        className='border-2 bg-fuchsia-300 rounded-3xl w-20'>{loading? "Thinking":"send"}</button>
      </div>
      </div>
      
    </div>
  )
}

export default Message
