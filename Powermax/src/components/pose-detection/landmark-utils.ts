import type { PoseLandmark } from "./types"

// Función para verificar si un landmark es visible
export function isLandmarkVisible(landmark: PoseLandmark, visibilityThreshold = 0.5): boolean {
  return landmark && landmark.visibility >= visibilityThreshold
}

// Función para verificar si todos los landmarks necesarios para un ángulo están visibles
export function areJointLandmarksVisible(landmarks: PoseLandmark[], joint: string): boolean {
  if (joint === "leftShoulder") {
    return isLandmarkVisible(landmarks[11]) && isLandmarkVisible(landmarks[13]) && isLandmarkVisible(landmarks[23])
  } else if (joint === "rightShoulder") {
    return isLandmarkVisible(landmarks[12]) && isLandmarkVisible(landmarks[14]) && isLandmarkVisible(landmarks[24])
  } else if (joint === "leftElbow") {
    return isLandmarkVisible(landmarks[11]) && isLandmarkVisible(landmarks[13]) && isLandmarkVisible(landmarks[15])
  } else if (joint === "rightElbow") {
    return isLandmarkVisible(landmarks[12]) && isLandmarkVisible(landmarks[14]) && isLandmarkVisible(landmarks[16])
  } else if (joint === "leftWrist") {
    return isLandmarkVisible(landmarks[13]) && isLandmarkVisible(landmarks[15]) && isLandmarkVisible(landmarks[19])
  } else if (joint === "rightWrist") {
    return isLandmarkVisible(landmarks[14]) && isLandmarkVisible(landmarks[16]) && isLandmarkVisible(landmarks[20])
  } else if (joint === "leftHip") {
    return isLandmarkVisible(landmarks[11]) && isLandmarkVisible(landmarks[23]) && isLandmarkVisible(landmarks[25])
  } else if (joint === "rightHip") {
    return isLandmarkVisible(landmarks[12]) && isLandmarkVisible(landmarks[24]) && isLandmarkVisible(landmarks[26])
  } else if (joint === "leftKnee") {
    return isLandmarkVisible(landmarks[23]) && isLandmarkVisible(landmarks[25]) && isLandmarkVisible(landmarks[27])
  } else if (joint === "rightKnee") {
    return isLandmarkVisible(landmarks[24]) && isLandmarkVisible(landmarks[26]) && isLandmarkVisible(landmarks[28])
  } else if (joint === "leftAnkle") {
    return isLandmarkVisible(landmarks[25]) && isLandmarkVisible(landmarks[27]) && isLandmarkVisible(landmarks[31])
  } else if (joint === "rightAnkle") {
    return isLandmarkVisible(landmarks[26]) && isLandmarkVisible(landmarks[28]) && isLandmarkVisible(landmarks[32])
  }
  return false
}

