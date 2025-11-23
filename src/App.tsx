import { useAppData } from "./AppContext";
import Map from "./components/Wedding/Guest/Map";

function App() {
  const {
    chatMessages,   // ✅ FIXED
    hearts,         // ✅ FIXED
    lanterns,
    sendMessage,
    sendHeart,      // ✅ available now
    sendLantern,
  } = useAppData();

  return (
    <div>
      {/* Live Map */}
      <Map />

      {/* Chat */}
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
              if (text.length > 0) {
                sendMessage(text, undefined, "Guest", false);
              }
              e.currentTarget.value = "";
            }
          }}
        />
      </div>

      {/* Hearts */}
      <div>
        <h2>Hearts: {hearts}</h2> {/* ✅ FIXED */}
        <button onClick={sendHeart}>Add Heart</button>
      </div>

      {/* Lanterns */}
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
