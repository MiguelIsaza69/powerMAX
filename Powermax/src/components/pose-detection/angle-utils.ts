import type { PoseLandmark } from "./types"
import { exercises } from "./exercises"

// Modificar la función calculateAngle para asegurar que una articulación estirada sea 0° y una flexionada sea 180°
export function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  // Calcular vectores desde el punto central (vértice) hacia los otros dos puntos
  const vectorBA = { x: a.x - b.x, y: a.y - b.y }
  const vectorBC = { x: c.x - b.x, y: c.y - b.y }

  // Calcular magnitudes de los vectores
  const magnitudeBA = Math.sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y)
  const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y)

  // Evitar división por cero
  if (magnitudeBA === 0 || magnitudeBC === 0) return 0

  // Calcular el producto escalar
  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y

  // Calcular el coseno del ángulo usando el producto escalar
  const cosAngle = dotProduct / (magnitudeBA * magnitudeBC)

  // Asegurar que el valor esté en el rango válido para acos [-1, 1]
  const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle))

  // Calcular el ángulo en radianes y convertir a grados
  // Una articulación estirada tendrá un ángulo cercano a 0°
  // Una articulación flexionada tendrá un ángulo cercano a 180°
  return Math.acos(clampedCosAngle) * (180 / Math.PI)
}

// Función especial para calcular el ángulo del hombro en el press militar
// Esto asegura que cuando el brazo está junto al cuerpo sea 0° y cuando está arriba sea 180°
export function getShoulderAngleForPress(landmarks: PoseLandmark[], joint: string): number | null {
  if (joint === "leftShoulder") {
    // Usar cadera, hombro y codo para calcular el ángulo
    return calculateAngle(landmarks[23], landmarks[11], landmarks[13]) // Cadera izquierda, hombro izquierdo, codo izquierdo
  } else if (joint === "rightShoulder") {
    return calculateAngle(landmarks[24], landmarks[12], landmarks[14]) // Cadera derecha, hombro derecho, codo derecho
  }
  return null
}

// Funciones para calcular ángulos de las articulaciones
// Hombro: vértice en hombro, lados en codo y cadera
export function getShoulderAngle(landmarks: PoseLandmark[], joint: string, exerciseId?: string): number | null {
  // Si es el ejercicio de press militar, usar la función especial
  if (exerciseId === "shoulderPress") {
    return getShoulderAngleForPress(landmarks, joint)
  }

  // Para otros ejercicios, usar el cálculo estándar
  if (joint === "leftShoulder") {
    return calculateAngle(landmarks[13], landmarks[11], landmarks[23]) // Codo izquierdo, hombro izquierdo, cadera izquierda
  } else if (joint === "rightShoulder") {
    return calculateAngle(landmarks[14], landmarks[12], landmarks[24]) // Codo derecho, hombro derecho, cadera derecha
  }
  return null
}

// Codo: vértice en codo, lados en muñeca y hombro
export function getElbowAngle(landmarks: PoseLandmark[], joint: string): number | null {
  if (joint === "leftElbow") {
    return calculateAngle(landmarks[15], landmarks[13], landmarks[11]) // Muñeca izquierda, codo izquierdo, hombro izquierdo
  } else if (joint === "rightElbow") {
    return calculateAngle(landmarks[16], landmarks[14], landmarks[12]) // Muñeca derecha, codo derecho, hombro derecho
  }
  return null
}

// Muñeca: vértice en muñeca, lados en codo y dedo índice
export function getWristAngle(landmarks: PoseLandmark[], joint: string): number | null {
  if (joint === "leftWrist") {
    return calculateAngle(landmarks[13], landmarks[15], landmarks[19]) // Codo izquierdo, muñeca izquierda, índice izquierdo
  } else if (joint === "rightWrist") {
    return calculateAngle(landmarks[14], landmarks[16], landmarks[20]) // Codo derecho, muñeca derecha, índice derecho
  }
  return null
}

// Cadera: vértice en cadera, lados en rodilla y hombro
export function getHipAngle(landmarks: PoseLandmark[], joint: string): number | null {
  if (joint === "leftHip") {
    return calculateAngle(landmarks[25], landmarks[23], landmarks[11]) // Rodilla izquierda, cadera izquierda, hombro izquierdo
  } else if (joint === "rightHip") {
    return calculateAngle(landmarks[26], landmarks[24], landmarks[12]) // Rodilla derecha, cadera derecha, hombro derecho
  }
  return null
}

