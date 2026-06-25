import os, requests, uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
UNSPLASH_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

def get_ai_response(user_input, mode="explain"):
    try:
        if mode == "explain":
            system_prompt = "You are 'Shiksha Sahayak'. Explain topics deeply in 5-6 points using Hinglish. Format: [CONTENT] explanation... [VISUAL] image keyword"
        else:
            system_prompt = """You are a Quiz Master. 
            RULES: 
            1. Generate exactly 4 MCQs. 
            2. Separate questions with [SEP]. 
            3. Separate answers with [SEP].
            Format: [CONTENT] Q1 [SEP] Q2 [SEP] Q3 [SEP] Q4 [ANSWER] A1 [SEP] A2 [SEP] A3 [SEP] A4 [VISUAL] quiz"""

        response = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_input}],
            model="llama-3.3-70b-versatile",
            temperature=0.3
        )
        res = response.choices[0].message.content
        
        # Robust Parsing
        ans_part = res.split("[ANSWER]")[1].split("[VISUAL]")[0].strip() if "[ANSWER]" in res else ""
        content_part = res.split("[CONTENT]")[1].split("[ANSWER]")[0].split("[VISUAL]")[0].strip() if "[CONTENT]" in res else res
        img_key = res.split("[VISUAL]")[1].strip() if "[VISUAL]" in res else user_input

        return {"mode": mode, "content": content_part, "answer": ans_part, "image": img_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-audio")
async def process_audio(file: UploadFile = File(...), mode: str = "explain"):
    name = f"voice_{uuid.uuid4().hex}.wav"
    try:
        content = await file.read()
        with open(name, "wb") as f: f.write(content)
        with open(name, "rb") as f:
            trans = client.audio.transcriptions.create(file=(name, f), model="whisper-large-v3", language="hi")
        if os.path.exists(name): os.remove(name)
        return get_ai_response(trans.text, mode)
    except Exception as e:
        if os.path.exists(name): os.remove(name)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-text")
async def process_text(data: dict):
    return get_ai_response(data.get("text"), data.get("mode", "explain"))

if __name__ == "__main__":
    import uvicorn
    import os
    # Render खुद पोर्ट असाइन करता है, इसलिए os.environ.get इस्तेमाल करें
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)