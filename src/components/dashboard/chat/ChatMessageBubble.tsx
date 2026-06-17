import React from "react";
import { AvatarIdentity } from "@/lib/types";

interface ChatMessage {
  id: string;
  sender: "user" | "avatar";
  text: string;
  timestamp: string;
}

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  currentAvatar: AvatarIdentity;
}

export function ChatMessageBubble({ msg, currentAvatar }: ChatMessageBubbleProps) {
  const isAvatar = msg.sender === "avatar";

  return (
    <div className={`flex flex-col max-w-[80%] ${isAvatar ? "self-start items-start" : "self-end items-end ml-auto"}`}>
      <div className="flex items-center gap-2">
        {isAvatar && (
          <div className="w-5 h-5 rounded-full bg-rose-400 overflow-hidden flex-shrink-0">
            {currentAvatar.avatarImage ? (
              <img src={currentAvatar.avatarImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[8px] text-white font-bold flex items-center justify-center h-full uppercase">
                {currentAvatar.name[0]}
              </span>
            )}
          </div>
        )}
        <div 
          className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
            isAvatar 
              ? "bg-slate-100 text-slate-800 rounded-tl-sm font-medium" 
              : "bg-gradient-to-tr from-rose-400 to-amber-500 text-white rounded-tr-sm font-medium"
          }`}
        >
          {msg.text}
        </div>
      </div>
      <span className="text-[7px] text-slate-400 mt-1 px-8">{msg.timestamp}</span>
    </div>
  );
}
