import { useState } from "react";
import "./NameModal.css";

const NameModal = ({ onSubmit }) => {
  const [name, setName] = useState("");

  function handleSubmit() {
    if (name.trim() !== "") {
      // Blur the input to hide the keyboard and restore viewport before transition
      if (document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
      }
      onSubmit(name.trim());
    } else {
      alert("Name is require!")
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Welcome to Indo AI</h2>
        <p>Enter your name to begin your session</p>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />
        <button onClick={handleSubmit}>Continue</button>
      </div>
    </div>
  );
};

export default NameModal;
