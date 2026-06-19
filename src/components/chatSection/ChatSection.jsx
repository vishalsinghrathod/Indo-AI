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
  let { sent, input, setInput, loading, extend, setExtend, currentMessages } =
    useContext(dataContext);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const topSectionRef = useRef(null);

  const suggestions = [
    { text: "Help me design a premium dark theme dashboard UI", icon: "🎨" },
    { text: "Explain quantum computing in simple terms", icon: "💡" },
    { text: "Write a clean JavaScript helper function to format dates", icon: "💻" },
    { text: "Give me 5 creative ideas for a personal project portfolio", icon: "🚀" }
  ];

  // Auto scroll to bottom when new messages load or stream
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [currentMessages, loading]);

  useEffect(() => {
  if (topSectionRef.current) {
    topSectionRef.current.scrollTop =
      topSectionRef.current.scrollHeight;
  }
}, [currentMessages, loading]);

  // Stop speaking when unmounted
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speech Synthesis - Read Aloud function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && currentSpeakingText === text) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentSpeakingText("");
      } else {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/\*\*/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        utterance.onend = () => {
          setIsSpeaking(false);
          setCurrentSpeakingText("");
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          setCurrentSpeakingText("");
        };
        
        setIsSpeaking(true);
        setCurrentSpeakingText(text);
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
   
        <div className="topsection" ref={topSectionRef}>
          {currentMessages.length === 0 ? (
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
              {currentMessages.map((msg, i) => {
                if (msg.role === "user") {
                  return (
                    <div key={i} className="chat-bubble-row user-row">
                      <div className="user-bubble">
                        {msg.image && (
                          <div className="chat-image-wrapper">
                            <img src={msg.image.url} className="chat-sent-image" alt="Uploaded Attachment" />
                          </div>
                        )}
                        <p>{msg.text}</p>
                      </div>
                      <img src={user} className="avatar user-avatar" alt="User" />
                    </div>
                  );
                } else {
                  return (
                    <div key={i} className="chat-bubble-row ai-row">
                      <img src={ai} className="avatar ai-avatar" alt="AI" />
                      <div className="ai-bubble">
                        <div className="response-content">
                          <p className="response-text">{formatResponse(msg.text)}</p>
                          
                          {msg.text && (
                            <div className="ai-actions-row">
                              <button 
                                className={`audio-btn ${isSpeaking && currentSpeakingText === msg.text ? 'speaking' : ''}`} 
                                onClick={() => speakText(msg.text)}
                                title={isSpeaking && currentSpeakingText === msg.text ? "Stop Speaking" : "Read Aloud"}
                              >
                                {isSpeaking && currentSpeakingText === msg.text ? <FaVolumeMute /> : <FaVolumeUp />}
                              </button>
                              <button 
                                className="copy-btn" 
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.text);
                                  alert('Copied to clipboard');
                                }}
                                title="Copy Response"
                              >
                                <FaRegCopy />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
              
              {loading && (
                <div className="chat-bubble-row ai-row">
                  <img src={ai} className="avatar ai-avatar" alt="AI" />
                  <div className="ai-bubble">
                    <div className="loader">
                      <div className="shimmer-line line-1"></div>
                      <div className="shimmer-line line-2"></div>
                      <div className="shimmer-line line-3"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
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
