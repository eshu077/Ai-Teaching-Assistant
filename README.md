# 🌟 Shiksha Sahayak: AI-Powered Teaching Assistant
> **A Hands-free, Voice-enabled AI Co-pilot for Haryana Government Schools.**

---

## 🚀 Live Demo
- **Frontend (Vercel):** [https://ai-teaching-assistant-henna.vercel.app/](https://ai-teaching-assistant-henna.vercel.app/)
- **Backend API (Render):** [https://ai-teaching-assistant-1snv.onrender.com](https://ai-teaching-assistant-1snv.onrender.com)

---

## 🎯 Project Context
In rural and semi-urban schools of Haryana, students often communicate in **Hinglish** (a mix of Hindi and English). Teachers need a tool that can explain complex NCERT concepts simply, provide visuals for better retention, and conduct quick verbal assessments without leaving the blackboard.

### ✅ Requirements Implemented (Option A):
1. **Live Concept Simplification:** Conversational Hinglish explanations with real-time projected visuals.
2. **Voice-Triggered Quizzing:** Interactive verbal quiz generation (4 MCQs) with on-screen "Show Answer" and "Next" navigation.

---

## ✨ Key Features
- 🎙️ **Hands-Free Experience:** Teachers can trigger explanations or quizzes using only their voice.
- 🖼️ **Visual Learning:** Integrates with the Unsplash API to show high-quality educational diagrams.
- ⌨️ **Multimodal Input:** Supports both Voice (Mic) and Text input.
- 📱 **Smart Board Optimized:** Large typography and high-contrast UI for maximum visibility in a classroom.
- ⚡ **Interactive Quiz:** Generates 4 relevant MCQs per topic with a hidden answer key.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Axios, CSS3 (Modern Light Theme).
- **Backend:** Python, FastAPI, Uvicorn.
- **AI Brain (LLM):** Groq Cloud - **Llama 3.3 (70B)**.
- **Speech-to-Text (STT):** Groq **Whisper-large-v3**.
- **Image Engine:** Unsplash Search API.
- **Text-to-Speech (TTS):** Native Browser Speech Synthesis.

---

## 🎤 Mandatory Permissions
> [!IMPORTANT]  
> For the full hands-free experience, **Microphone access is mandatory**.
- When the website loads, the browser will ask for Microphone permission. Click **"Allow"**.
- Ensure you are using **HTTPS** (Vercel provides this by default).

---

## ⚙️ Installation & Local Setup

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 📖 How to Use

Select Mode: Choose between Teaching Mode (to explain) or Quiz Mode (for assessment) from the sidebar.
Give Command: Tap the Mic icon, speak your topic (e.g., "बच्चों को Solar System के बारे में समझाओ"), and tap the Stop button.
Learn: AI will display a relevant image and explain the topic in simple Hinglish bullet points.
Interactive Quiz: In Quiz mode, AI generates 4 slides. Click Show Answer to reveal and Next to move forward.

### 🛡️ Security
This project uses .env for API key management. The .gitignore file ensures that sensitive credentials are never pushed to public repositories.

### 👨‍💻 Built By
ESHU SHARMA
CDF Technical Assignment Round 2
📅 Date: June 25, 2024
