from feature_extraction.head_pose import get_head_movement
from feature_extraction.blink_detection import detect_blink

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
import random
import base64
import cv2
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://humanex-ten.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FrameData(BaseModel):
    frames: list[str]
    challenge: str | None = None
    challenge_id: str | None = None

CHALLENGES = [
    {
        "id": "blink_challenge",
        "kind": "blink_twice",
        "prompt": "Blink twice within the next 5 seconds",
        "window_hint": "Look directly at the camera and blink."
    },
    {
        "id": "move_challenge",
        "kind": "turn_left",
        "prompt": "Turn your head to the left",
        "window_hint": "Rotate your head slowly to the left side."
    }
]

@app.get("/")
def root():
    return {
        "status": "HUMANEX backend running",
        "message": "Use POST /api/verify or GET /api/challenge"
    }

@app.get("/challenge")
@app.get("/api/challenge")
def get_challenge():
    return random.choice(CHALLENGES)

@app.post("/verify")
@app.post("/api/verify")
def verify(frame: FrameData):
    # Determine the target challenge ("blink" or "move")
    target_challenge = None
    
    # Try parsing challenge field
    if frame.challenge:
        c_lower = frame.challenge.lower()
        if "blink" in c_lower:
            target_challenge = "blink"
        elif "move" in c_lower or "turn" in c_lower:
            target_challenge = "move"
            
    # Try parsing challenge_id field if challenge was not resolved
    if not target_challenge and frame.challenge_id:
        cid_lower = frame.challenge_id.lower()
        if "blink" in cid_lower:
            target_challenge = "blink"
        elif "move" in cid_lower or "turn" in cid_lower:
            target_challenge = "move"

    # Default fallback
    if not target_challenge:
        target_challenge = "blink"

    if not frame.frames:
        return {
            "human_score": 0,
            "blink_count": 0,
            "movement_count": 0,
            "challenge_passed": False,
            "spoof_suspected": False,
            "status": "No input provided"
        }

    # Anti-spoofing check: If all submitted frames are exactly identical
    spoof_suspected = False
    if len(frame.frames) > 1:
        first_frame = frame.frames[0]
        if all(f == first_frame for f in frame.frames):
            spoof_suspected = True

    if spoof_suspected:
        return {
            "human_score": 10,
            "blink_count": 0,
            "movement_count": 0,
            "challenge_passed": False,
            "spoof_suspected": True,
            "status": "Spoof suspected: identical frames submitted"
        }

    blink_count = 0
    movement_count = 0
    prev_face = None
    prev_center = None

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    for img_str in frame.frames:
        try:
            if "," not in img_str:
                continue

            image_data = img_str.split(",")[1]
            img_bytes = base64.b64decode(image_data)

            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if img is None:
                continue

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)

            if len(faces) > 0:
                (x, y, w, h) = faces[0]
                current_face = (x, y)

                if prev_face is not None:
                    dx = abs(current_face[0] - prev_face[0])
                    dy = abs(current_face[1] - prev_face[1])

                    if dx > 10 or dy > 10:
                        movement_count += 1  

                prev_face = current_face

            # Call feature extraction modules
            blink = detect_blink(img)
            blink_count += blink
            prev_center, movement = get_head_movement(img, prev_center)
            movement_count += movement

        except Exception as e:
            print("Error processing frame:", e)
            continue

    print("FINAL -> Target Challenge:", target_challenge, "Blink:", blink_count, "Movement:", movement_count)

    # Compute scores and result
    challenge_passed = False
    if target_challenge == "blink":
        if blink_count >= 1:
            score = 95
            status = "Human Verified"
            challenge_passed = True
        else:
            score = 40
            status = "Blink not detected"
    elif target_challenge == "move":
        if movement_count >= 1:
            score = 95
            status = "Human Verified"
            challenge_passed = True
        else:
            score = 40
            status = "No movement detected"
    else:
        score = 40
        status = "Invalid challenge configuration"

    return {
        "human_score": score,
        "blink_count": blink_count,
        "movement_count": movement_count,
        "challenge_passed": challenge_passed,
        "spoof_suspected": False,
        "status": status
    }