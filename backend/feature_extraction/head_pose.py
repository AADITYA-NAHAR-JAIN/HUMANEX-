import cv2
import numpy as np

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def get_head_movement(img, prev_center):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return prev_center, 0

    (x, y, w, h) = faces[0]

    center = (x + w // 2, y + h // 2)

    movement = 0

    if prev_center is not None:
        dx = abs(center[0] - prev_center[0])
        dy = abs(center[1] - prev_center[1])

        # Threshold tuning
        if dx > 15 or dy > 15:
            movement = 1

    return center, movement