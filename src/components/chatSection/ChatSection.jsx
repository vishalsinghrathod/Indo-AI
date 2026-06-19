import { IoMdSend } from "react-icons/io";
import "./ChatSection.css";
import Darkmode from "../Darkmode/Darkmode";
import { useContext, useState, useEffect, useRef } from "react";
import { dataContext } from "../../context/UserContext";
import user from "../../assets/user.png";
import ai from "../../assets/ai.png";
import { FaRegCopy, FaVolumeUp, FaVolumeMute, FaMicrophone, FaCamera, FaTimes } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";

const formatResponse = (text) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const ChatSection = ({ userName }) => {
  let { sent, input, setInput, showResult, resultData, recentPrompt, loading, recentImage, extend, setExtend } =
    useContext(dataContext);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  const fileInputRef = useRef(null);

  const suggestions = [
    { text: "Help me design a premium dark theme dashboard UI", icon: "🎨" },
    { text: "Explain quantum computing in simple terms", icon: "💡" },
    { text: "Write a clean JavaScript helper function to format dates", icon: "💻" },
    { text: "Give me 5 creative ideas for a personal project portfolio", icon: "🚀" }
  ];

  // Stop speaking when prompt changes or component unmounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [recentPrompt]);

  // Speech Synthesis - Read Aloud function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const cleanText = text.replace(/\*\*/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Speech synthesis is not supported in this browser.");
    }
  };

  // Speech Recognition - Voice Typing function
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition (Voice Typing) is not supported in this browser.");
      return;
    }
    if (isListening) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => {
        const separator = prev.trim() ? " " : "";
        return prev + separator + transcript;
      });
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Handle image upload and camera snapshots
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        setImageFile({
          url: URL.createObjectURL(file),
          base64: base64Data,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (input.trim() || imageFile) {
      sent(input, imageFile);
      setImageFile(null);
    }
  };

  return (
    <>
      <div className="chatSection">
        <div className="chatHeader">
          <div className="header-brand-wrapper">
            <button className="hamburger-btn" onClick={() => setExtend(true)} title="Open Menu">
              <GiHamburgerMenu />
            </button>
            <div className="header-brand">
              <span className="brand-logo">✨</span>
              <span className="brand-text">Indo AI</span>
            </div>
          </div>
          <Darkmode />
        </div>

        <div className="topsection">
          {!showResult ? (
            <div className="initial-screen">
              <div className="headings">
                <span>Hello {userName || "Guest"},</span>
                <span>I'm your AI Assistant</span>
                <span className="subtitle">What can I help you build or explore today?</span>
              </div>
              <div className="suggestions-grid">
                {suggestions.map((sug, i) => (
                  <div key={i} className="suggestion-card" onClick={() => sent(sug.text)}>
                    <span className="sug-icon">{sug.icon}</span>
                    <p className="sug-text">{sug.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="result-container">
              <div className="chat-bubble-row user-row">
                <div className="user-bubble">
                  {recentImage && (
                    <div className="chat-image-wrapper">
                      <img src={recentImage.url} className="chat-sent-image" alt="Uploaded Attachment" />
                    </div>
                  )}
                  <p>{recentPrompt}</p>
                </div>
                <img src={user} className="avatar user-avatar" alt="User" />
              </div>

              <div className="chat-bubble-row ai-row">
                <img src={ai} className="avatar ai-avatar" alt="AI" />
                <div className="ai-bubble">
                  {loading ? (
                    <div className="loader">
                      <div className="shimmer-line line-1"></div>
                      <div className="shimmer-line line-2"></div>
                      <div className="shimmer-line line-3"></div>
                    </div>
                  ) : (
                    <div className="response-content">
                      <p className="response-text">{formatResponse(resultData)}</p>
                      
                      <div className="ai-actions-row">
                        <button 
                          className={`audio-btn ${isSpeaking ? 'speaking' : ''}`} 
                          onClick={() => speakText(resultData)}
                          title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                        >
                          {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
                        </button>
                        <button 
                          className="copy-btn" 
                          onClick={() => {
                            navigator.clipboard.writeText(resultData);
                            alert('Copied to clipboard');
                          }}
                          title="Copy Response"
                        >
                          <FaRegCopy />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bottomsection">
          {imageFile && (
            <div className="image-preview-container">
              <img src={imageFile.url} className="image-preview-thumbnail" alt="Preview" />
              <button className="remove-image-btn" onClick={() => setImageFile(null)} title="Remove Image">
                <FaTimes />
              </button>
            </div>
          )}

          <div className="input-box-wrapper">
            <input
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder="Ask anything or attach a photo..."
              value={input}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: "none" }} 
            />

            <button
              className="attach-button"
              onClick={() => fileInputRef.current.click()}
              title="Upload Photo / Take Capture"
            >
              <FaCamera />
            </button>

            <button
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={startListening}
              title={isListening ? "Listening..." : "Voice Typing"}
            >
              <FaMicrophone />
            </button>
            
            <button
              className={`send-button ${input.trim() || imageFile ? 'active' : ''}`}
              onClick={handleSend}
              disabled={!input.trim() && !imageFile}
            >
              <IoMdSend />
            </button>
          </div>
          <p className="footer-disclaimer">Indo AI may produce inaccurate info. Verify its outputs.</p>
        </div>
      </div>
    </>
  );
};

export default ChatSection;
