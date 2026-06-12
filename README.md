# HUMANEX – Verifying Life Beyond Pixels

HUMANEX is a real-time human verification system designed to detect whether an interacting entity is a **real human or a synthetic AI system**, using **multi-frame behavioral analysis.**

Unlike traditional identity verification systems, HUMANEX focuses on **liveness and behavioral verification**, ensuring the presence of natural human behavior instead of static identity checks.

---

## Live Deployment:

### Frontend (Vercel)
```
https://humanex-ten.vercel.app
```
### Backend API (Render)
```
https://humanex.onrender.com
```
*Note: Backend runs on free tier -> first request may take ~30-50 seconds (cold start)*

---

## Problem Statement:

With the rise of:

- Deepfake videos
- AI-generated avatars
- Voice cloning
- Automated bots

it has become increasingly difficult to distinguish between real humans and synthetic entities.

Traditional methods (CAPTCHA, OTP, static facial recognition) fail to guarantee **true human presence**.

---

## Proposed Solution:

HUMANEX uses **multi-frame behavioral verification** instead of static inputs.

The system analyzes:

- Eye blink patterns (Biological signal)
- Head movement (Behavioral Signal)
- Temporal consistency across frames

This makes it significantly harder for synthetic systems to spoof.

---

## Key Features:

- Real-time webcam-based verification
- Multi-frame analysis 
- Blink detection
- Head movement detection 
- Dynamic challenge-based verification
- Human probability scoring system
- Fully deployed full-stack app

---

## API Usage:

### Endpoint
```
POST /verify
```
### Request Body
```
{
        "frames": ["base64_image1", "base64_image2"],
        "challenge": "blink"
}
```
### Response
```
{
        "human_score": 95,
        "blink_count": 2,
        "movement_count": null,
        "status": "Human Verified"
}
```

---

## Core Idea:

HUMANEX is based on the principle that:

> “Human behavior is naturally inconsistent and difficult to replicate artificially.”

By analyzing **temporal behavioral signals**, the system moves beyond traditional static verification methods.

---

## System Architecture:
```
User (Webcam Input)
        │
        ▼
Frontend (React + WebRTC)
        │
        ▼
Frame Capture (Multi-frame)
        │
        ▼
API Call (FastAPI Backend)
        │
        ▼
Processing Layer
   ├── Biological Signals (Blink)
   ├── Behavioral Signals (Head Movement)
        │
        ▼
Decision Engine
        │
        ▼
Human Score + Status
        │
        ▼
Frontend Display (Verified / Suspicious)
```

---

## Tech Stack:

### Frontend

- React.js
- JavaScript
- WebRTC

### Backend

- FastAPI
- Python

### Computer Vision

- OpenCV
- MediaPipe

---

## Setup Instructions:

### Backend
```
cd backend
pip install -r requirements.txt
uvicorn api.main:app --reload
```

### Frontend
```
cd frontend
npm install
npm run dev
```
---

## Project Status:

- Fully Functional prototype:
- Real-time verification working  
- Frontend <-> Backend deployed

---

## Known Limitations:

- Free-tier backend may sleep (cold start delay)
- Performance depends on lighting and camera quality
- Basic CV logic (no deep learning yet)

---

## Future Improvements:

- Audio-based verification (speech + breathing patterns)
- Behavioral entropy analysis
- Reaction time measurement
- Machine learning-based classifier
- Cloud deployment (Docker + Kubernetes)

---

## Use Cases:

- FinTech authentication
- Online exam proctoring
- Bot detection systems
- Secure digital interactions

---

## Key Insight:

> HUMANEX shifts verification from *“Who are you?”*  
> to *“Are you truly human?”*