import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [keypadData, setKeypadData] = useState(null);
  const [inputIds, setInputIds] = useState([]);
  const MAX_INPUT_LENGTH = 4; // 4자리로 수정

  useEffect(() => {
    fetch("http://127.0.0.1:8000/keypad/init", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setKeypadData(data);
      })
      .catch(console.error);
  }, []);

  const handleKeyClick = (key) => {
    if (key.type === "number" && inputIds.length < MAX_INPUT_LENGTH) {
      setInputIds((prev) => [...prev, key.id]);
    }
  };

  if (!keypadData || !keypadData.layout) {
    return <div className="loading-screen">보안 연결 중...</div>;
  }

  return (
    <div className="container-wrapper">
      <div className="keypad-container">
        <header className="keypad-header">
          <h2>비밀번호 입력</h2>
          <p>4자리 번호를 입력해주세요.</p>
        </header>

        <div className="input-display">
          {[...Array(MAX_INPUT_LENGTH)].map((_, i) => (
            <div
              key={i}
              className={`input-dot ${i < inputIds.length ? "active" : ""}`}
            />
          ))}
        </div>

        <div className="keypad-grid">
          {keypadData.layout.map((key) => (
            <button
              key={key.id}
              className={`key-button ${key.type === "empty" ? "empty" : ""}`}
              onClick={() => handleKeyClick(key)}
              disabled={key.type === "empty"}
            >
              <img src={key.image} alt="" draggable={false} />
            </button>
          ))}
        </div>

        <footer className="keypad-footer">
          <button className="reset-button" onClick={() => setInputIds([])}>
            초기화
          </button>
        </footer>
      </div>

      {/* 디버깅 패널: 4자리 입력 시 전체 ID 노출 */}
      {inputIds.length === MAX_INPUT_LENGTH && (
        <div className="debug-panel">
          <h4>Debugging Mode (Full Token IDs)</h4>
          <div className="token-list">
            {inputIds.map((id, index) => (
              <div key={index} className="token-item">
                <span className="token-index">[{index + 1}]</span> {id}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;