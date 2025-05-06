"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { motion } from "framer-motion"

export function SatelliteOrbitVisualization({ position1, position2, distance, dangerLevel }) {
  const containerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a101c)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000,
    )
    camera.position.set(0, 0, 1000)

    // Renderer setup with better quality
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Controls with better damping
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.8
    controls.zoomSpeed = 1.2

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Add a subtle point light for highlights
    const pointLight = new THREE.PointLight(0x3b82f6, 1, 1000)
    pointLight.position.set(-500, 200, 200)
    scene.add(pointLight)

    // Add a blue-ish rim light for atmosphere effect
    const rimLight = new THREE.PointLight(0x3b82f6, 0.5, 1500)
    rimLight.position.set(-1000, 0, -1000)
    scene.add(rimLight)

    // Earth (center point) with better textures
    const earthGeometry = new THREE.SphereGeometry(100, 64, 64)
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2a9d8f,
      emissive: 0x2a9d8f,
      emissiveIntensity: 0.2,
      shininess: 30,
    })
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)

    // Add atmosphere glow to Earth
    const earthGlowGeometry = new THREE.SphereGeometry(105, 64, 64)
    const earthGlowMaterial = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    })
    const earthGlow = new THREE.Mesh(earthGlowGeometry, earthGlowMaterial)
    earth.add(earthGlow)

    scene.add(earth)

    // Satellite 1 with better visuals
    const sat1Geometry = new THREE.SphereGeometry(20, 32, 32)
    const sat1Material = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.5,
      shininess: 30,
    })
    const satellite1 = new THREE.Mesh(sat1Geometry, sat1Material)
    satellite1.position.set(position1[0], position1[1], position1[2])

    // Add glow to satellite 1
    const sat1GlowGeometry = new THREE.SphereGeometry(25, 32, 32)
    const sat1GlowMaterial = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    })
    const sat1Glow = new THREE.Mesh(sat1GlowGeometry, sat1GlowMaterial)
    satellite1.add(sat1Glow)

    scene.add(satellite1)

    // Satellite 2 with better visuals
    const sat2Geometry = new THREE.SphereGeometry(20, 32, 32)
    const sat2Material = new THREE.MeshPhongMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.5,
      shininess: 30,
    })
    const satellite2 = new THREE.Mesh(sat2Geometry, sat2Material)
    satellite2.position.set(position2[0], position2[1], position2[2])

    // Add glow to satellite 2
    const sat2GlowGeometry = new THREE.SphereGeometry(25, 32, 32)
    const sat2GlowMaterial = new THREE.MeshPhongMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    })
    const sat2Glow = new THREE.Mesh(sat2GlowGeometry, sat2GlowMaterial)
    satellite2.add(sat2Glow)

    scene.add(satellite2)

    // Line between satellites with better visuals
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(position1[0], position1[1], position1[2]),
      new THREE.Vector3(position2[0], position2[1], position2[2]),
    ])

    // Line color based on danger level with better styling
    let lineColor
    switch (dangerLevel) {
      case "HIGH":
        lineColor = 0xef4444 // Red
        break
      case "MEDIUM":
        lineColor = 0xf59e0b // Yellow
        break
      case "LOW":
        lineColor = 0x10b981 // Green
        break
      default:
        lineColor = 0x3b82f6 // Blue
    }

    const lineMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      linewidth: 2,
    })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    scene.add(line)

    // Add orbit paths for better visualization
    const sat1OrbitGeometry = new THREE.TorusGeometry(
      Math.sqrt(position1[0] * position1[0] + position1[1] * position1[1] + position1[2] * position1[2]),
      1,
      16,
      100,
    )
    const sat1OrbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.3,
    })
    const sat1Orbit = new THREE.Mesh(sat1OrbitGeometry, sat1OrbitMaterial)

    // Rotate orbit to match satellite position
    sat1Orbit.lookAt(new THREE.Vector3(position1[0], position1[1], position1[2]))
    sat1Orbit.rotation.x = Math.PI / 2
    scene.add(sat1Orbit)

    const sat2OrbitGeometry = new THREE.TorusGeometry(
      Math.sqrt(position2[0] * position2[0] + position2[1] * position2[1] + position2[2] * position2[2]),
      1,
      16,
      100,
    )
    const sat2OrbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.3,
    })
    const sat2Orbit = new THREE.Mesh(sat2OrbitGeometry, sat2OrbitMaterial)

    // Rotate orbit to match satellite position
    sat2Orbit.lookAt(new THREE.Vector3(position2[0], position2[1], position2[2]))
    sat2Orbit.rotation.x = Math.PI / 2
    scene.add(sat2Orbit)

    // Coordinate axes with better styling
    const axesHelper = new THREE.AxesHelper(500)
    scene.add(axesHelper)

    // Labels for axes with better styling
    const createLabel = (text, position, color) => {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = 128
      canvas.height = 64
      context.fillStyle = "rgba(0, 0, 0, 0)"
      context.fillRect(0, 0, canvas.width, canvas.height)

      context.font = "bold 24px Arial"
      context.fillStyle = color
      context.textAlign = "center"
      context.textBaseline = "middle"
      context.fillText(text, canvas.width / 2, canvas.height / 2)

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      })
      const sprite = new THREE.Sprite(material)
      sprite.position.copy(position)
      sprite.scale.set(50, 25, 1)
      scene.add(sprite)

      return sprite
    }

    // Add axis labels with better positioning
    createLabel("X", new THREE.Vector3(550, 0, 0), "#ff0000")
    createLabel("Y", new THREE.Vector3(0, 550, 0), "#00ff00")
    createLabel("Z", new THREE.Vector3(0, 0, 550), "#0000ff")

    // Distance label with better styling
    const distanceLabel = createLabel(
      `${distance.toFixed(2)} km`,
      new THREE.Vector3(
        (position1[0] + position2[0]) / 2,
        (position1[1] + position2[1]) / 2 + 50,
        (position1[2] + position2[2]) / 2,
      ),
      dangerLevel === "HIGH" ? "#ef4444" : dangerLevel === "MEDIUM" ? "#f59e0b" : "#10b981",
    )

    // Grid helper with better styling
    const gridHelper = new THREE.GridHelper(1000, 20, 0x555555, 0x333333)
    scene.add(gridHelper)

    // Add stars to the background for better aesthetics
    const starsGeometry = new THREE.BufferGeometry()
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    })

    const starsVertices = []
    for (let i = 0; i < 5000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000)
      const y = THREE.MathUtils.randFloatSpread(2000)
      const z = THREE.MathUtils.randFloatSpread(2000)
      starsVertices.push(x, y, z)
    }

    starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3))
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // Add closest approach point
    const closestApproachGeometry = new THREE.SphereGeometry(5, 32, 32)
    const closestApproachMaterial = new THREE.MeshPhongMaterial({
      color: lineColor,
      emissive: lineColor,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7,
    })
    const closestApproach = new THREE.Mesh(closestApproachGeometry, closestApproachMaterial)
    closestApproach.position.set(
      (position1[0] + position2[0]) / 2,
      (position1[1] + position2[1]) / 2,
      (position1[2] + position2[2]) / 2,
    )
    scene.add(closestApproach)

    // Add a pulsing effect to the closest approach point
    const pulseGeometry = new THREE.SphereGeometry(10, 32, 32)
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.3,
    })
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial)
    pulse.position.copy(closestApproach.position)
    scene.add(pulse)

    // Auto-adjust camera to view both satellites
    const center = new THREE.Vector3(
      (position1[0] + position2[0]) / 2,
      (position1[1] + position2[1]) / 2,
      (position1[2] + position2[2]) / 2,
    )

    // Calculate distance between satellites for camera positioning
    const dist = Math.sqrt(
      Math.pow(position1[0] - position2[0], 2) +
        Math.pow(position1[1] - position2[1], 2) +
        Math.pow(position1[2] - position2[2], 2),
    )

    // Position camera to view both satellites
    camera.position.set(center.x, center.y, center.z + dist * 2)
    controls.target.copy(center)
    controls.update()

    // Add subtle animation to satellites and their glows
    const animate = () => {
      requestAnimationFrame(animate)

      // Rotate satellites slightly
      satellite1.rotation.y += 0.01
      satellite2.rotation.y += 0.01

      // Rotate orbit paths
      sat1Orbit.rotation.z += 0.001
      sat2Orbit.rotation.z += 0.001

      // Pulse effect for closest approach point
      const pulseFactor = (Math.sin(Date.now() * 0.003) + 1) * 0.5
      pulse.scale.set(1 + pulseFactor, 1 + pulseFactor, 1 + pulseFactor)
      pulse.material.opacity = 0.3 * (1 - pulseFactor * 0.5)

      // Pulse the satellite glows based on danger level
      const satGlowPulse = (Math.sin(Date.now() * 0.002) + 1) * 0.5 * 0.3 + 0.2
      sat1Glow.material.opacity = 0.3 + satGlowPulse * 0.2
      sat2Glow.material.opacity = 0.3 + satGlowPulse * 0.2

      controls.update()
      renderer.render(scene, camera)
    }

    // Start animation after a short delay to allow for loading
    setTimeout(() => {
      setIsLoading(false)
      animate()
    }, 500)

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [position1, position2, distance, dangerLevel])

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a101c] z-10">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-[#3b82f6] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#3b82f6]">Loading visualization...</p>
          </div>
        </div>
      )}
      <motion.div
        ref={containerRef}
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
    </div>
  )
}
