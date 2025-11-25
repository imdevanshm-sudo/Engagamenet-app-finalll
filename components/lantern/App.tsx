// Fixed App.tsx with correct LanternApp import
import React from "react";
import { useAppData } from "/home/user/engagement-app2/src/AppContext.tsx";
import Map from "/home/user/engagement-app2/src/components/Wedding/Guest/Map.jsx";
import LanternApp from "/home/user/engagement-app2/components/lantern/App.tsx";

function App() {
  const {
    messages: chatMessages,
    heartCount: hearts,
    lanterns,
    sendMessage,
    sendHeart,
    sendLantern,
  } = useAppData();

  return (
    <div>
      <Map />
      <div>
        <h2>Chat</h2>
        <div>
          {chatMessages.map((msg, index) => (
            <div key={index}>{msg.text}</div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const text = e.currentTarget.value.trim();
              if (text.length > 0) sendMessage(text, undefined, "Guest", false);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>

      <div>
        <h2>Hearts: {hearts}</h2>
        <button onClick={sendHeart}>Add Heart</button>
      </div>

      <div>
        <h2>Lanterns</h2>
        <button
          onClick={() =>
            sendLantern({
              id: Date.now().toString(),
              message: "",
              sender: "Guest",
              color: "royal",
              timestamp: Date.now(),
            })
          }
        >
          Release Lantern
        </button>
        <div>
          {lanterns.map((lantern) => (
            <div key={lantern.id}>🏮</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
