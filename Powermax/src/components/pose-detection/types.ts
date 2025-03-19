// Tipos e interfaces para la detección de poses

export interface Exercise {
  id: string
  name: string
  joints: string[]
  description: string
  // Rangos de ángulos para cada articulación
  angleRanges: {
    [joint: string]: {
      min: number // Ángulo mínimo saludable
      max: number // Ángulo máximo saludable
      warning: number // Margen de advertencia
      deadZone: number // Ángulo a partir del cual se considera zona muerta
    }
  }
  // Indicador de si el ejercicio requiere correlación entre ángulos
  requiresCorrelation?: boolean
}

export interface JointAngle {
  joint: string
  angle: number
}

// Modificar la interfaz PoseLandmark para que sea compatible con NormalizedLandmark
export interface PoseLandmark {
  x: number
  y: number
  z: number
  visibility: number // Cambiar de number | undefined a number
}

// Interfaz para el landmark suavizado
export interface SmoothedLandmark {
  x: number
  y: number
  z: number
  visibility: number
  // Propiedades adicionales para el suavizado
  prevX?: number[]
  prevY?: number[]
  prevZ?: number[]
}

// Enumeración para el estado del ángulo
export enum AngleState {
  GOOD = "good",
  WARNING = "warning",
  DANGER = "danger",
  DEAD_ZONE = "deadZone",
}