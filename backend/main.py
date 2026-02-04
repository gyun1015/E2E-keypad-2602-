from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.keypad import router as keypad_router
import os

app = FastAPI()

# 환경 변수 혹은 기본값 사용
origins = [
    "http://localhost:5173",  # React Default Port
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "E2E Secure Keypad"}

# 라우터 등록
app.include_router(keypad_router, prefix="/keypad")