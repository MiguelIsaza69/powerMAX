import type { Exercise } from "./types"

// Actualizar los rangos de ángulos para todos los ejercicios
// Ahora: 0° = completamente estirado, 180° = completamente flexionado
export const exercises: Exercise[] = [
  {
    id: "squat",
    name: "Sentadilla libre (Squat)",
    joints: ["leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"],
    description: "Articulaciones: Tobillo, rodilla, cadera, columna lumbar | Ángulos: Rodilla 80°-90°, Cadera 40°-50°",
    angleRanges: {
      leftKnee: { min: 80, max: 90, warning: 10, deadZone: 30 },
      rightKnee: { min: 80, max: 90, warning: 10, deadZone: 30 },
      leftHip: { min: 40, max: 50, warning: 10, deadZone: 20 },
      rightHip: { min: 40, max: 50, warning: 10, deadZone: 20 },
      leftAnkle: { min: 85, max: 95, warning: 5, deadZone: 30 },
      rightAnkle: { min: 85, max: 95, warning: 5, deadZone: 30 },
    },
    requiresCorrelation: true,
  },
  {
    id: "deadlift",
    name: "Peso muerto convencional (Deadlift)",
    joints: ["leftHip", "rightHip", "leftKnee", "rightKnee", "leftShoulder", "rightShoulder"],
    description:
      "Articulaciones: Tobillo, rodilla, cadera, columna lumbar, hombro | Ángulos: Rodilla 20°-40°, Cadera 60°-80°",
    angleRanges: {
      leftKnee: { min: 20, max: 40, warning: 10, deadZone: 10 },
      rightKnee: { min: 20, max: 40, warning: 10, deadZone: 10 },
      leftHip: { min: 60, max: 80, warning: 10, deadZone: 20 },
      rightHip: { min: 60, max: 80, warning: 10, deadZone: 20 },
      leftShoulder: { min: 30, max: 50, warning: 10, deadZone: 20 },
      rightShoulder: { min: 30, max: 50, warning: 10, deadZone: 20 },
    },
    requiresCorrelation: true,
  },
  {
    id: "lunges",
    name: "Zancadas (Lunges)",
    joints: ["leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"],
    description: "Articulaciones: Tobillo, rodilla, cadera | Ángulos: Rodilla 80°-90°, Cadera 60°-80°",
    angleRanges: {
      leftKnee: { min: 80, max: 90, warning: 5, deadZone: 30 },
      rightKnee: { min: 80, max: 90, warning: 5, deadZone: 30 },
      leftHip: { min: 60, max: 80, warning: 10, deadZone: 30 },
      rightHip: { min: 60, max: 80, warning: 10, deadZone: 30 },
      leftAnkle: { min: 85, max: 95, warning: 5, deadZone: 30 },
      rightAnkle: { min: 85, max: 95, warning: 5, deadZone: 30 },
    },
    requiresCorrelation: true,
  },
  {
    id: "calfRaises",
    name: "Elevación de talones (Calf raises)",
    joints: ["leftAnkle", "rightAnkle"],
    description: "Articulaciones: Tobillo | Ángulos: Tobillo 10°-20°",
    angleRanges: {
      leftAnkle: { min: 10, max: 20, warning: 5, deadZone: 30 },
      rightAnkle: { min: 10, max: 20, warning: 5, deadZone: 30 },
    },
    requiresCorrelation: true,
  },
  {
    id: "benchPress",
    name: "Press de banca (Bench press)",
    joints: ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist"],
    description: "Articulaciones: Hombro, codo, muñeca | Ángulos: Codo 80°-90°, Hombro 60°-80°",
    angleRanges: {
      leftElbow: { min: 80, max: 90, warning: 5, deadZone: 20 },
      rightElbow: { min: 80, max: 90, warning: 5, deadZone: 20 },
      leftShoulder: { min: 60, max: 80, warning: 10, deadZone: 30 },
      rightShoulder: { min: 60, max: 80, warning: 10, deadZone: 30 },
    },
    requiresCorrelation: true,
  },
  {
    id: "dips",
    name: "Fondos en paralelas (Dips)",
    joints: ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow"],
    description: "Articulaciones: Hombro, codo, muñeca | Ángulos: Codo 80°-130°, Hombro 5°-70°",
    angleRanges: {
      leftElbow: { min: 80, max: 130, warning: 5, deadZone: 20 },
      rightElbow: { min: 80, max: 130, warning: 5, deadZone: 20 },
      leftShoulder: { min: 5, max: 70, warning: 10, deadZone: 4 },
      rightShoulder: { min: 5, max: 70, warning: 10, deadZone: 4 },
    },
    requiresCorrelation: true,
  },
  {
    id: "latPulldown",
    name: "Jalón al pecho (Lat Pulldown)",
    joints: ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow"],
    description: "Articulaciones: Hombro, codo, escápula | Ángulos: Codo 80°-100°, Hombro 30°-50°",
    angleRanges: {
      leftElbow: { min: 80, max: 100, warning: 5, deadZone: 20 },
      rightElbow: { min: 80, max: 100, warning: 5, deadZone: 20 },
      leftShoulder: { min: 30, max: 50, warning: 10, deadZone: 20 },
      rightShoulder: { min: 30, max: 50, warning: 10, deadZone: 20 },
    },
    requiresCorrelation: true,
  },
  {
    id: "pullUps",
    name: "Dominadas (Pull-ups)",
    joints: ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow"],
    description: "Articulaciones: Hombro, codo, escápula | Ángulos: Codo 80°-100°, Hombro 30°-50°",
    angleRanges: {
      leftElbow: { min: 0, max: 180, warning: 5, deadZone: 20 },
      rightElbow: { min: 0, max: 180, warning: 5, deadZone: 20 },
      leftShoulder: { min: 30, max: 180, warning: 10, deadZone: 10 },
      rightShoulder: { min: 30, max: 180, warning: 10, deadZone: 10 },
    },
    requiresCorrelation: true,
  },
  {
    id: "shoulderPress",
    name: "Press militar (Shoulder Press)",
    joints: ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow"],
    description: "Articulaciones: Hombro, codo, muñeca | Ángulos: Codo 50°-80°, Hombro 45°-140°",
    angleRanges: {
      leftElbow: { min: 50, max: 80, warning: 2, deadZone: 20 },
      rightElbow: { min: 50, max: 80, warning: 2, deadZone: 20 },
      leftShoulder: { min: 45, max: 140, warning: 5, deadZone: 30 },
      rightShoulder: { min: 45, max: 140, warning: 5, deadZone: 30 },
    },
    // Indicar que este ejercicio requiere correlación entre ángulos
    requiresCorrelation: true,
  },
  {
    id: "barbellRow",
    name: "Remo con barra (Barbell Row)",
    joints: ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow"],
    description: "Articulaciones: Hombro, codo, escápula, columna lumbar | Ángulos: Codo 60°-100°, Hombro 0°-70°",
    angleRanges: {
      leftElbow: { min: 60, max: 100, warning: 5, deadZone: 20 },
      rightElbow: { min: 60, max: 100, warning: 5, deadZone: 20 },
      leftShoulder: { min: 0, max: 70, warning: 10, deadZone: 0 },
      rightShoulder: { min: 0, max: 70, warning: 10, deadZone: 0 },
    },
  },
  {
    id: "bicepsCurl",
    name: "Curl de bíceps (Biceps Curl)",
    joints: ["leftElbow", "rightElbow"],
    description: "Articulaciones: Codo, muñeca | Ángulos: Codo 55°-150° para máxima activación",
    angleRanges: {
      leftElbow: { min: 55, max: 150, warning: 10, deadZone: 25 },
      rightElbow: { min: 55, max: 150, warning: 10, deadZone: 25 },
    },
  },
]

