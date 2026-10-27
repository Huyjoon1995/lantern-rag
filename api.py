import json
import urllib.error
import urllib.request

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Lantern API")

# Allow our React frontend to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=8000)


class ChatResponse(BaseModel):
    answer: str


@app.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest):
    question = body.question.strip()

    if not question:
        raise HTTPException(
            status_code=422,
            detail="Please enter a question.",
        )

    payload = {
        "model": "qwen3:4b-instruct-2507-q4_K_M",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant. Answer clearly.",
            },
            {"role": "user", "content": question},
        ],
        "stream": False,
    }

    request = urllib.request.Request(
        url="http://localhost:11434/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail="Ollama rejected the request. Check that the model is installed.",
        ) from error
    except (TimeoutError, urllib.error.URLError) as error:
        raise HTTPException(
            status_code=503,
            detail="Ollama is unavailable or timed out. Check that it is running.",
        ) from error

    return ChatResponse(answer=result["message"]["content"])