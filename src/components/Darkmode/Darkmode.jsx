import { useEffect, useState } from "react";
import { GoSun } from "react-icons/go";
import { FaMoon } from "react-icons/fa";
import "./Darkmode.css";

const Darkmode = () => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("gemini_chat_theme") || "darkmode";
  });

  function toggle() {
    const newMode = mode === "darkmode" ? "lightmode" : "darkmode";
    setMode(newMode);
    localStorage.setItem("gemini_chat_theme", newMode);
  }

  useEffect(() =>{
    document.body.className = mode
  },[mode])

  return (
    <button
    className="darkmodebtn"
      onClick={() => {
        toggle();
      }}
    >
    {mode === 'darkmode' ? <GoSun /> : <FaMoon />} 
    </button>
  );
};

export default Darkmode;
