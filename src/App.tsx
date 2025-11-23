import { useAppContext } from './AppContext';
import Livemap from '../components/Livemap';

function App() {
  const { chatMessages, hearts, lanterns, socket } = useAppContext();

  const sendMessage = (text: string) => {
    socket.emit('send_message', { text });
  };

  const addHeart = () => {
    socket.emit('add_heart');
  };

  const releaseLantern = () => {
    socket.emit('release_lantern', { id: Date.now() });
  };

  return (
    <div>
      {/* Livemap */}
      <Livemap />

      {/* Chat */}
      <div>
        <h2>Chat</h2>
        <div>
          {chatMessages.map((msg: any, index: number) => (
            <div key={index}>{msg.text}</div>
          ))}
        </div>
        <input 
          type="text" 
          placeholder="Type a message..." 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>

      {/* Hearts */}
      <div>
        <h2>Hearts: {hearts}</h2>
        <button onClick={addHeart}>Add Heart</button>
      </div>

      {/* Lanterns */}
      <div>
        <h2>Lanterns</h2>
        <button onClick={releaseLantern}>Release Lantern</button>
        <div>
          {lanterns.map((lantern: any) => (
            <div key={lantern.id}>🏮</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
