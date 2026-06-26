import os, requests, uuid, urllib.parse
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
UNSPLASH_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

def get_ai_response(user_input, mode="explain"):
    try:
        if mode == "explain":
            system_prompt = "You are 'Shiksha Sahayak'. Explain topics deeply in 5-6 points using Hinglish. Format: [CONTENT] explanation... [VISUAL] image keyword"
        else:
            system_prompt = """You are a Quiz Master. 
            RULES: 
            1. Generate exactly 4 MCQs in Hinglish. 
            2. You MUST separate every question using the [SEP] tag.
            3. You MUST separate every answer using the [SEP] tag inside the [ANSWER] section.
            Format Example: [CONTENT] Q1 [SEP] Q2 [SEP] Q3 [SEP] Q4 [ANSWER] Ans1 [SEP] Ans2 [SEP] Ans3 [SEP] Ans4 [VISUAL] quiz"""

        response = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_input}],
            model="llama-3.3-70b-versatile",
            temperature=0.3
        )
        res = response.choices[0].message.content
        
        # Robust Parsing Logic
        ans_part = ""
        if "[ANSWER]" in res:
            ans_part = res.split("[ANSWER]")[1].split("[VISUAL]")[0].strip()
        
        content_part = res
        if "[CONTENT]" in res:
            content_part = res.split("[CONTENT]")[1].split("[ANSWER]")[0].split("[VISUAL]")[0].strip()

        img_key = user_input
        if "[VISUAL]" in res:
            img_key = res.split("[VISUAL]")[1].strip()

        # --- यहाँ से IMAGE FIX शुरू है ---
        # 1. डिफॉल्ट फोटो लिंक (Back-up)
        img_url = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000"
        
        if UNSPLASH_KEY:
            try:
                # कीवर्ड को साफ़ करना (ब्रैकेट्स हटाना)
                clean_term = img_key.replace("[", "").replace("]", "").strip()
                # URL के लिए कीवर्ड को सुरक्षित बनाना (Encoding)
                encoded_query = urllib.parse.quote(f"{clean_term} education diagram")
                
                search_url = f"https://api.unsplash.com/search/photos?query={encoded_query}&client_id={UNSPLASH_KEY}&per_page=1"
                
                print(f"📸 Searching Unsplash for: {clean_term}")
                r = requests.get(search_url, timeout=5).json()
                
                if r.get('results') and len(r['results']) > 0:
                    img_url = r['results'][0]['urls']['regular']
                    print("✅ Image link found!")
                else:
                    print(f"⚠️ No results for {clean_term}, using default.")
            except Exception as e:
                print(f"🚨 Unsplash Error: {e}")
        # --- IMAGE FIX खत्म ---

        return {"mode": mode, "content": content_part, "answer": ans_part, "image": img_url}
    except Exception as e:
        print(f"🚨 Backend AI Error: {e}")
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
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)