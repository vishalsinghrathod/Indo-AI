import "./Sidebar.css";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaPlus } from "react-icons/fa6";
import { FaRegMessage } from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import { useContext, useState } from "react";
import { dataContext } from "../../context/UserContext";
import { TbReceiptYuan } from "react-icons/tb";

const Sidebar = () => {
  const [extend, setExtend] = useState(false);
  const { sent, prevPrompt, newChat, deletePrompt, clearHistory } = useContext(dataContext);

  async function loadPrevPromt(prompt) {
    sent(prompt, null, false);
  }

  return (
    <>
      <div className={`sidebar ${extend ? "extended" : ""}`}>
        <div className="menu-icon-container">
          <GiHamburgerMenu
            id="hamburger"
            onClick={() => {
              setExtend((prev) => !prev);
            }}
          />
        </div>

        <div
          className="newChat"
          onClick={() => {
            newChat();
          }}
          title="New Chat"
        >
          <FaPlus />
          <span className="sidebar-text">New Chat</span>
        </div>

        <div className="recent-container">
          {extend && <p className="recent-title">Recent Queries</p>}
          <div className="recent-list">
            {prevPrompt.map((item, index) => {
              return (
                <div key={index} className="recent-wrapper">
                  <div
                    className="recent"
                    onClick={() => {
                      loadPrevPromt(item);
                    }}
                    title={item}
                  >
                    <FaRegMessage />
                    <span className="sidebar-text">{item}</span>
                  </div>
                  {extend && (
                    <button
                      className="delete-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePrompt(index);
                      }}
                      title="Delete Chat"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {extend && prevPrompt.length > 0 && (
          <div className="clear-history-btn" onClick={clearHistory}>
            <FiTrash2 />
            <span>Clear All History</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
