import { AngleState, type Exercise } from "./types"
import { checkJointCorrelation } from "./angle-utils"

// Función para interpolar entre dos colores
export function interpolateColor(color1: number[], color2: number[], factor: number): number[] {
  const result = color1.map((c, i) => Math.round(c + factor * (color2[i] - c)))
  return result
}

// Función para convertir RGB a string CSS
export function rgbToString(rgb: number[]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

// Colores para los diferentes estados
export const stateColors = {
  good: [46, 204, 113], // Verde fuerte
  goodWarning: [185, 220, 35], // Verde limón
  warning: [241, 196, 15], // Amarillo
  warningDanger: [230, 126, 34], // Naranja
  danger: [231, 76, 60], // Rojo fuerte
  deadZone: [0, 0, 0], // Negro para zona muerta
}

// Modificar la función getColorForAngle para corregir la lógica de colores
// y tener en cuenta la correlación entre ángulos
export function getColorForAngle(
  angle: number,
  exercise: Exercise,
  joint: string,
  allAngles: { [key: string]: number } = {},
): { color: string; state: AngleState } {
  // Si no hay rangos definidos para esta articulación, devolver color por defecto
  if (!exercise.angleRanges[joint]) {
    return { color: rgbToString(stateColors.good), state: AngleState.GOOD }
  }

  // Verificar si necesitamos ajustar los rangos basados en la correlación
  let adjustedRanges: { [key: string]: { min: number; max: number; warning: number } } = {}
  if (exercise.requiresCorrelation) {
    adjustedRanges = checkJointCorrelation(allAngles, exercise.id)
  }

  // Usar rangos ajustados si están disponibles para esta articulación
  const { min, max, warning, deadZone } = adjustedRanges[joint]
    ? { ...adjustedRanges[joint], deadZone: exercise.angleRanges[joint].deadZone }
    : exercise.angleRanges[joint]

  // Verificar si está en zona muerta (posición de reposo/inicio)
  if (angle < deadZone) {
    return { color: rgbToString(stateColors.deadZone), state: AngleState.DEAD_ZONE }
  }

  // Calcular los límites con el margen de advertencia
  const minWarning = min + warning
  const maxWarning = max - warning

  // Si está en el rango óptimo
  if (angle >= minWarning && angle <= maxWarning) {
    return { color: rgbToString(stateColors.good), state: AngleState.GOOD }
  }

  // Si está en el rango de advertencia inferior
  if (angle >= min && angle < minWarning) {
    // Calcular factor de interpolación (0 = min, 1 = minWarning)
    const factor = (angle - min) / warning
    const color = interpolateColor(stateColors.warning, stateColors.goodWarning, factor)
    return { color: rgbToString(color), state: AngleState.WARNING }
  }

  // Si está en el rango de advertencia superior
  if (angle > maxWarning && angle <= max) {
    // Calcular factor de interpolación (0 = maxWarning, 1 = max)
    const factor = (max - angle) / warning
    const color = interpolateColor(stateColors.warning, stateColors.goodWarning, factor)
    return { color: rgbToString(color), state: AngleState.WARNING }
  }

  // Si está por debajo del mínimo (peligroso)
  if (angle < min && angle >= deadZone) {
    // Calcular factor para la transición de naranja a rojo
    // Usamos un rango de 15 grados para esta transición
    const transitionRange = 15
    const factor = Math.max(0, (min - angle) / transitionRange)
    // Limitar el factor a 1 para evitar colores fuera de rango
    const limitedFactor = Math.min(1, factor)
    const color = interpolateColor(stateColors.warningDanger, stateColors.danger, limitedFactor)
    return { color: rgbToString(color), state: AngleState.DANGER }
  }

  // Si está por encima del máximo (peligroso)
  if (angle > max) {
    // Calcular factor para la transición de naranja a rojo
    const transitionRange = 15
    const factor = Math.max(0, (angle - max) / transitionRange)
    // Limitar el factor a 1 para evitar colores fuera de rango
    const limitedFactor = Math.min(1, factor)
    const color = interpolateColor(stateColors.warningDanger, stateColors.danger, limitedFactor)
    return { color: rgbToString(color), state: AngleState.DANGER }
  }

  // Por defecto (no debería llegar aquí)
  return { color: rgbToString(stateColors.good), state: AngleState.GOOD }
}

// Función para obtener el color de fondo según el estado
export function getBackgroundColorForState(state: AngleState): string {
  switch (state) {
    case AngleState.GOOD:
      return "rgba(46, 204, 113, 0.7)" // Verde para correcto
    case AngleState.WARNING:
      return "rgba(241, 196, 15, 0.7)" // Amarillo para advertencia
    case AngleState.DANGER:
      return "rgba(231, 76, 60, 0.7)" // Rojo para peligro
    case AngleState.DEAD_ZONE:
      return "rgba(0, 0, 0, 0.7)" // Negro para zona muerta
    default:
      return "rgba(0, 0, 0, 0.7)" // Negro por defecto
  }
}

// Función para obtener el color de texto según el estado
export function getTextColorForState(state: AngleState): string {
  return state === AngleState.WARNING ? "black" : "white"
}

