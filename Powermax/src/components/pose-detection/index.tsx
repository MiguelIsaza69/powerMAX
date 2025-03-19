"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision"
import { exercises, translateJointName, getJointLandmarkIndex } from "./exercises"
import { getJointAngle } from "./angle-utils"
import { areJointLandmarksVisible } from "./landmark-utils"
import { createPoseLandmarker, getCamera } from "./pose-service"
import { AngleState, type SmoothedLandmark } from "./types"
import {
  getColorForAngle,
  getBackgroundColorForState,
  getTextColorForState,
  stateColors,
  rgbToString,
} from "./color-utils"
import { smoothLandmarks } from "./smoothing-utils"

const PoseDetection: React.FC = () => {
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false)
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [leftJoint, setLeftJoint] = useState<string>("default")
  const [rightJoint, setRightJoint] = useState<string>("default")
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("default")
  const [angles, setAngles] = useState<{ [key: string]: number }>({})
  const [angleStates, setAngleStates] = useState<{ [key: string]: AngleState }>({})

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastDetectionTimeRef = useRef<number>(0)
  const detectedPoseRef = useRef<any>(null)
  const smoothedLandmarksRef = useRef<SmoothedLandmark[]>([])

  // Obtener el ejercicio seleccionado
  const selectedExercise = exercises.find((ex) => ex.id === selectedExerciseId) || null

  // Inicialización del PoseLandmarker
  useEffect(() => {
    const initPoseLandmarker = async () => {
      setIsLoading(true)
      try {
        const landmarker = await createPoseLandmarker()
        setPoseLandmarker(landmarker)
      } catch (error) {
        console.error("Error al crear PoseLandmarker:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initPoseLandmarker()

    // Limpiar recursos al desmontar
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Ajustar el tamaño de los canvas al tamaño del video
  useEffect(() => {
    const resizeCanvases = () => {
      if (videoRef.current && canvasRef.current && canvas2Ref.current) {
        const { videoWidth, videoHeight } = videoRef.current
        if (videoWidth && videoHeight) {
          canvasRef.current.width = videoWidth
          canvasRef.current.height = videoHeight
          canvas2Ref.current.width = videoWidth
          canvas2Ref.current.height = videoHeight
        }
      }
    }

    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener("loadedmetadata", resizeCanvases)
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("loadedmetadata", resizeCanvases)
      }
    }
  }, [webcamRunning])

  // Función de predicción optimizada con suavizado y colores dinámicos
  const predictWebcam = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const canvasCtx = canvas?.getContext("2d")
    const canvas2 = canvas2Ref.current
    const canvasCtx2 = canvas2?.getContext("2d")

    if (!canvas || !canvasCtx || !canvas2 || !canvasCtx2 || !poseLandmarker || !video) {
      console.log("Algunos elementos no están disponibles.")
      return
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas2.width = video.videoWidth
      canvas2.height = video.videoHeight
    }

    const drawingUtils = new DrawingUtils(canvasCtx)

    // Control de tasa de detección para mejorar rendimiento
    const now = performance.now()
    const elapsed = now - lastDetectionTimeRef.current

    // Limitar la detección a 30 FPS máximo para mejorar rendimiento
    const shouldDetect = elapsed > 33 // ~30 FPS

    try {
      let result

      if (shouldDetect) {
        // Detectar poses solo cuando sea necesario
        result = await poseLandmarker.detectForVideo(video, now)
        lastDetectionTimeRef.current = now

        // Si se detectó al menos una pose, guardarla como referencia
        if (result.landmarks && result.landmarks.length > 0) {
          detectedPoseRef.current = result

          // Aplicar suavizado a los landmarks
          if (result.landmarks[0]) {
            smoothedLandmarksRef.current = smoothLandmarks(result.landmarks[0], smoothedLandmarksRef.current)
          }
        }
      } else {
        // Usar la última detección si no es momento de detectar
        result = detectedPoseRef.current || { landmarks: [] }
      }

      // Limpiar canvas
      canvasCtx.save()
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height)

      // Aplicar transformación para invertir horizontalmente el canvas de predicción
      canvasCtx.scale(-1, 1)
      canvasCtx.translate(-canvas.width, 0)

      canvasCtx2.save()
      canvasCtx2.clearRect(0, 0, canvas2.width, canvas2.height)

      // Aplicar transformación para invertir horizontalmente el canvas de texto
      canvasCtx2.scale(-1, 1)
      canvasCtx2.translate(-canvas2.width, 0)

      const newAngles: { [key: string]: number } = {}
      const newAngleStates: { [key: string]: AngleState } = {}

      // Solo procesar si tenemos landmarks suavizados
      if (smoothedLandmarksRef.current.length > 0) {
        const smoothedLandmarks = smoothedLandmarksRef.current

        // Dibujar las conexiones - convertir a formato compatible
        const normalizedLandmarks = smoothedLandmarks.map(({ x, y, z, visibility }) => ({
          x,
          y,
          z,
          visibility,
        }))

        drawingUtils.drawConnectors(normalizedLandmarks, PoseLandmarker.POSE_CONNECTIONS, {
          color: "black", // Líneas en negro
          lineWidth: 3, // Líneas más gruesas
        })

        // Si hay un ejercicio seleccionado, calcular todos los ángulos relevantes
        if (selectedExercise) {
          // Primero dibujar los landmarks que no son articulaciones del ejercicio
          const exerciseJointIndices = selectedExercise.joints.map(getJointLandmarkIndex)
          const otherLandmarks = smoothedLandmarks
            .filter((landmark, i) => !exerciseJointIndices.includes(i) && i < 33 && landmark.visibility > 0.5)
            .map(({ x, y, z, visibility }) => ({ x, y, z, visibility }))

          if (otherLandmarks.length > 0) {
            drawingUtils.drawLandmarks(otherLandmarks, {
              radius: 3,
              color: "white",
              fillColor: rgbToString(stateColors.deadZone), // Negro para landmarks no relevantes
            })
          }

          // Calcular todos los ángulos primero para poder usar la correlación
          for (const joint of selectedExercise.joints) {
            if (areJointLandmarksVisible(smoothedLandmarks, joint)) {
              const angle = getJointAngle(smoothedLandmarks, joint, selectedExercise.id)
              if (angle !== null) {
                newAngles[joint] = angle
              }
            }
          }

          // Luego dibujar los landmarks de las articulaciones con colores basados en el estado
          for (const joint of selectedExercise.joints) {
            const landmarkIndex = getJointLandmarkIndex(joint)
            if (landmarkIndex >= 0 && smoothedLandmarks[landmarkIndex].visibility > 0.5) {
              // Verificar si tenemos un ángulo calculado para esta articulación
              if (newAngles[joint] !== undefined) {
                const angle = newAngles[joint]

                // Determinar el color basado en el ángulo, pasando todos los ángulos para correlación
                const { color, state } = getColorForAngle(angle, selectedExercise, joint, newAngles)
                newAngleStates[joint] = state

                // Dibujar el landmark con el color correspondiente
                drawingUtils.drawLandmarks(
                  [
                    {
                      x: smoothedLandmarks[landmarkIndex].x,
                      y: smoothedLandmarks[landmarkIndex].y,
                      z: smoothedLandmarks[landmarkIndex].z,
                      visibility: smoothedLandmarks[landmarkIndex].visibility,
                    },
                  ],
                  {
                    radius: 8, // Aumentar tamaño para mejor visibilidad
                    color: "white",
                    fillColor: color,
                  },
                )

                // Imprimir información de depuración en la consola
                console.log(`Joint: ${joint}, Angle: ${angle.toFixed(2)}°, State: ${state}`)
              }
            }
          }
        } else {
          // Modo manual: calcular ángulos según las selecciones actuales
          // Dibujar todos los landmarks normalmente
          drawingUtils.drawLandmarks(normalizedLandmarks, {
            radius: 3,
            color: "white",
            fillColor: rgbToString(stateColors.deadZone), // Negro para modo manual
          })

          // Lado izquierdo
          if (leftJoint !== "default" && areJointLandmarksVisible(smoothedLandmarks, leftJoint)) {
            const angle = getJointAngle(smoothedLandmarks, leftJoint)
            if (angle !== null) {
              newAngles[leftJoint] = angle
              newAngleStates[leftJoint] = AngleState.GOOD // En modo manual, siempre es "good"

              // Resaltar el landmark seleccionado
              const landmarkIndex = getJointLandmarkIndex(leftJoint)
              if (landmarkIndex >= 0) {
                drawingUtils.drawLandmarks(
                  [
                    {
                      x: smoothedLandmarks[landmarkIndex].x,
                      y: smoothedLandmarks[landmarkIndex].y,
                      z: smoothedLandmarks[landmarkIndex].z,
                      visibility: smoothedLandmarks[landmarkIndex].visibility,
                    },
                  ],
                  {
                    radius: 8,
                    color: "white",
                    fillColor: rgbToString(stateColors.good), // Verde para modo manual
                  },
                )
              }
            }
          }

          // Lado derecho
          if (rightJoint !== "default" && areJointLandmarksVisible(smoothedLandmarks, rightJoint)) {
            const angle = getJointAngle(smoothedLandmarks, rightJoint)
            if (angle !== null) {
              newAngles[rightJoint] = angle
              newAngleStates[rightJoint] = AngleState.GOOD // En modo manual, siempre es "good"

              // Resaltar el landmark seleccionado
              const landmarkIndex = getJointLandmarkIndex(rightJoint)
              if (landmarkIndex >= 0) {
                drawingUtils.drawLandmarks(
                  [
                    {
                      x: smoothedLandmarks[landmarkIndex].x,
                      y: smoothedLandmarks[landmarkIndex].y,
                      z: smoothedLandmarks[landmarkIndex].z,
                      visibility: smoothedLandmarks[landmarkIndex].visibility,
                    },
                  ],
                  {
                    radius: 8,
                    color: "white",
                    fillColor: rgbToString(stateColors.good), // Verde para modo manual
                  },
                )
              }
            }
          }
        }
      }

      setAngles(newAngles)
      setAngleStates(newAngleStates)

      // Restaurar la transformación para dibujar el texto correctamente
      canvasCtx2.restore()
      canvasCtx2.save()

      // Dibujar los ángulos en el canvas con fondo para mejor legibilidad
      let yPosition = 50
      Object.entries(newAngles).forEach(([joint, angle]) => {
        // Traducir el nombre del joint para mostrar
        const jointName = translateJointName(joint)

        // Obtener el estado del ángulo
        const state = newAngleStates[joint] || AngleState.GOOD

        // Obtener colores basados en el estado
        const bgColor = getBackgroundColorForState(state)
        const textColor = getTextColorForState(state)

        // Dibujar un fondo semi-transparente para el texto
        canvasCtx2.fillStyle = bgColor
        canvasCtx2.fillRect(40, yPosition - 20, 250, 30)

        // Dibujar el texto
        canvasCtx2.fillStyle = textColor
        canvasCtx2.font = "20px Arial"
        canvasCtx2.fillText(`${jointName}: ${angle.toFixed(2)}°`, 50, yPosition)
        yPosition += 40 // Más espacio entre líneas
      })

      canvasCtx.restore()
      canvasCtx2.restore()
    } catch (error) {
      console.error("Error en la detección:", error)
    }

    // Continuar el ciclo de predicción solo si la webcam está en ejecución
    if (webcamRunning) {
      animationRef.current = requestAnimationFrame(predictWebcam)
    }
  }, [webcamRunning, poseLandmarker, leftJoint, rightJoint, selectedExercise])

  // Habilitar la cámara
  const enableCam = useCallback(async () => {
    if (!poseLandmarker) {
      console.log("¡Espera! El poseLandMarker no se ha cargado aún.")
      return
    }

    // Detener cualquier stream anterior
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 30 }, // Solicitar 30 FPS para mejor fluidez
        },
      }
      const stream = await getCamera(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.addEventListener(
          "loadeddata",
          () => {
            setWebcamRunning(true)
            // Iniciar la predicción después de que los datos del video estén cargados
            lastDetectionTimeRef.current = performance.now()
            requestAnimationFrame(predictWebcam)
          },
          { once: true },
        )
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error)
    }
  }, [poseLandmarker, predictWebcam])

  // Efecto para reiniciar la predicción cuando cambian los joints seleccionados o el ejercicio
  useEffect(() => {
    if (webcamRunning) {
      // Si ya está corriendo, cancelar el frame actual y reiniciar
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Reiniciar la predicción
      animationRef.current = requestAnimationFrame(predictWebcam)
    }
  }, [leftJoint, rightJoint, selectedExerciseId, webcamRunning, predictWebcam])

  // Manejadores para el cambio en los selectores de joints
  const handleLeftJointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLeftJoint(e.target.value)
    setSelectedExerciseId("default") // Desactivar el modo ejercicio al seleccionar manualmente
  }

  const handleRightJointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRightJoint(e.target.value)
    setSelectedExerciseId("default") // Desactivar el modo ejercicio al seleccionar manualmente
  }

  // Manejador para seleccionar un ejercicio
  const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const exerciseId = e.target.value
    setSelectedExerciseId(exerciseId)

    if (exerciseId !== "default") {
      // Si se selecciona un ejercicio, resetear las selecciones manuales
      setLeftJoint("default")
      setRightJoint("default")
    }
  }

  // Detener la cámara
  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setWebcamRunning(false)
    detectedPoseRef.current = null
    smoothedLandmarksRef.current = []
  }, [])

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-center text-2xl font-bold mb-4">Pose Detection using MediaPipe</h1>

      {/* Botones para controlar la cámara */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={enableCam}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
          disabled={webcamRunning || isLoading}
        >
          {isLoading ? "Cargando..." : "Activar Cámara"}
        </button>

        {webcamRunning && (
          <button onClick={stopCamera} className="px-4 py-2 bg-red-500 text-white rounded">
            Detener Cámara
          </button>
        )}
      </div>

      {/* Selectores para las articulaciones y ejercicios */}
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mb-4 w-full max-w-3xl">
        <select
          id="exerciseSelect"
          className="p-2 border rounded flex-1"
          value={selectedExerciseId}
          onChange={handleExerciseChange}
        >
          <option value="default">Seleccionar Ejercicio</option>
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>

        <select
          id="leftSideSelect"
          className="p-2 border rounded flex-1"
          value={leftJoint}
          onChange={handleLeftJointChange}
          disabled={selectedExerciseId !== "default"}
        >
          <option value="default">Seleccionar Articulación Izquierda</option>
          <option value="leftShoulder">Hombro Izquierdo</option>
          <option value="leftElbow">Codo Izquierdo</option>
          <option value="leftWrist">Muñeca Izquierda</option>
          <option value="leftHip">Cadera Izquierda</option>
          <option value="leftKnee">Rodilla Izquierda</option>
          <option value="leftAnkle">Tobillo Izquierdo</option>
        </select>

        <select
          id="rightSideSelect"
          className="p-2 border rounded flex-1"
          value={rightJoint}
          onChange={handleRightJointChange}
          disabled={selectedExerciseId !== "default"}
        >
          <option value="default">Seleccionar Articulación Derecha</option>
          <option value="rightShoulder">Hombro Derecho</option>
          <option value="rightElbow">Codo Derecho</option>
          <option value="rightWrist">Muñeca Derecha</option>
          <option value="rightHip">Cadera Derecha</option>
          <option value="rightKnee">Rodilla Derecha</option>
          <option value="rightAnkle">Tobillo Derecho</option>
        </select>
      </div>

      {/* Información del ejercicio seleccionado */}
      {selectedExercise && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600">{selectedExercise.description}</p>
        </div>
      )}

      {/* Video y canvas */}
      <div className="relative w-[480px] h-[360px] mx-auto border border-gray-300 rounded overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width="480"
          height="360"
          className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
        />

        <canvas
          ref={canvasRef}
          id="output_canvas"
          width="480"
          height="360"
          className="absolute top-0 left-0 w-full h-full"
        />

        <canvas
          ref={canvas2Ref}
          id="output_canvas2"
          width="480"
          height="360"
          className="absolute top-0 left-0 w-full h-full z-10"
        />

        {!webcamRunning && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            <p>Cámara desactivada</p>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            <p>Cargando modelo...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PoseDetection

