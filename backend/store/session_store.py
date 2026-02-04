import time
import threading

# 전역 세션 저장소
SESSION_STORE = {}
# 동시성 제어를 위한 락
store_lock = threading.Lock()

def _cleanup_expired_sessions():
    """1분마다 만료된 세션을 청소하는 백그라운드 작업"""
    while True:
        time.sleep(60)
        current_time = time.time()
        with store_lock:
            # 만료된 키 수집
            expired_keys = [
                k for k, v in SESSION_STORE.items() 
                if v["expires_at"] < current_time
            ]
            # 삭제 수행
            for k in expired_keys:
                del SESSION_STORE[k]
            
            if expired_keys:
                print(f"🧹 [Auto Cleanup] Deleted {len(expired_keys)} expired sessions.")

# 서버 시작 시 청소부 스레드 가동 (데몬 스레드)
cleanup_thread = threading.Thread(target=_cleanup_expired_sessions, daemon=True)
cleanup_thread.start()

def save_session(session_id: str, data: dict, ttl: int = 180):
    with store_lock:
        SESSION_STORE[session_id] = {
            "data": data,
            "expires_at": time.time() + ttl
        }

def get_session(session_id: str):
    with store_lock:
        session = SESSION_STORE.get(session_id)
        
        if not session:
            return None

        # 조회 시점에도 만료 체크
        if session["expires_at"] < time.time():
            del SESSION_STORE[session_id]
            return None

        return session["data"]