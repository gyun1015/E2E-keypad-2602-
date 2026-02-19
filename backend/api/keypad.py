from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
from models.keypad import KeypadResponse
from services.keypad_service import generate_keypad
from store.session_store import save_session, get_session

router = APIRouter()

class SubmitRequest(BaseModel):
    session_id: str
    payload: str

@router.post("/init", response_model=KeypadResponse)
def init_keypad():
    try:
        client_layout, server_map = generate_keypad()
        session_id = uuid.uuid4().hex
        
        # 세션 저장 (3분 유지)
        save_session(session_id, server_map, ttl=180)

        return {
            "session_id": session_id,
            "layout": client_layout,
            "expires_in": 180
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/submit")
def submit_keypad(data: SubmitRequest):
    # 1. 정답지(Mapping) 조회
    server_map = get_session(data.session_id)
    if not server_map:
        raise HTTPException(status_code=400, detail="유효하지 않은 세션입니다.")

    # 2. 은행사로 보낼 최종 패키지 (이 데이터를 은행 API로 전송하면 됩니다)
    final_data = {
        "encrypted_payload": data.payload,
        "keypad_mapping": server_map
    }

    # 콘솔에는 핵심 데이터만 간결하게 출력
    print(f"🚀 Forwarding to Bank: {data.session_id}")
    
    return {"status": "success"}