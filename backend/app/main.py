from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, mail, ai

app = FastAPI(title="NEBULAMAIL AI Backend")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"], # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(mail.router, prefix="/api/mail", tags=["mail"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
