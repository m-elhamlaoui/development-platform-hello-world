"use client"

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react"
import * as THREE from "three"
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { motion } from "framer-motion"
import { OBJLoader } from 'three-stdlib'

// @ts-nocheck
// If using TypeScript, install types: npm i --save-dev @types/three @types/three-obj-loader

// Type for props
interface EarthGlobeProps {
  satellites?: any[];
  onSatelliteClick?: (satellite: any) => void;
  activeSatellite?: any;
  zoomLevel?: number;
}

const EarthGlobe = forwardRef<unknown, EarthGlobeProps>(({
  satellites = [],
  onSatelliteClick = () => {},
  activeSatellite = null,
  zoomLevel = 5
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

    // Helper to generate unique orbital parameters
    function getOrbitParams(index: number, total: number, satellite: any) {
      // Eccentricity: 0 (circle) to 0.3 (mild ellipse)
      const eccentricity = satellite.orbitType === 'Geostationary' ? 0 : 0.1 + 0.2 * (index % 5) / 5;
      // Semi-major axis (radius)
      let a = 2.2;
      if (satellite.orbitType === 'Geostationary') a = 3.5;
      else if (satellite.orbitType === 'Medium Earth Orbit') a = 3.0;
      else if (satellite.orbitType === 'Low Earth Orbit') a = 2.4;
      else if (satellite.orbitType === 'Sun-synchronous') a = 2.6;
      // Semi-minor axis
      const b = a * (1 - eccentricity);
      // Inclination: 0 to 60 degrees
      let inclination = 0;
      if (satellite.orbitType === 'Sun-synchronous') inclination = Math.PI / 3;
      else if (satellite.orbitType === 'Low Earth Orbit') inclination = Math.PI / 6 + (index % 7) * 0.05;
      else if (satellite.orbitType === 'Medium Earth Orbit') inclination = Math.PI / 12 + (index % 5) * 0.03;
      // Argument of periapsis (rotation of ellipse in plane)
      const argPeriapsis = (index / total) * Math.PI * 2;
      return { a, b, eccentricity, inclination, argPeriapsis };
    }

    satellites.forEach((satellite, index) => {
      const { a, b, inclination, argPeriapsis } = getOrbitParams(index, satellites.length, satellite);
      const orbitSpeed = satellite.orbitType === 'Geostationary' ? 0.000005 : satellite.orbitType === 'Medium Earth Orbit' ? 0.00001 : satellite.orbitType === 'Low Earth Orbit' ? 0.00002 : 0.000015;
      const objLoader = new OBJLoader();

      // --- Orbit Trajectory Line ---
      const orbitPoints: THREE.Vector3[] = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = a * Math.cos(theta + argPeriapsis);
        const y = b * Math.sin(theta + argPeriapsis) * Math.sin(inclination);
        const z = b * Math.sin(theta + argPeriapsis) * Math.cos(inclination);
        orbitPoints.push(new THREE.Vector3(x, y, z));
      }
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: satellite.color || 0x3b82f6,
        transparent: true,
        opacity: 0.5,
        linewidth: 1,
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);

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
          a * Math.cos(angle + argPeriapsis),
          b * Math.sin(angle + argPeriapsis) * Math.sin(inclination),
          b * Math.sin(angle + argPeriapsis) * Math.cos(inclination),
        );
        object.userData.satellite = satellite;
        scene.add(object);
        satelliteObjects[satellite.id] = {
          mesh: object,
          a,
          b,
          inclination,
          argPeriapsis,
          orbitSpeed,
          initialAngle: angle,
          orbit: orbitLine,
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

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      requestAnimationFrame(animate)
      const delta = clock.getDelta()
      if (earthRef.current && autoRotateRef.current) {
        earthRef.current.rotation.y += 0.02 * delta
      }
      if (cloudsRef.current && autoRotateRef.current) {
        cloudsRef.current.rotation.y += 0.022 * delta
      }
      Object.values(satelliteObjects).forEach((obj: any) => {
        const time = Date.now() * obj.orbitSpeed;
        const angle = obj.initialAngle + time;
        obj.mesh.position.x = obj.a * Math.cos(angle + obj.argPeriapsis);
        obj.mesh.position.y = obj.b * Math.sin(angle + obj.argPeriapsis) * Math.sin(obj.inclination);
        obj.mesh.position.z = obj.b * Math.sin(angle + obj.argPeriapsis) * Math.cos(obj.inclination);
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
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [satellites])

  // Update satellite visibility and highlighting when filtered or active
  useEffect(() => {
    if (!scene || !satelliteObjects) return

    const satelliteIds = satellites.map((s) => s.id)

    Object.entries(satelliteObjects).forEach(([id, obj]) => {
      if (!obj.mesh) return; // Skip if mesh is not loaded yet
      const isVisible = satelliteIds.includes(Number(id))
      const isActive = activeSatellite && Number(id) === activeSatellite.id

      // Update visibility
      obj.mesh.visible = isVisible
      if (obj.orbit) obj.orbit.visible = isVisible
      if (obj.trail) obj.trail.visible = isVisible

      // Update highlighting for active satellite
      if (isActive) {
        if (obj.glow) obj.glow.scale.set(2, 2, 2)
        if (obj.glow && obj.glow.material) obj.glow.material.opacity = 0.5
        if (obj.orbit && obj.orbit.material && obj.mesh && obj.mesh.material && obj.mesh.material.color) {
          obj.orbit.material.opacity = 0.8
          obj.orbit.material.color.set(0xffffff)
        }
        if (obj.trail && obj.trail.material) obj.trail.material.opacity = 0.5
      } else {
        if (obj.glow) obj.glow.scale.set(1, 1, 1)
        if (obj.glow && obj.glow.material) obj.glow.material.opacity = 0.3
        if (obj.orbit && obj.orbit.material && obj.mesh && obj.mesh.material && obj.mesh.material.color) {
          obj.orbit.material.opacity = 0.3
          obj.orbit.material.color.set(obj.mesh.material.color)
        }
        if (obj.trail && obj.trail.material) obj.trail.material.opacity = 0.2
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
