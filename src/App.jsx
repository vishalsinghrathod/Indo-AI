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
      // Scroll to 0,0 on resize (e.g. keyboard close)
      window.scrollTo(0, 0);
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    const handleScroll = () => {
      // Force visual/layout viewport scroll to (0, 0)
      window.scrollTo(0, 0);
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleScroll);
    }
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    const handleFocusIn = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        setTimeout(() => {
          window.scrollTo(0, 0);
          if (document.body) {
            document.body.scrollTop = 0;
          }
        }, 80);
      }
    };

    const handleFocusOut = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        setTimeout(() => {
          window.scrollTo(0, 0);
          if (document.body) {
            document.body.scrollTop = 0;
          }
        }, 80);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    
    handleResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  useEffect(() => {
    // Reset scroll when transitioning from NameModal to ChatSection
    const reset = () => {
      window.scrollTo(0, 0);
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };
    
    reset();
    
    // Multiple resets to catch keyboard closure viewport restoration
    const intervals = [50, 100, 200, 300, 500];
    const timers = intervals.map(delay => setTimeout(reset, delay));
    
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [userName]);

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
