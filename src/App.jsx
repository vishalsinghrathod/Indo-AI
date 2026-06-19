import { useState } from "react";
import "./App.css";
import ChatSection from "./components/chatSection/ChatSection";
import Seperation from "./components/seperation/Seperation";
import Sidebar from "./components/sidebar/Sidebar";
import NameModal from "./components/NameModal/NameModal";

function App() {
  const [userName, setUserName] = useState("");

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
