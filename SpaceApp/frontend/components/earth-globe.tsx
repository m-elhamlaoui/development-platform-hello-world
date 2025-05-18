"use client"

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react"
import * as THREE from "three"
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { motion } from "framer-motion"
import { OBJLoader } from 'three-stdlib'
import * as satellite from 'satellite.js'

// @ts-nocheck
// If using TypeScript, install types: npm i --save-dev @types/three @types/three-obj-loader

// Type for props
interface EarthGlobeProps {
  satellites?: any[];
  onSatelliteClick?: (satellite: any) => void;
  activeSatellite?: any;
  zoomLevel?: number;
  zoom?: number;
}

const EarthGlobe = forwardRef<unknown, EarthGlobeProps>(({
  satellites = [],
  onSatelliteClick = () => {},
  activeSatellite = null,
  zoomLevel = 5,
  zoom = 1
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scene, setScene] = useState<THREE.Scene | null>(null)
  const [satelliteObjects, setSatelliteObjects] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const earthRef = useRef<THREE.Mesh | null>(null)
  const cloudsRef = useRef<THREE.Mesh | null>(null)
  const autoRotateRef = useRef(true)
  const [satelliteData, setSatelliteData] = useState<Record<string, {
    tle1: string;
    tle2: string;
    satrec: any;
    lastUpdate: number;
    noradId: string;
  }>>({})

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (controlsRef.current) {
        controlsRef.current.dollyIn(1.2)
        controlsRef.current.update()
      }
    },
    zoomOut: () => {
      if (controlsRef.current) {
        controlsRef.current.dollyOut(1.2)
        controlsRef.current.update()
      }
    },
    resetView: () => {
      if (controlsRef.current && cameraRef.current) {
        cameraRef.current.position.set(0, 0, 5)
        cameraRef.current.lookAt(0, 0, 0)
        controlsRef.current.reset()
        controlsRef.current.update()
      }
    },
    toggleRotation: (state: boolean) => {
      if (controlsRef.current) {
        autoRotateRef.current = state
        controlsRef.current.autoRotate = state
      }
    },
  }))

  // Function to fetch TLE data once and store it
  const fetchAndStoreTLE = async (noradId: string) => {
    try {
      const response = await fetch(`https://celestrak.com/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=TLE`)
      const text = await response.text()
      const lines = text.trim().split('\n')
      if (lines.length >= 3) {
        const tle1 = lines[1]
        const tle2 = lines[2]
        const satrec = satellite.twoline2satrec(tle1, tle2)
        return {
          tle1,
          tle2,
          satrec,
          lastUpdate: Date.now(),
          noradId
        }
      }
    } catch (error) {
      console.error(`Error fetching TLE for satellite ${noradId}:`, error)
    }
    return null
  }

  // Calculate position from stored satellite data
  const calculatePosition = (satData: any) => {
    const positionAndVelocity = satellite.propagate(satData.satrec, new Date())
    const positionEci = positionAndVelocity.position
    if (!positionEci) return null

    // Convert ECI coordinates to match our scene
    // Earth radius is 6371 km, we scale it to 2 units in our scene
    const scale = 2 / 6371 // Scale factor to convert km to scene units
    
    // Convert ECI to scene coordinates
    // Note: ECI coordinates are in km, we convert to scene units
    return {
      x: positionEci.x * scale,
      y: positionEci.y * scale,
      z: positionEci.z * scale
    }
  }

  // Add new function to calculate orbit points
  const calculateOrbitPoints = (satData: any, numPoints = 100) => {
    const points = []
    const period = 2 * Math.PI / satData.satrec.no // Orbital period in minutes
    const timeStep = period / numPoints
    
    for (let i = 0; i <= numPoints; i++) {
      const time = new Date(Date.now() + i * timeStep * 60 * 1000)
      const positionAndVelocity = satellite.propagate(satData.satrec, time)
      const positionEci = positionAndVelocity.position
      
      if (positionEci) {
        const scale = 2 / 6371 // Same scale as satellite positions
        points.push(
          new THREE.Vector3(
            positionEci.x * scale,
            positionEci.y * scale,
            positionEci.z * scale
          )
        )
      }
    }
    
    return points
  }

  // Initialize satellite data when satellites change
  useEffect(() => {
    const initializeSatellites = async () => {
      const newData: Record<string, any> = {}
      for (const sat of satellites) {
        if (sat.norad_id && !satelliteData[sat.id]) {
          const data = await fetchAndStoreTLE(sat.norad_id.toString())
          if (data) {
            // Store the satellite data
            newData[sat.id] = {
              ...data,
              noradId: sat.norad_id,
            }
          }
        }
      }
      if (Object.keys(newData).length > 0) {
        setSatelliteData(prev => ({ ...prev, ...newData }))
      }
    }
    initializeSatellites()
  }, [satellites])

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 3
    controls.maxDistance = 10
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.2
    controlsRef.current = controls

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 2))
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(5, 3, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    scene.add(directionalLight)
    const pointLight = new THREE.PointLight(0x3b82f6, 1, 10)
    pointLight.position.set(-5, 2, 2)
    scene.add(pointLight)
    const rimLight = new THREE.PointLight(0x3b82f6, 0.5, 15)
    rimLight.position.set(-10, 0, -10)
    scene.add(rimLight)

    // Earth
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
    const textureLoader = new THREE.TextureLoader()
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: textureLoader.load("/assets/3d/texture_earth.jpg", () => {
        renderer.render(scene, camera)
      }),
      bumpMap: textureLoader.load("/assets/3d/texture_earth.jpg"),
      bumpScale: 0.05,
      specularMap: textureLoader.load("/assets/3d/texture_earth.jpg"),
      specular: new THREE.Color(0x333333),
      shininess: 15,
    })
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    earth.castShadow = true
    earth.receiveShadow = true
    earthRef.current = earth
    scene.add(earth)

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(2.05, 64, 64)
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    })
    scene.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial))

    // Outer glow
    const outerGlowGeometry = new THREE.SphereGeometry(2.2, 64, 64)
    const outerGlowMaterial = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
    })
    scene.add(new THREE.Mesh(outerGlowGeometry, outerGlowMaterial))

    // Clouds
    const cloudsGeometry = new THREE.SphereGeometry(2.02, 64, 64)
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: textureLoader.load("/assets/3d/texture_earth.jpg"),
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    })
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial)
    cloudsRef.current = clouds
    scene.add(clouds)

    // Stars
    const starsGeometry = new THREE.BufferGeometry()
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    })
    const starsVertices = []
    for (let i = 0; i < 15000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000)
      const y = THREE.MathUtils.randFloatSpread(2000)
      const z = THREE.MathUtils.randFloatSpread(2000)
      starsVertices.push(x, y, z)
    }
    starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3))
    scene.add(new THREE.Points(starsGeometry, starsMaterial))

    satellites.forEach((satellite, index) => {
      const objLoader = new OBJLoader();

      objLoader.load('/assets/3d/satellite.obj', (object: THREE.Object3D) => {
        object.traverse((child: any) => {
          if (child.isMesh) {
            child.material = new THREE.MeshPhongMaterial({
              color: satellite.color || 0x3b82f6,
              emissive: satellite.color || 0x3b82f6,
              emissiveIntensity: 0.7,
              shininess: 30,
            })
          }
        })
        object.scale.set(0.05, 0.05, 0.05)
        // Initial position
        const angle = (index / satellites.length) * Math.PI * 2;
        object.position.set(
          Math.cos(angle),
          Math.sin(angle) * Math.sin(Math.PI / 6),
          Math.sin(angle) * Math.cos(Math.PI / 6),
        );
        object.userData.satellite = satellite;
        scene.add(object);
        satelliteObjects[satellite.id] = {
          mesh: object,
          initialAngle: angle,
        };
      });
    });

    // Raycaster for satellite selection
    const raycaster = new THREE.Raycaster()
    raycaster.params.Points.threshold = 0.1
    const mouse = new THREE.Vector2()
    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)
      for (let i = 0; i < intersects.length; i++) {
        const object = intersects[i].object as any
        if (object.userData && object.userData.satellite) {
          onSatelliteClick(object.userData.satellite)
          break
        }
        if (object.parent && object.parent.userData && object.parent.userData.satellite) {
          onSatelliteClick(object.parent.userData.satellite)
          break
        }
      }
    }
    renderer.domElement.addEventListener("click", handleClick)

    // Create orbit lines for each satellite
    const orbitLines: Record<string, THREE.Line> = {}
    
    Object.entries(satelliteData).forEach(([id, satData]) => {
      const points = calculateOrbitPoints(satData)
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.3,
        linewidth: 1
      })
      const orbitLine = new THREE.Line(geometry, material)
      scene.add(orbitLine)
      orbitLines[id] = orbitLine
    })

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      requestAnimationFrame(animate)
      const delta = clock.getDelta()

      // Update Earth and clouds rotation
      if (earthRef.current && autoRotateRef.current) {
        earthRef.current.rotation.y += 0.02 * delta
      }
      if (cloudsRef.current && autoRotateRef.current) {
        cloudsRef.current.rotation.y += 0.022 * delta
      }

      // Update satellite positions using stored data
      Object.entries(satelliteObjects).forEach(([id, obj]) => {
        const satData = satelliteData[id]
        if (satData && obj.mesh) {
          const position = calculatePosition(satData)
          if (position) {
            // Apply the position
            obj.mesh.position.set(position.x, position.y, position.z)
            
            // Make satellite face the direction of travel
            const velocity = satellite.propagate(satData.satrec, new Date()).velocity
            if (velocity) {
              const direction = new THREE.Vector3(velocity.x, velocity.y, velocity.z).normalize()
              obj.mesh.lookAt(
                obj.mesh.position.x + direction.x,
                obj.mesh.position.y + direction.y,
                obj.mesh.position.z + direction.z
              )
            }
          }
        }
      })

      controls.update()
      renderer.render(scene, camera)
    }
    animate()
    setIsLoading(false)

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener("resize", handleResize)
    setScene(scene)
    setSatelliteObjects(satelliteObjects)
    return () => {
      window.removeEventListener("resize", handleResize)
      renderer.domElement.removeEventListener("click", handleClick)
      // Dispose of orbit lines
      Object.values(orbitLines).forEach(line => {
        line.geometry.dispose()
        line.material.dispose()
        scene.remove(line)
      })
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [satellites, satelliteData])

  // Update satellite visibility and highlighting when filtered or active
  useEffect(() => {
    if (!scene || !satelliteObjects) return

    const satelliteIds = satellites.map((s) => s.id)

    Object.entries(satelliteObjects).forEach(([id, obj]) => {
      if (!obj.mesh) return
      const isVisible = satelliteIds.includes(Number(id))
      const isActive = activeSatellite && Number(id) === activeSatellite.id

      // Update visibility
      obj.mesh.visible = isVisible

      // Update orbit line visibility and highlighting
      const orbitLine = scene.children.find(child => 
        child instanceof THREE.Line && child.userData.satelliteId === id
      ) as THREE.Line | undefined

      if (orbitLine) {
        orbitLine.visible = isVisible
        if (isActive) {
          orbitLine.material.opacity = 0.6
          orbitLine.material.color.setHex(0x60a5fa)
        } else {
          orbitLine.material.opacity = 0.3
          orbitLine.material.color.setHex(0x3b82f6)
        }
      }

      // Update highlighting for active satellite
      if (isActive) {
        if (obj.glow) obj.glow.scale.set(2, 2, 2)
        if (obj.glow && obj.glow.material) obj.glow.material.opacity = 0.5
      } else {
        if (obj.glow) obj.glow.scale.set(1, 1, 1)
        if (obj.glow && obj.glow.material) obj.glow.material.opacity = 0.3
      }
    })
  }, [satellites, scene, satelliteObjects, activeSatellite])

  // Update camera position based on zoom level
  useEffect(() => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.minDistance = Math.max(3, zoomLevel - 2)
      controlsRef.current.maxDistance = Math.min(10, zoomLevel + 2)
    }
  }, [zoomLevel])

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a101c] z-10">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-[#3b82f6] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#3b82f6]">Loading Earth...</p>
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
})

EarthGlobe.displayName = "EarthGlobe"

export default EarthGlobe