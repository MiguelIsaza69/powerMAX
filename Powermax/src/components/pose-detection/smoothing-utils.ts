import type { PoseLandmark, SmoothedLandmark } from "./types"

// Tamaño del buffer para el suavizado
const SMOOTHING_BUFFER_SIZE = 5

// Función para inicializar un landmark suavizado
export function initializeSmoothedLandmark(landmark: PoseLandmark): SmoothedLandmark {
  return {
    ...landmark,
    prevX: Array(SMOOTHING_BUFFER_SIZE).fill(landmark.x),
    prevY: Array(SMOOTHING_BUFFER_SIZE).fill(landmark.y),
    prevZ: Array(SMOOTHING_BUFFER_SIZE).fill(landmark.z),
    visibility: landmark.visibility || 0, // Asegurar que visibility nunca sea undefined
  }
}

// Función para actualizar un landmark suavizado con un nuevo valor
export function updateSmoothedLandmark(smoothed: SmoothedLandmark, current: PoseLandmark): SmoothedLandmark {
  // Actualizar los buffers
  const prevX = [...(smoothed.prevX || []), current.x].slice(-SMOOTHING_BUFFER_SIZE)
  const prevY = [...(smoothed.prevY || []), current.y].slice(-SMOOTHING_BUFFER_SIZE)
  const prevZ = [...(smoothed.prevZ || []), current.z].slice(-SMOOTHING_BUFFER_SIZE)

  // Calcular los promedios
  const x = prevX.reduce((sum, val) => sum + val, 0) / prevX.length
  const y = prevY.reduce((sum, val) => sum + val, 0) / prevY.length
  const z = prevZ.reduce((sum, val) => sum + val, 0) / prevZ.length

  // Mantener la visibilidad del landmark actual
  return {
    x,
    y,
    z,
    visibility: current.visibility || 0, // Asegurar que visibility nunca sea undefined
    prevX,
    prevY,
    prevZ,
  }
}

// Función para convertir landmarks a formato compatible con MediaPipe
export function toNormalizedLandmarks(landmarks: SmoothedLandmark[]): any[] {
  return landmarks.map(({ x, y, z, visibility }) => ({ x, y, z, visibility }))
}

// Función para suavizar todos los landmarks
export function smoothLandmarks(
  currentLandmarks: PoseLandmark[],
  previousSmoothedLandmarks?: SmoothedLandmark[],
): SmoothedLandmark[] {
  // Si no hay landmarks previos, inicializar todos
  if (!previousSmoothedLandmarks || previousSmoothedLandmarks.length !== currentLandmarks.length) {
    return currentLandmarks.map((landmark) => {
      // Asegurar que visibility nunca sea undefined
      const safeLandmark = {
        ...landmark,
        visibility: landmark.visibility || 0,
      }
      return initializeSmoothedLandmark(safeLandmark)
    })
  }

  // Actualizar cada landmark con suavizado
  return currentLandmarks.map((landmark, index) => {
    // Asegurar que visibility nunca sea undefined
    const safeLandmark = {
      ...landmark,
      visibility: landmark.visibility || 0,
    }
    return updateSmoothedLandmark(previousSmoothedLandmarks[index], safeLandmark)
  })
}

