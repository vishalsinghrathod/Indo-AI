import { createContext, useState, useEffect, useRef } from "react";
import run from "../gemini";

export const dataContext = createContext();

const UserContext = ({children}) => {
 const [input, setInput] = useState("");
 const [loading, setLoading] = useState(false);
 const [extend, setExtend] = useState(false);
 const typingTimersRef = useRef([]);

 // Active Session State
 const [activeSessionId, setActiveSessionId] = useState(null);
 const [currentMessages, setCurrentMessages] = useState([]);

 // Session History State (handles legacy string conversion)
 const [prevPrompt, setPrevPrompt] = useState(() => {
   try {
     const stored = localStorage.getItem("gemini_chat_history");
     if (!stored) return [];
     const parsed = JSON.parse(stored);
     return parsed.map(item => {
       if (typeof item === "string") {
         return {
           id: Math.random().toString(),
           title: item,
           messages: [
             { role: "user", text: item },
             { role: "ai", text: "Previous history loaded." }
           ]
         };
       }
       return item;
     });
   } catch (e) {
     return [];
   }
 });

 useEffect(() => {
   localStorage.setItem("gemini_chat_history", JSON.stringify(prevPrompt));
 }, [prevPrompt]);

  function newChat(){
    setActiveSessionId(null);
    setCurrentMessages([]);
    setLoading(false);
    typingTimersRef.current.forEach(clearTimeout);
    typingTimersRef.current = [];
  }

  function loadSession(session) {
    typingTimersRef.current.forEach(clearTimeout);
    typingTimersRef.current = [];
    setActiveSessionId(session.id);
    setCurrentMessages(session.messages);
    setLoading(false);
  }

  function deletePrompt(indexToDelete) {
    setPrevPrompt(prev => {
      const deletedSession = prev[indexToDelete];
      if (deletedSession && deletedSession.id === activeSessionId) {
        newChat();
      }
      return prev.filter((_, index) => index !== indexToDelete);
    });
  }

  function clearHistory() {
    setPrevPrompt([]);
    newChat();
  }

  async function sent(input, image = null) {
    // Clear any pending typing timeouts
    typingTimersRef.current.forEach(clearTimeout);
    typingTimersRef.current = [];

    let sessionId = activeSessionId;
    let isNewSession = false;

    if (!sessionId) {
      sessionId = Date.now().toString();
      isNewSession = true;
      setActiveSessionId(sessionId);
    }

    const userMessage = {
      role: "user",
      text: input,
      image: image ? { url: image.url, base64: image.base64, mimeType: image.mimeType } : null
    };

    // Update active messages
    const updatedMessages = [...currentMessages, userMessage];
    setCurrentMessages(updatedMessages);

    // Save to session history list
    if (isNewSession) {
      const newSession = {
        id: sessionId,
        title: input,
        messages: updatedMessages
      };
      setPrevPrompt(prev => [newSession, ...prev]);
    } else {
      setPrevPrompt(prev => prev.map(s => {
        if (s.id === sessionId) {
          return { ...s, messages: updatedMessages };
        }
        return s;
      }));
    }

    setLoading(true);
    setInput('');

    try {
      let response = await run(input, image ? { data: image.base64, mimeType: image.mimeType } : null);
      setLoading(false);

      const aiPlaceholder = { role: "ai", text: "" };
      setCurrentMessages(prev => [...prev, aiPlaceholder]);

      // Save empty placeholder to session history
      setPrevPrompt(prev => prev.map(s => {
        if (s.id === sessionId) {
          return { ...s, messages: [...s.messages, aiPlaceholder] };
        }
        return s;
      }));

      const words = response.split(" ");
      let currentText = "";
      words.forEach((word, index) => {
        const timer = setTimeout(() => {
          currentText += (currentText === "" ? "" : " ") + word;

          setCurrentMessages(prev => {
            const copy = [...prev];
            const lastMsg = copy[copy.length - 1];
            if (lastMsg && lastMsg.role === "ai") {
              lastMsg.text = currentText;
            }
            return copy;
          });

          setPrevPrompt(prev => prev.map(s => {
            if (s.id === sessionId) {
              const updated = [...s.messages];
              const lastMsg = updated[updated.length - 1];
              if (lastMsg && lastMsg.role === "ai") {
                lastMsg.text = currentText;
              }
              return { ...s, messages: updated };
            }
            return s;
          }));
        }, 30 * index);
        typingTimersRef.current.push(timer);
      });
    } catch (error) {
      console.error(error);
      setLoading(false);

      let userFriendlyText = "Error: " + error.message;
      if (error.message.includes("429") || error.message.toLowerCase().includes("quota")) {
        userFriendlyText = "Indo AI has reached its daily free query limit. Please try again tomorrow after 1:30 PM IST! 🌟 (Daily Free Quota Exceeded)";
      } else if (error.message.includes("503") || error.message.toLowerCase().includes("overloaded") || error.message.toLowerCase().includes("demand")) {
        userFriendlyText = "Google servers are currently experiencing high traffic. Please wait a few seconds and try clicking the send button again! ⏳ (503 Service Temporarily Busy)";
      }

      const errorMessage = { role: "ai", text: userFriendlyText };
      setCurrentMessages(prev => [...prev, errorMessage]);
      
      setPrevPrompt(prev => prev.map(s => {
        if (s.id === sessionId) {
          return { ...s, messages: [...s.messages, errorMessage] };
        }
        return s;
      }));
    }
  }

  const data = {
    input,
    setInput,
    sent,
    loading,
    setLoading,
    prevPrompt,
    newChat,
    deletePrompt,
    clearHistory,
    extend,
    setExtend,
    activeSessionId,
    currentMessages,
    loadSession
  };

  return (
    <>
      <dataContext.Provider value={data}>
        {children}
      </dataContext.Provider>
    </>
  );
};

export default UserContext;