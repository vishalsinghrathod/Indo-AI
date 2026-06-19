import { useState, useEffect } from "react";
import "./App.css";
import ChatSection from "./components/chatSection/ChatSection";
import Seperation from "./components/seperation/Seperation";
import Sidebar from "./components/sidebar/Sidebar";
import NameModal from "./components/NameModal/NameModal";

function App() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty("--viewport-height", `${vh}px`);
    };

    const handleScroll = () => {
      // Prevent body/document scroll on mobile from pushing elements off screen
      window.scrollTo(0, 0);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
    }
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    
    handleResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {!userName ? (
        <NameModal onSubmit={setUserName}/>
      ) : (
        <>
          <Sidebar />
          <Seperation />
          <ChatSection  userName = {userName}/>
        </>
      )}
    </>
  );
}

export default App;
