import { useState } from "react";
import "./NameModal.css";

const NameModal = ({ onSubmit }) => {
  const [name, setName] = useState("");

  function handleSubmit() {
    if (name.trim() !== "") {
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
        />
        <button onClick={handleSubmit}>Continue</button>
      </div>
    </div>
  );
};

export default NameModal;