// Función para traducir el nombre de la articulación
export function translateJointName(joint: string): string {
  switch (joint) {
    case "leftShoulder":
      return "Hombro Izquierdo"
    case "rightShoulder":
      return "Hombro Derecho"
    case "leftElbow":
      return "Codo Izquierdo"
    case "rightElbow":
      return "Codo Derecho"
    case "leftWrist":
      return "Muñeca Izquierda"
    case "rightWrist":
      return "Muñeca Derecha"
    case "leftHip":
      return "Cadera Izquierda"
    case "rightHip":
      return "Cadera Derecha"
    case "leftKnee":
      return "Rodilla Izquierda"
    case "rightKnee":
      return "Rodilla Derecha"
    case "leftAnkle":
      return "Tobillo Izquierdo"
    case "rightAnkle":
      return "Tobillo Derecho"
    default:
      return joint
  }
}

// Función para obtener el índice del landmark según la articulación
export function getJointLandmarkIndex(joint: string): number {
  switch (joint) {
    case "leftShoulder":
      return 11
    case "rightShoulder":
      return 12
    case "leftElbow":
      return 13
    case "rightElbow":
      return 14
    case "leftWrist":
      return 15
    case "rightWrist":
      return 16
    case "leftHip":
      return 23
    case "rightHip":
      return 24
    case "leftKnee":
      return 25
    case "rightKnee":
      return 26
    case "leftAnkle":
      return 27
    case "rightAnkle":
      return 28
    default:
      return -1
  }
}

