import React, { useState } from "react";
import { AnAgentChat, createAnChat } from "@21st-sdk/react";
import { useChat } from "@ai-sdk/react";
import theme from "../theme.json";
import { MessageSquare, X } from "lucide-react";

// Initialize the chat connection using the Express backend token route
const chat = createAnChat({
  agent: "vehlytics",
  tokenUrl: "http://localhost:5001/api/an-token",
});

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, status, stop, error } =
    useChat({ chat });

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--cyan)",
            color: "#0a0f1c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 24px rgba(0, 212, 255, 0.4)",
            border: "none",
            cursor: "pointer",
            zIndex: 9999,
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window Overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 400,
            height: 600,
            maxHeight: "80vh",
            background: "rgba(7, 11, 20, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "rgba(0,0,0,0.2)",
            borderBottom: "1px solid rgba(255,255,255,0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)" }} />
              <span style={{ fontWeight: 600, color: "white" }}>FleetMind Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 4,
                display: "flex"
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* 21st Chat UI */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <AnAgentChat
              messages={messages}
              input={input}
              onInputChange={handleInputChange}
              onSend={() => handleSubmit()}
              status={status}
              onStop={stop}
              error={error ?? undefined}
              theme={theme}
            />
          </div>
        </div>
      )}
    </>
  );
}
