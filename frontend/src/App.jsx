import { useEffect, useState } from "react";
import JSEncrypt from "jsencrypt"; 
import "./App.css";

function App() {
  const [keypadData, setKeypadData] = useState(null);
  const [inputIds, setInputIds] = useState([]);
  const MAX_INPUT_LENGTH = 4;

  // 1. 초기 키패드 데이터 로드
  useEffect(() => {
    fetch("http://127.0.0.1:8000/keypad/init", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setKeypadData(data);
      })
      .catch(console.error);
  }, []);

  // 2. 버튼 클릭 핸들러
  const handleKeyClick = (key) => {
    if (key.type === "number" && inputIds.length < MAX_INPUT_LENGTH) {
      setInputIds((prev) => [...prev, key.id]);
    }
  };

  // 3. 4자리 입력 완료 시 E2E 암호화 및 전송
  useEffect(() => {
    if (inputIds.length === MAX_INPUT_LENGTH && keypadData) {
      
      // RSA 2048-bit 공개키 넣기
      const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlkRYfY11qKTGFvV0mAqj
1sc2Gg+ZnVjHwSzyBThH+2UIY9MhZRWf1FvQFIzFGLbwlPV8sMuvZaeOoJzg/zkO
VtiiwSEqbqvK8lXdm4ne1REIzlbDJYcubgD2/VtOK6nJK/S40IyxdYiof73zjPb6
try31qIj+Pvsbs7snOf67Mk/u8cQWMFmzWGyrkpcbQry8axvBhdfd9z2nxdQUvke
8RQkHxZ352I2j/beqmz3ytenaIDKEXFnQMWRtHq4N4gMtOAis2/syIcXfxs6M74t
rodoV6Ff1NHYoW4d+T5IUQ5QsZ/4IAuB0pGCOFTYsBuNr91hoJhKnLZEtf2qXOe1
gQIDAQAB
-----END PUBLIC KEY-----`;
const encryptor = new JSEncrypt();
      encryptor.setPublicKey(publicKey);
      const pureTokenString = inputIds.join(',');
      
      console.log("암호화 전 평문 : ");
      console.log(pureTokenString);

      // 암호화 진행
      const encryptedData = encryptor.encrypt(pureTokenString);

      if (encryptedData) {
        console.log("암호화 성공! 서버로 전송합니다.");
        console.log("암호문:", encryptedData);
        
        // 백엔드 전송
        fetch("http://127.0.0.1:8000/keypad/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            session_id: keypadData.session_id, 
            payload: encryptedData 
          })
        })
        .then(res => res.json())
        .then(data => console.log("서버 응답:", data))
        .catch(console.error);

      } else {
        console.error("암호화 실패: 공개키가 올바른지 확인해주세요.");
      }
    }
  }, [inputIds, keypadData]);

  // UI 렌더링
  if (!keypadData || !keypadData.layout) return <div className="loading-screen">보안 연결 중...</div>;

  return (
    <div className="container-wrapper">
      <div className="keypad-container">
        <header className="keypad-header">
          <h2>비밀번호 입력</h2>
          <p>4자리 번호를 입력해주세요.</p>
        </header>

        <div className="input-display">
          {[...Array(MAX_INPUT_LENGTH)].map((_, i) => (
            <div key={i} className={`input-dot ${i < inputIds.length ? "active" : ""}`} />
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
          <button className="reset-button" onClick={() => setInputIds([])}>초기화</button>
        </footer>
      </div>
    </div>
  );
}

export default App;