// Rodilla: vértice en rodilla, lados en cadera y tobillo
export function getKneeAngle(landmarks: PoseLandmark[], joint: string): number | null {
  if (joint === "leftKnee") {
    return calculateAngle(landmarks[23], landmarks[25], landmarks[27]) // Cadera izquierda, rodilla izquierda, tobillo izquierdo
  } else if (joint === "rightKnee") {
    return calculateAngle(landmarks[24], landmarks[26], landmarks[28]) // Cadera derecha, rodilla derecha, tobillo derecho
  }
  return null
}

// Tobillo: vértice en tobillo, lados en rodilla y punta del pie
export function getAnkleAngle(landmarks: PoseLandmark[], joint: string): number | null {
  if (joint === "leftAnkle") {
    return calculateAngle(landmarks[25], landmarks[27], landmarks[31]) // Rodilla izquierda, tobillo izquierdo, punta pie izquierdo
  } else if (joint === "rightAnkle") {
    return calculateAngle(landmarks[26], landmarks[28], landmarks[32]) // Rodilla derecha, tobillo derecho, punta pie derecho
  }
  return null
}

// Función para obtener el ángulo de una articulación específica
export function getJointAngle(landmarks: PoseLandmark[], joint: string, exerciseId?: string): number | null {
  switch (joint) {
    case "leftShoulder":
    case "rightShoulder":
      return getShoulderAngle(landmarks, joint, exerciseId)
    case "leftElbow":
    case "rightElbow":
      return getElbowAngle(landmarks, joint)
    case "leftWrist":
    case "rightWrist":
      return getWristAngle(landmarks, joint)
    case "leftHip":
    case "rightHip":
      return getHipAngle(landmarks, joint)
    case "leftKnee":
    case "rightKnee":
      return getKneeAngle(landmarks, joint)
    case "leftAnkle":
    case "rightAnkle":
      return getAnkleAngle(landmarks, joint)
    default:
      return null
  }
}

