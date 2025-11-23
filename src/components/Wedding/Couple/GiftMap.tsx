
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState }from "react";
import { useAuth } from "../../../AuthContext";
import { Lantern, LanternType } from "../Guest/Lantern";
import { socket } from "../../../socket";

const Lanterns = () => {
    const [lanterns, setLanterns] = useState<LanternType[]>([]);
    const [selected, setSelected] = useState<LanternType | null>(null);
    const { user } = useAuth();
    const [showArchive, setShowArchive] = useState(false);
  
    useEffect(() => {
        socket.on('new-lantern', (newLantern: LanternType) => {
            console.log('newLantern', newLantern)
            setLanterns(prev => [...prev, newLantern]);
        });
    
        return () => {
          socket.off('new-lantern');
        };
      }, [lanterns.length]);


    const openLantern = (l: LanternType) => {
        if(l.isRead) {
            return;
        }
        setSelected(l);
    }

    const release = async (lantern: LanternType) => {
        if(!user || !lantern.id) return;

        const token = await user.getIdToken();
        const response = await fetch(\`https://wedding-backend-service-2.onrender.com/lanterns/$\\{lantern.id}/release\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer $\{token}`
            }
        });

        if(response.ok) {
            setLanterns(prev => prev.filter(l => l.id !== lantern.id));
            setSelected(null);
        }
    }

    const viewArchive = () => {
        setShowArchive(true);
    }

    const ArchiveView = ({ onClose, releasedLanterns }: { onClose: () => void, releasedLanterns: LanternType[] }) => {
        return (
            <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white/10 rounded-xl p-4 w-full max-w-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Released Lanterns</h2>
                    <div className="max-h-[60vh] overflow-y-auto">
                        {releasedLanterns.map(l => (
                            <div key={l.id} className="bg-white/10 p-2 rounded-lg mb-2">
                                <p className="text-white">{l.message}</p>
                                <p className="text-xs text-gray-300">- {l.author}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-xl">Close</button>
                </div>
            </div>
        )
    }


    return (
        <div className="absolute inset-0 h-full w-full overflow-hidden">
            <div className="absolute top-4 right-4 z-50">
                <button 
                    onClick={viewArchive} 
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl"
                >
                    View Released Lanterns
                </button>
            </div>
            <div className="w-full h-full relative">
              {lanterns.map((l, i) => (
                <div 
                  key={i} 
                  className={\`absolute w-12 h-12 cursor-pointer z-40 \${l.isRead ? 'opacity-50' : ''}\`}
                  style={{
                    left: \`$\{l.left}%\`,
                    top: "100%",
                    animation: \`float-up $\{l.speed}s linear infinite\`,
                    animationDelay: \`$\{l.delay}s\`
                  }}
                  onClick={() => openLantern(l)}
                >
                  <Lantern message={l} onClick={() => openLantern(l)} />
                </div>
              ))}
            </div>

            {/* Reveal modal */}
            {selected && (
              <div
                className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
                onClick={() => setSelected(null)}
              >
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <Lantern message={selected} isRevealed onClick={() => {}} />
                  <div className="mt-6 text-center">
                    <button onClick={() => setSelected(null)} className="px-4 py-2 bg-white/10 rounded-xl mr-3">Close</button>
                    <button onClick={() => release(selected)} className="px-4 py-2 bg-amber-500 text-white rounded-xl">Release & Save</button>
                  </div>
                </div>
              </div>
            )}

            {/* ARCHIVE */}
            {showArchive && (
              <ArchiveView
                onClose={() => setShowArchive(false)}
                // This would be populated from a different source, e.g. another state
                releasedLanterns={[]} 
              />
            )}
        </div>
    )
}

export default Lanterns;
