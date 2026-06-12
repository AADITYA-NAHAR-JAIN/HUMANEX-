import os
import urllib.request
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Model URL and Path
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "face_landmarker.task")

# Eye landmark indices (standard indices for MediaPipe FaceMesh)
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

_detector = None

def get_detector():
    global _detector
    if _detector is None:
        if not os.path.exists(MODEL_PATH):
            print("Downloading face landmarker model...")
            urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
            print("Download complete!")
        
        base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
            num_faces=1
        )
        _detector = vision.FaceLandmarker.create_from_options(options)
    return _detector

def eye_aspect_ratio(landmarks, eye_indices, w, h):
    pts = [(int(landmarks[i].x * w), int(landmarks[i].y * h)) for i in eye_indices]

    # vertical distances
    v1 = np.linalg.norm(np.array(pts[1]) - np.array(pts[5]))
    v2 = np.linalg.norm(np.array(pts[2]) - np.array(pts[4]))

    # horizontal distance
    h_dist = np.linalg.norm(np.array(pts[0]) - np.array(pts[3]))

    ear = (v1 + v2) / (2.0 * h_dist)
    return ear

def detect_blink(image):
    h, w, _ = image.shape
    detector = get_detector()
    
    # Convert image to RGB (MediaPipe expects RGB)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
    
    # Process
    results = detector.detect(mp_image)
    
    if not results.face_landmarks:
        return 0  # no face detected
        
    landmarks = results.face_landmarks[0]
    
    left_ear = eye_aspect_ratio(landmarks, LEFT_EYE, w, h)
    right_ear = eye_aspect_ratio(landmarks, RIGHT_EYE, w, h)
    
    avg_ear = (left_ear + right_ear) / 2.0
    
    # Threshold for blink
    if avg_ear < 0.21:
        return 1
    else:
        return 0