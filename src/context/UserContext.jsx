import { createContext, useState, useEffect, useRef } from "react";
import run from "../gemini";

export const dataContext = createContext();

const UserContext = ({children}) => {
const [input, setInput] = useState("");
 const [showResult, setShowResult] = useState(false);
 const [loading, setLoading] = useState(false);
 const [resultData, setResultData] = useState("");
 const [recentPrompt, setRecentPrompt] = useState("");
 const [recentImage, setRecentImage] = useState(null);
 const typingTimersRef = useRef([]);
 const [prevPrompt, setPrevPrompt] = useState(() => {
   try {
     const stored = localStorage.getItem("gemini_chat_history");
     return stored ? JSON.parse(stored) : [];
   } catch (e) {
     return [];
   }
 });

 useEffect(() => {
   localStorage.setItem("gemini_chat_history", JSON.stringify(prevPrompt));
 }, [prevPrompt]);


  function newChat(){
   setShowResult(false)
   setLoading(false)
   setRecentImage(null)
  }

  function deletePrompt(indexToDelete) {
    setPrevPrompt(prev => {
      const deletedPrompt = prev[indexToDelete];
      if (deletedPrompt === recentPrompt) {
        newChat();
      }
      return prev.filter((_, index) => index !== indexToDelete);
    });
  }

  function clearHistory() {
    setPrevPrompt([]);
    newChat();
  }

  async function sent(input, image = null, addToHistory = true) {
    // Clear any pending typing timeouts
    typingTimersRef.current.forEach(clearTimeout);
    typingTimersRef.current = [];

    setResultData("")
    setShowResult(true)
    setRecentPrompt(input)
    setRecentImage(image)
    setLoading(true)
    if (addToHistory) {
      setPrevPrompt(prev => {
        if (prev.includes(input)) return prev;
        return [...prev, input];
      });
    }
    try {
      let response = await run(input, image ? { data: image.base64, mimeType: image.mimeType } : null)
      setLoading(false)
      
      const words = response.split(" ");
      setResultData("");
      words.forEach((word, index) => {
        const timer = setTimeout(() => {
          setResultData(prev => prev + (index === 0 ? "" : " ") + word);
        }, 40 * index);
        typingTimersRef.current.push(timer);
      });
    } catch (error) {
      console.error(error)
      setResultData("Error: " + error.message)
      setLoading(false)
    } finally {
      setInput('')
    }
  }

  const data = {
    input,
    setInput,
    sent,
    loading,
    setLoading,
    showResult,
    setShowResult,
    resultData,
    setResultData,
    recentPrompt,
    setRecentPrompt,
    prevPrompt,
    newChat,
    deletePrompt,
    clearHistory,
    recentImage,
    setRecentImage
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