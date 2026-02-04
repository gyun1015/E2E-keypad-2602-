import { useEffect, useState } from "react";

function App() {
  const [keypadData, setKeypadData] = useState(null);
  // 수정 1: 값(value)이 아닌 클릭한 버튼의 'ID'들을 저장합니다.
  const [inputIds, setInputIds] = useState([]); 

  useEffect(() => {
    // 백엔드 주소 확인 (CORS 설정이 되어 있어야 함)
    fetch("http://127.0.0.1:8000/keypad/init", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setKeypadData(data);
      })
      .catch(console.error);
  }, []);

  if (!keypadData || !keypadData.layout) return <div>Loading keypad...</div>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Secure Keypad (ver.1.0.3)</h2>
      <p style={{ fontSize: "14px", color: "#666" }}>
        Session ID: {keypadData.session_id}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 80px)",
          gap: 10,
          marginTop: 30,
        }}
      >
        {keypadData.layout.map((key) => (
          <button
            // 백엔드에서 준 고유 ID를 React key로 사용
            key={key.id} 
            style={{
              height: 80,
              width: 80,
              padding: 0,
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#fff",
              
              /* 빈 칸도 이미지는 보여주되, 클릭 방지 */
              opacity: 1,
              cursor: key.type === "empty" ? "default" : "pointer",
              pointerEvents: key.type === "empty" ? "none" : "auto",
              
              overflow: "hidden",
            }}
            onClick={() => {
              // 수정 2: value가 없으므로 'key.id'를 저장합니다.
              if (key.type === "number") {
                setInputIds((prev) => [...prev, key.id]);
              }
            }}
          >
            <img
              src={key.image}
              /* 수정 3: 보안상 alt에 실제 값(1, 2 등)을 넣으면 안 됩니다. */
              alt="secure-key" 
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "fill",
                display: "block",
              }}
            />
          </button>
        ))}
      </div>

      {/* 입력 결과 확인창 */}
      <div 
        style={{ 
          marginTop: 30, 
          padding: "15px", 
          background: "#222",
          color: "rgb(215, 255, 215)",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "bold",
          maxWidth: "400px",
          wordBreak: "break-all"
        }}
      >
        <div>Input Status:</div>
        
        {/* 수정 4: 실제 숫자는 프론트엔드가 모릅니다. 마스킹(*) 처리하여 보여줍니다. */}
        <div style={{ fontSize: "2rem", letterSpacing: "5px", margin: "10px 0" }}>
          {inputIds.map((_, index) => (
            <span key={index}>*</span>
          ))}
          {inputIds.length === 0 && <span style={{fontSize: "1rem", color: "#555"}}>(Empty)</span>}
        </div>

        <div style={{ marginTop: "10px", borderTop: "1px solid #444", paddingTop: "10px", fontSize: "0.8rem", color: "#aaa" }}>
           Debugging (Token IDs):<br/>
           {/* 실제로는 이 ID들을 서버로 전송해야 합니다 */}
           {inputIds.length > 0 
             ? inputIds.map(id => id.substring(0, 8) + "...").join(", ") 
             : "No input"}
        </div>
        
        <button 
          onClick={() => setInputIds([])}
          style={{ marginTop: 15, padding: "5px 10px", cursor: "pointer" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default App;