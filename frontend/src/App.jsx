import React from "react";
import ChatBox from "./components/ChatBox";
import Message from "./components/Message";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* <ChatBox /> */}
      <Message/>
    </div>
  );
}

export default App;