// Función para verificar la correlación entre ángulos de hombro y codo
// Esta función ajusta los rangos de ángulos aceptables según la posición
export function checkJointCorrelation(
  angles: { [key: string]: number },
  exerciseId: string,
): { [key: string]: { min: number; max: number; warning: number } } {
  const adjustedRanges: { [key: string]: { min: number; max: number; warning: number } } = {}

  // Encontrar el ejercicio
  const exercise = exercises.find((ex) => ex.id === exerciseId)
  if (!exercise || !exercise.requiresCorrelation) {
    return {}
  }

  // Para el press de hombro, ajustar los rangos de codo según la posición del hombro
  if (exerciseId === "shoulderPress") {
    // Verificar si tenemos ángulos de hombro y codo
    const hasLeftShoulder = typeof angles["leftShoulder"] === "number"
    const hasRightShoulder = typeof angles["rightShoulder"] === "number"
    const hasLeftElbow = typeof angles["leftElbow"] === "number"
    const hasRightElbow = typeof angles["rightElbow"] === "number"

    // Ajustar el rango del codo izquierdo basado en el ángulo del hombro izquierdo
    if (hasLeftShoulder && hasLeftElbow) {
      const shoulderAngle = angles["leftShoulder"]

      // A medida que el hombro sube (ángulo aumenta), el codo debe extenderse (ángulo disminuye)
      // Fase inicial: hombro cerca de 0-30°, codo debe estar flexionado (125-135°)
      // Fase final: hombro cerca de 50-90°, codo debe estar más extendido (30-60°)

      if (shoulderAngle < 70) {
        // Posición inicial - codo flexionado
        adjustedRanges["leftElbow"] = { min: 45, max: 90, warning: 5 }
      } else if (shoulderAngle >= 70 && shoulderAngle < 120) {
        // Posición intermedia - codo parcialmente extendido
        adjustedRanges["leftElbow"] = { min: 70, max: 120, warning: 10 }
      } else if (shoulderAngle >= 120 && shoulderAngle < 140) {
        // Posición final - codo más extendido
        adjustedRanges["leftElbow"] = { min: 100, max: 150, warning: 15 }
      }
    }

    // Ajustar el rango del codo derecho basado en el ángulo del hombro derecho
    if (hasRightShoulder && hasRightElbow) {
      const shoulderAngle = angles["rightShoulder"]

      if (shoulderAngle < 70) {
        // Posición inicial - codo flexionado
        adjustedRanges["rightElbow"] = { min: 45, max: 90, warning: 5 }
      } else if (shoulderAngle >= 70 && shoulderAngle < 120) {
        // Posición intermedia - codo parcialmente extendido
        adjustedRanges["rightElbow"] = { min: 70, max: 120, warning: 10 }
      } else if (shoulderAngle >= 120 && shoulderAngle < 140) {
        // Posición final - codo más extendido
        adjustedRanges["rightElbow"] = { min: 100, max: 150, warning: 15 }
      }
    }
  }
  // Para sentadilla (squat), correlacionar rodillas, caderas y tobillos
  else if (exerciseId === "squat") {
    const hasLeftKnee = typeof angles["leftKnee"] === "number"
    const hasRightKnee = typeof angles["rightKnee"] === "number"
    const hasLeftHip = typeof angles["leftHip"] === "number"
    const hasRightHip = typeof angles["rightHip"] === "number"
    const hasLeftAnkle = typeof angles["leftAnkle"] === "number"
    const hasRightAnkle = typeof angles["rightAnkle"] === "number"

    // Ajustar rangos de cadera basados en ángulo de rodilla
    if (hasLeftKnee && hasLeftHip) {
      const kneeAngle = angles["leftKnee"]

      if (kneeAngle < 50) {
        // Posición inicial/final - cadera extendida
        adjustedRanges["leftHip"] = { min: 20, max: 40, warning: 10 }
      } else if (kneeAngle >= 50 && kneeAngle < 70) {
        // Posición intermedia - cadera parcialmente flexionada
        adjustedRanges["leftHip"] = { min: 30, max: 50, warning: 10 }
      } else if (kneeAngle >= 70) {
        // Posición profunda - cadera más flexionada
        adjustedRanges["leftHip"] = { min: 40, max: 60, warning: 10 }
      }
    }

    if (hasRightKnee && hasRightHip) {
      const kneeAngle = angles["rightKnee"]

      if (kneeAngle < 50) {
        adjustedRanges["rightHip"] = { min: 20, max: 40, warning: 10 }
      } else if (kneeAngle >= 50 && kneeAngle < 70) {
        adjustedRanges["rightHip"] = { min: 30, max: 50, warning: 10 }
      } else if (kneeAngle >= 70) {
        adjustedRanges["rightHip"] = { min: 40, max: 60, warning: 10 }
      }
    }

    // Ajustar rangos de tobillo basados en ángulo de rodilla
    if (hasLeftKnee && hasLeftAnkle) {
      const kneeAngle = angles["leftKnee"]

      if (kneeAngle < 50) {
        adjustedRanges["leftAnkle"] = { min: 75, max: 85, warning: 5 }
      } else if (kneeAngle >= 50 && kneeAngle < 70) {
        adjustedRanges["leftAnkle"] = { min: 80, max: 90, warning: 5 }
      } else if (kneeAngle >= 70) {
        adjustedRanges["leftAnkle"] = { min: 85, max: 95, warning: 5 }
      }
    }

    if (hasRightKnee && hasRightAnkle) {
      const kneeAngle = angles["rightKnee"]

      if (kneeAngle < 50) {
        adjustedRanges["rightAnkle"] = { min: 75, max: 85, warning: 5 }
      } else if (kneeAngle >= 50 && kneeAngle < 70) {
        adjustedRanges["rightAnkle"] = { min: 80, max: 90, warning: 5 }
      } else if (kneeAngle >= 70) {
        adjustedRanges["rightAnkle"] = { min: 85, max: 95, warning: 5 }
      }
    }
  }
  // Para peso muerto (deadlift), correlacionar rodillas, caderas y hombros
  else if (exerciseId === "deadlift") {
    const hasLeftKnee = typeof angles["leftKnee"] === "number"
    const hasRightKnee = typeof angles["rightKnee"] === "number"
    const hasLeftHip = typeof angles["leftHip"] === "number"
    const hasRightHip = typeof angles["rightHip"] === "number"
    const hasLeftShoulder = typeof angles["leftShoulder"] === "number"
    const hasRightShoulder = typeof angles["rightShoulder"] === "number"

    // Ajustar rangos de cadera basados en ángulo de rodilla
    if (hasLeftKnee && hasLeftHip) {
      const kneeAngle = angles["leftKnee"]

      if (kneeAngle < 20) {
        // Posición final - cadera extendida
        adjustedRanges["leftHip"] = { min: 70, max: 90, warning: 10 }
      } else if (kneeAngle >= 20 && kneeAngle < 30) {
        // Posición intermedia
        adjustedRanges["leftHip"] = { min: 60, max: 80, warning: 10 }
      } else if (kneeAngle >= 30) {
        // Posición inicial - cadera flexionada
        adjustedRanges["leftHip"] = { min: 50, max: 70, warning: 10 }
      }
    }

    if (hasRightKnee && hasRightHip) {
      const kneeAngle = angles["rightKnee"]

      if (kneeAngle < 20) {
        adjustedRanges["rightHip"] = { min: 70, max: 90, warning: 10 }
      } else if (kneeAngle >= 20 && kneeAngle < 30) {
        adjustedRanges["rightHip"] = { min: 60, max: 80, warning: 10 }
      } else if (kneeAngle >= 30) {
        adjustedRanges["rightHip"] = { min: 50, max: 70, warning: 10 }
      }
    }

    // Ajustar rangos de hombro basados en ángulo de cadera
    if (hasLeftHip && hasLeftShoulder) {
      const hipAngle = angles["leftHip"]

      if (hipAngle < 60) {
        // Cadera más flexionada - hombro más extendido
        adjustedRanges["leftShoulder"] = { min: 20, max: 40, warning: 10 }
      } else if (hipAngle >= 60 && hipAngle < 75) {
        // Posición intermedia
        adjustedRanges["leftShoulder"] = { min: 30, max: 50, warning: 10 }
      } else if (hipAngle >= 75) {
        // Cadera más extendida - hombro más flexionado
        adjustedRanges["leftShoulder"] = { min: 40, max: 60, warning: 10 }
      }
    }

    if (hasRightHip && hasRightShoulder) {
      const hipAngle = angles["rightHip"]

      if (hipAngle < 60) {
        adjustedRanges["rightShoulder"] = { min: 20, max: 40, warning: 10 }
      } else if (hipAngle >= 60 && hipAngle < 75) {
        adjustedRanges["rightShoulder"] = { min: 30, max: 50, warning: 10 }
      } else if (hipAngle >= 75) {
        adjustedRanges["rightShoulder"] = { min: 40, max: 60, warning: 10 }
      }
    }
  }
  // Para zancadas (lunges), correlacionar rodillas, caderas y tobillos
  else if (exerciseId === "lunges") {
    const hasLeftKnee = typeof angles["leftKnee"] === "number"
    const hasRightKnee = typeof angles["rightKnee"] === "number"
    const hasLeftHip = typeof angles["leftHip"] === "number"
    const hasRightHip = typeof angles["rightHip"] === "number"
    const hasLeftAnkle = typeof angles["leftAnkle"] === "number"
    const hasRightAnkle = typeof angles["rightAnkle"] === "number"

    // Ajustar rangos de cadera basados en ángulo de rodilla
    if (hasLeftKnee && hasLeftHip) {
      const kneeAngle = angles["leftKnee"]

      if (kneeAngle < 60) {
        // Posición inicial/final
        adjustedRanges["leftHip"] = { min: 50, max: 70, warning: 10 }
      } else if (kneeAngle >= 60 && kneeAngle < 75) {
        // Posición intermedia
        adjustedRanges["leftHip"] = { min: 60, max: 80, warning: 10 }
      } else if (kneeAngle >= 75) {
        // Posición profunda
        adjustedRanges["leftHip"] = { min: 70, max: 90, warning: 10 }
      }
    }

    if (hasRightKnee && hasRightHip) {
      const kneeAngle = angles["rightKnee"]

      if (kneeAngle < 60) {
        adjustedRanges["rightHip"] = { min: 50, max: 70, warning: 10 }
      } else if (kneeAngle >= 60 && kneeAngle < 75) {
        adjustedRanges["rightHip"] = { min: 60, max: 80, warning: 10 }
      } else if (kneeAngle >= 75) {
        adjustedRanges["rightHip"] = { min: 70, max: 90, warning: 10 }
      }
    }

    // Ajustar rangos de tobillo basados en ángulo de rodilla
    if (hasLeftKnee && hasLeftAnkle) {
      const kneeAngle = angles["leftKnee"]

      if (kneeAngle < 60) {
        adjustedRanges["leftAnkle"] = { min: 80, max: 90, warning: 5 }
      } else if (kneeAngle >= 60 && kneeAngle < 75) {
        adjustedRanges["leftAnkle"] = { min: 85, max: 95, warning: 5 }
      } else if (kneeAngle >= 75) {
        adjustedRanges["leftAnkle"] = { min: 90, max: 100, warning: 5 }
      }
    }

    if (hasRightKnee && hasRightAnkle) {
      const kneeAngle = angles["rightKnee"]

      if (kneeAngle < 60) {
        adjustedRanges["rightAnkle"] = { min: 80, max: 90, warning: 5 }
      } else if (kneeAngle >= 60 && kneeAngle < 75) {
        adjustedRanges["rightAnkle"] = { min: 85, max: 95, warning: 5 }
      } else if (kneeAngle >= 75) {
        adjustedRanges["rightAnkle"] = { min: 90, max: 100, warning: 5 }
      }
    }
  }
  // Para press de banca (bench press), correlacionar hombros y codos
  else if (exerciseId === "benchPress") {
    const hasLeftShoulder = typeof angles["leftShoulder"] === "number"
    const hasRightShoulder = typeof angles["rightShoulder"] === "number"
    const hasLeftElbow = typeof angles["leftElbow"] === "number"
    const hasRightElbow = typeof angles["rightElbow"] === "number"

    // Ajustar rangos de codo basados en ángulo de hombro
    if (hasLeftShoulder && hasLeftElbow) {
      const shoulderAngle = angles["leftShoulder"]

      if (shoulderAngle < 65) {
        // Posición inicial/final - codo extendido
        adjustedRanges["leftElbow"] = { min: 150, max: 170, warning: 5 }
      } else if (shoulderAngle >= 65 && shoulderAngle < 75) {
        // Posición intermedia - codo parcialmente flexionado
        adjustedRanges["leftElbow"] = { min: 110, max: 130, warning: 5 }
      } else if (shoulderAngle >= 75) {
        // Posición profunda - codo más flexionado
        adjustedRanges["leftElbow"] = { min: 80, max: 100, warning: 5 }
      }
    }

    if (hasRightShoulder && hasRightElbow) {
      const shoulderAngle = angles["rightShoulder"]

      if (shoulderAngle < 65) {
        adjustedRanges["rightElbow"] = { min: 150, max: 170, warning: 5 }
      } else if (shoulderAngle >= 65 && shoulderAngle < 75) {
        adjustedRanges["rightElbow"] = { min: 110, max: 130, warning: 5 }
      } else if (shoulderAngle >= 75) {
        adjustedRanges["rightElbow"] = { min: 80, max: 100, warning: 5 }
      }
    }
  }
  // Para fondos en paralelas (dips), correlacionar hombros y codos
  else if (exerciseId === "dips") {
    const hasLeftShoulder = typeof angles["leftShoulder"] === "number"
    const hasRightShoulder = typeof angles["rightShoulder"] === "number"
    const hasLeftElbow = typeof angles["leftElbow"] === "number"
    const hasRightElbow = typeof angles["rightElbow"] === "number"

    // Ajustar rangos de codo basados en ángulo de hombro
    if (hasLeftShoulder && hasLeftElbow) {
      const shoulderAngle = angles["leftShoulder"]

      if (shoulderAngle < 20) {
        // Posición inicial - codo extendido
        adjustedRanges["leftElbow"] = { min: 80, max: 130, warning: 5 }
      } else if (shoulderAngle >= 20 && shoulderAngle < 40) {
        // Posición intermedia - codo parcialmente flexionado
        adjustedRanges["leftElbow"] = { min: 100, max: 130, warning: 5 }
      } else if (shoulderAngle >= 40) {
        // Posición profunda - codo más flexionado
        adjustedRanges["leftElbow"] = { min: 80, max: 100, warning: 5 }
      }
    }

    if (hasRightShoulder && hasRightElbow) {
      const shoulderAngle = angles["rightShoulder"]

      if (shoulderAngle < 20) {
        adjustedRanges["rightElbow"] = { min: 80, max: 130, warning: 5 }
      } else if (shoulderAngle >= 20 && shoulderAngle < 40) {
        adjustedRanges["rightElbow"] = { min: 100, max: 130, warning: 5 }
      } else if (shoulderAngle >= 40) {
        adjustedRanges["rightElbow"] = { min: 80, max: 100, warning: 5 }
      }
    }
  }
  // Para jalón al pecho (lat pulldown), correlacionar hombros y codos
  else if (exerciseId === "latPulldown") {
    const hasLeftShoulder = typeof angles["leftShoulder"] === "number"
    const hasRightShoulder = typeof angles["rightShoulder"] === "number"
    const hasLeftElbow = typeof angles["leftElbow"] === "number"
    const hasRightElbow = typeof angles["rightElbow"] === "number"

    // Ajustar rangos de codo basados en ángulo de hombro
    if (hasLeftShoulder && hasLeftElbow) {
      const shoulderAngle = angles["leftShoulder"]

      if (shoulderAngle > 120) {
        // Posición inicial - codo extendido
        adjustedRanges["leftElbow"] = { min: 110, max: 170, warning: 5 }
      } else if (shoulderAngle <= 130 && shoulderAngle > 70) {
        // Posición intermedia - codo parcialmente flexionado
        adjustedRanges["leftElbow"] = { min: 60, max: 90, warning: 5 }
      } else if (shoulderAngle <= 80) {
        // Posición final - codo más flexionado
        adjustedRanges["leftElbow"] = { min: 30, max: 70, warning: 5 }
      }
    }

    if (hasRightShoulder && hasRightElbow) {
      const shoulderAngle = angles["rightShoulder"]

      if (shoulderAngle > 120) {
        adjustedRanges["rightElbow"] = { min: 110, max: 170, warning: 5 }
      } else if (shoulderAngle <= 130 && shoulderAngle > 70) {
        adjustedRanges["rightElbow"] = { min: 110, max: 130, warning: 5 }
      } else if (shoulderAngle <= 80) {
        adjustedRanges["rightElbow"] = { min: 80, max: 100, warning: 5 }
      }
    }
  }
  // Para dominadas (pull-ups), correlacionar hombros y codos
  else if (exerciseId === "pullUps") {
    const hasLeftShoulder = typeof angles["leftShoulder"] === "number"
    const hasRightShoulder = typeof angles["rightShoulder"] === "number"
    const hasLeftElbow = typeof angles["leftElbow"] === "number"
    const hasRightElbow = typeof angles["rightElbow"] === "number"

    // Ajustar rangos de codo basados en ángulo de hombro
    if (hasLeftShoulder && hasLeftElbow) {
      const shoulderAngle = angles["leftShoulder"]

      if (shoulderAngle > 120) {
        // Posición inicial - codo extendido
        adjustedRanges["leftElbow"] = { min: 110, max: 170, warning: 5 }
      } else if (shoulderAngle <= 130 && shoulderAngle > 70) {
        // Posición intermedia - codo parcialmente flexionado
        adjustedRanges["leftElbow"] = { min: 60, max: 90, warning: 5 }
      } else if (shoulderAngle <= 80) {
        // Posición final - codo más flexionado
        adjustedRanges["leftElbow"] = { min: 30, max: 70, warning: 5 }
      }
    }

    if (hasRightShoulder && hasRightElbow) {
      const shoulderAngle = angles["rightShoulder"]

      if (shoulderAngle > 120) {
        adjustedRanges["rightElbow"] = { min: 110, max: 170, warning: 5 }
      } else if (shoulderAngle <= 130 && shoulderAngle > 70) {
        adjustedRanges["rightElbow"] = { min: 110, max: 130, warning: 5 }
      } else if (shoulderAngle <= 80) {
        adjustedRanges["rightElbow"] = { min: 80, max: 100, warning: 5 }
      }
    }
  }

  return adjustedRanges
}

