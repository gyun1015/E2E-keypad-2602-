import base64
import secrets
import uuid
from pathlib import Path

# 경로 설정 (현재 파일 위치 기준 static 폴더 찾기)
BASE_DIR = Path(__file__).resolve().parent.parent 
STATIC_DIR = BASE_DIR / "static"

# 이미지 캐시 저장소
IMAGE_CACHE = {}

def load_images_to_memory():
    """서버 시작 시 static 폴더의 이미지를 메모리로 로드"""
    print("📂 Loading keypad images into memory...")
    
    # 0~9 이미지 로드
    for n in range(10):
        path = STATIC_DIR / f"{n}.png"
        try:
            with open(path, "rb") as f:
                encoded = base64.b64encode(f.read()).decode('utf-8')
                IMAGE_CACHE[str(n)] = f"data:image/png;base64,{encoded}"
        except FileNotFoundError:
            print(f"❌ Error: {path} not found!")

    # empty 이미지 로드
    try:
        with open(STATIC_DIR / "empty.png", "rb") as f:
            encoded = base64.b64encode(f.read()).decode('utf-8')
            IMAGE_CACHE["empty"] = f"data:image/png;base64,{encoded}"
    except FileNotFoundError:
         print(f"❌ Error: empty.png not found!")

# 모듈 import 시 자동 실행
load_images_to_memory()

def generate_keypad():
    """
    Returns:
        client_layout (list): 프론트엔드 전송용 (value 없음, 이미지 포함)
        server_map (dict): 세션 저장용 (ID -> value 매핑)
    """
    raw_keys = []
    
    # 1. 숫자 키 생성 (0~9)
    for n in range(10):
        raw_keys.append({
            "type": "number",
            "image": IMAGE_CACHE.get(str(n), ""),
            "value": str(n),
            "id": uuid.uuid4().hex
        })

    # 2. 빈 키 생성 (2개)
    for _ in range(2):
        raw_keys.append({
            "type": "empty",
            "image": IMAGE_CACHE.get("empty", ""),
            "value": "",
            "id": uuid.uuid4().hex
        })

    # 3. [보안] 암호학적으로 안전한 섞기
    secrets.SystemRandom().shuffle(raw_keys)

    # 4. 데이터 분리 (Client용 vs Server용)
    client_layout = []
    server_map = {}

    for item in raw_keys:
        # 클라이언트용: value 절대 포함 금지
        client_layout.append({
            "id": item["id"],
            "type": item["type"],
            "image": item["image"]
        })
        
        # 서버용: 숫자인 경우에만 ID와 값 매핑
        if item["type"] == "number":
            server_map[item["id"]] = item["value"]

    return client_layout, server_map