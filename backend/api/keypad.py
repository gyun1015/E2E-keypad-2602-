from fastapi import APIRouter, HTTPException
import uuid

from models.keypad import KeypadResponse
from services.keypad_service import generate_keypad
from store.session_store import save_session

router = APIRouter()

@router.post("/init", response_model=KeypadResponse)
def init_keypad():
    try:
        # 1. 키패드 생성 (문제지와 답안지 분리)
        # client_layout: 이미지와 ID만 있음 (보안 안전)
        # server_map: ID와 실제 숫자 매핑 (서버만 가짐)
        client_layout, server_map = generate_keypad()
        
        # 2. 세션 ID 생성
        session_id = uuid.uuid4().hex
        
        # 3. 서버에 답안지 저장 (TTL 3분)
        save_session(session_id, server_map, ttl=180)

        # 4. 클라이언트에 문제지 전송
        return {
            "session_id": session_id,
            "layout": client_layout,
            "expires_in": 180
        }
        
    except Exception as e:
        print(f"Keypad Init Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")