import React from "react";
import Lantern from "./Lantern"; // ✔️ FIXED DEFAULT IMPORT

export const ArchiveView = ({
  messages,
  onClose,
  onSelectMessage,
}: {
  messages: any[];
  onClose: () => void;
  onSelectMessage: (msg: any) => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md p-6 flex items-center justify-center">
      <div className="bg-[#140a1f] rounded-2xl w-full max-w-2xl p-6 border border-white/10 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg"
        >
          Close
        </button>

        <h2 className="text-center text-white text-xl font-bold mb-6">
          Lantern Archive
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => onSelectMessage(msg)}
              className="cursor-pointer"
            >
              <Lantern
                message={{
                  id: msg.id,
                  sender: msg.sender,
                  text: msg.text,
                  depth: "mid",
                }}
                onClick={() => {}}
                variant="grid"
                label={msg.sender}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
