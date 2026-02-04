from pydantic import BaseModel
from typing import List

class Key(BaseModel):
    type: str              # "number" | "empty"
    image: str             # Base64 encoded image string
    id: str                # UUID (서버로 전송할 식별자)
    # ❌ value 필드 삭제됨 (보안 필수)

class KeypadResponse(BaseModel):
    session_id: str
    layout: List[Key]      # value가 없는 안전한 키패드 리스트
    expires_in: int