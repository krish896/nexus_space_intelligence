import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useHistory, useLocation } from 'react-router-dom';
import usePlanets from '../hooks/usePlanets';
import { playSound } from '../utils/audio';

const ExoplanetMap = () => {
  const mountRef = useRef(null);
  const planets = usePlanets();
  const history = useHistory();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const simulateTargetParam = searchParams.get('simulate');
  
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [simSpeed, setSimSpeed] = useState(0.5);
  const [isSimulatingFlight, setIsSimulatingFlight] = useState(false);

  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const cameraZoomOffset = useRef(40);
  const simSpeedRef = useRef(simSpeed);
  simSpeedRef.current = simSpeed;

  // Auto-targeting variables for Lerp
  const targetCameraPos = useRef(new THREE.Vector3(0, 200, 800));
  const targetControlTarget = useRef(new THREE.Vector3(0, 0, 0));
  
  const gameTime = useRef(0);

  useEffect(() => {
    if (!mountRef.current || planets.length === 0) return;

    let targetAutoSelected = false;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000305');
    scene.fog = new THREE.FogExp2('#000305', 0.001);

    // 2. Setup Camera
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 8000);
    camera.position.set(0, 300, 1000);

    // 3. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // 4. Setup Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 5. Build Galactic Particle Field
    const starGeo = new THREE.BufferGeometry();
    const starCount = 6000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
        starPos[i] = (Math.random() - 0.5) * 5000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const gridHelper = new THREE.GridHelper(3000, 60, 0x00f3ff, 0x002233);
    gridHelper.position.y = -100;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // 6. Earth Node (Origin)
    const earthGeo = new THREE.SphereGeometry(8, 32, 32);
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // Realistic Multi-Stage Rocket Design (Falcon Heavy aesthetic)
    const rocketGroup = new THREE.Group();
    
    // Main Body (Core Stage)
    const fuseGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 32);
    const fuseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
    const fuselage = new THREE.Mesh(fuseGeo, fuseMat);
    fuselage.rotation.x = Math.PI / 2; // Point forward
    rocketGroup.add(fuselage);
    
    // Slender Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.2, 0.8, 32);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.9, roughness: 0.1 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = 2.4;
    nose.rotation.x = Math.PI / 2;
    rocketGroup.add(nose);
    
    // Side Boosters (x2)
    const boosterGeo = new THREE.CylinderGeometry(0.15, 0.15, 3, 32);
    const boosterMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.8, roughness: 0.3 });
    const boost1 = new THREE.Mesh(boosterGeo, boosterMat);
    boost1.rotation.x = Math.PI / 2;
    boost1.position.set(0.35, 0, -0.5);
    const boost2 = new THREE.Mesh(boosterGeo, boosterMat);
    boost2.rotation.x = Math.PI / 2;
    boost2.position.set(-0.35, 0, -0.5);
    
    // Nose cones for boosters
    const bNoseGeo = new THREE.ConeGeometry(0.15, 0.4, 32);
    const bNose1 = new THREE.Mesh(bNoseGeo, noseMat);
    bNose1.rotation.x = Math.PI/2;
    bNose1.position.set(0.35, 0, 1.2);
    const bNose2 = new THREE.Mesh(bNoseGeo, noseMat);
    bNose2.rotation.x = Math.PI/2;
    bNose2.position.set(-0.35, 0, 1.2);
    
    rocketGroup.add(boost1, boost2, bNose1, bNose2);
    
    // Engine Bells
    const engineGeo = new THREE.CylinderGeometry(0.1, 0.2, 0.4, 16);
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1 });
    const engine0 = new THREE.Mesh(engineGeo, engineMat);
    engine0.rotation.x = Math.PI / 2;
    engine0.position.z = -2.2;
    rocketGroup.add(engine0);
    
    // Thruster Flare
    const thrustGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const thrustMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.8 });
    const thruster = new THREE.Mesh(thrustGeo, thrustMat);
    thruster.position.z = -2.4;
    rocketGroup.add(thruster);

    // Advanced Lighting for proper metallic reflections
    const amLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(200, 500, 300);
    scene.add(dirLight);

    rocketGroup.visible = false;
    scene.add(rocketGroup);
    // Flight Trail Group
    const trailGroup = new THREE.Group();
    scene.add(trailGroup);

    // Procedural Planet Shader (Simplex Noise emulation)
    const planetVertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const planetFragmentShader = `
      uniform float time;
      uniform vec3 baseColor;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      // Pseudo-random noise function
      float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
      float noise(vec2 x) {
        vec2 i = floor(x);
        vec2 f = fract(x);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      
      void main() {
        float n = noise(vUv * 10.0 + time * 0.1);
        n += 0.5 * noise(vUv * 20.0 - time * 0.15);
        vec3 col = mix(baseColor * 0.3, baseColor * 1.5, n);
        
        // Add artificial terminator shading
        float intensity = 1.05 - dot(normalize(vPosition), vec3(0.0, 0.0, 1.0));
        gl_FragColor = vec4(col * intensity, 1.0);
      }
    `;

    // 7. Planet Generations & Orbital Mechanics
    const planetMeshes = [];
    const hitGeo = new THREE.SphereGeometry(18, 8, 8); 
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const haloGeo = new THREE.SphereGeometry(6, 32, 32);

    planets.forEach((p, index) => {
      // Mechanics: Elliptical orbit generated via RA config
      const semiMajor = 150 + (index * 15) + Math.random() * 50; 
      const semiMinor = semiMajor * (0.8 + Math.random() * 0.2);
      
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,            
        semiMajor, semiMinor,
        0, 2 * Math.PI,  
        false,            
        (p.ra || 0) * (Math.PI / 180) // Add rotation off RA
      );

      // Render Orbital Path
      const pathPoints = orbitCurve.getPoints(100);
      const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints.map(pt => new THREE.Vector3(pt.x, 0, pt.y)));
      const pathMat = new THREE.LineBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.1 });
      const orbitLine = new THREE.Line(pathGeo, pathMat);
      scene.add(orbitLine);

      const group = new THREE.Group();

      // Procedural Shaded Core
      const coreGeo = new THREE.SphereGeometry(3.5 + Math.random() * 1.5, 32, 32);
      const customMat = new THREE.ShaderMaterial({
        vertexShader: planetVertexShader,
        fragmentShader: planetFragmentShader,
        uniforms: {
          time: { value: 0 },
          baseColor: { value: new THREE.Color(0x00f3ff) }
        }
      });
      const coreMesh = new THREE.Mesh(coreGeo, customMat);
      group.add(coreMesh);

      // Additive Halo
      const haloMat = new THREE.MeshBasicMaterial({ 
        color: 0x00f3ff, 
        transparent: true, 
        opacity: 0.2,
        blending: THREE.AdditiveBlending 
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      group.add(haloMesh);

      const hitBox = new THREE.Mesh(hitGeo, hitMat);
      
      // Store Mechanics Data
      hitBox.userData = { 
        ...p, 
        coreMesh, 
        haloMesh, 
        orbitCurve, 
        orbitSpeed: 0.0001 + Math.random() * 0.0002,
        orbitOffset: Math.random(),
        group 
      };
      
      group.add(hitBox);
      scene.add(group);
      planetMeshes.push(hitBox);

      // Auto-target from Simulator Redirect
      if (simulateTargetParam && p.keplerName === simulateTargetParam) {
        targetAutoSelected = hitBox;
      }
    });

    // 8. Interaction Logic
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHover = null;
    let localSelected = null;
    let flightCurve = null;
    let flightProgress = 0;

    const onMouseMove = (event) => {
      if (localSelected) return;

      const rect = renderer.domElement.getBoundingClientRect();
      setMousePos({ x: event.clientX, y: event.clientY });

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planetMeshes);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (currentHover !== object) {
          if (currentHover) {
             currentHover.userData.coreMesh.material.uniforms.baseColor.value.setHex(0x00f3ff);
             currentHover.userData.haloMesh.material.color.setHex(0x00f3ff);
          }
          currentHover = object;
          currentHover.userData.coreMesh.material.uniforms.baseColor.value.setHex(0xff003c);
          currentHover.userData.haloMesh.material.color.setHex(0xff003c);
          setHoveredPlanet(currentHover.userData);
          playSound("click");
          document.body.style.cursor = "crosshair";
        }
      } else {
        if (currentHover) {
          currentHover.userData.coreMesh.material.uniforms.baseColor.value.setHex(0x00f3ff);
          currentHover.userData.haloMesh.material.color.setHex(0x00f3ff);
          currentHover = null;
          setHoveredPlanet(null);
          document.body.style.cursor = "default";
        }
      }
    };

    const performPlanetSelect = (targetHitBox, triggerFlight = false) => {
        playSound("success");
        localSelected = targetHitBox;
        setSelectedPlanet(targetHitBox.userData);
        setHoveredPlanet(null);

        if (triggerFlight) {
           rocketGroup.visible = true;
           flightProgress = 0;
           setIsSimulatingFlight(true);
           
           // Lock camera to earth initially to watch departure
           targetCameraPos.current.set(30, 20, 50);
           targetControlTarget.current.set(0, 0, 0);
        } else {
           // Normal manual selection lock camera onto moving planet
           const pPos = targetHitBox.parent.position;
           targetCameraPos.current.set(pPos.x + 30, pPos.y + 15, pPos.z + 50);
        }
    };

    const onClick = () => {
      if (currentHover) {
        performPlanetSelect(currentHover);
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    if (targetAutoSelected) {
      setTimeout(() => performPlanetSelect(targetAutoSelected, true), 500);
    }

    // 9. Animation Engine
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const speed = simSpeedRef.current;
      gameTime.current += speed;

      // 1. Update Planetary Orbital Physics
      planetMeshes.forEach(hitBox => {
        const uData = hitBox.userData;
        
        // Advance orbital parameter
        const elapsed = (gameTime.current * uData.orbitSpeed) + uData.orbitOffset;
        const param = elapsed % 1.0;
        
        // Fetch 2D coordinate on the Ellipse
        const pt = uData.orbitCurve.getPoint(param);
        
        // Map 2D to 3D XZ plane
        hitBox.parent.position.set(pt.x, 0, pt.y);

        // Update shader time for procedural continents
        uData.coreMesh.material.uniforms.time.value += (0.01 * speed);

        // Atmosphere pulsing
        const haloScale = 1 + Math.sin(gameTime.current * 0.05 + hitBox.parent.position.x) * 0.15;
        uData.haloMesh.scale.set(haloScale, haloScale, haloScale);

        // Auto-follow Camera tracking if selected!
        if (localSelected === hitBox && !isSimulatingFlight) {
          targetControlTarget.current.copy(hitBox.parent.position);
          targetCameraPos.current.set(
            hitBox.parent.position.x + 40,
            hitBox.parent.position.y + 20,
            hitBox.parent.position.z + 60
          );
        }
      });

      // 2. Flight Simulation Physics
      if (localSelected && rocketGroup.visible) {
         flightProgress += 0.002 * speed;
         const targetPos = localSelected.parent.position.clone();
         
         // Dynamically generate the curve every frame since target moves!
         const dist = targetPos.length();

         // Direct DOM Telemetry updates for massive performance!
         const distEl = document.getElementById("tele-dist");
         const velEl = document.getElementById("tele-vel");
         const fuelEl = document.getElementById("tele-fuel");
         
         if (distEl && velEl && fuelEl) {
             const distRemaining = Math.max(0, dist * (1.0 - flightProgress));
             // Simulated mapping: 1 WebGL unit = 1.3 Parsecs = ~4.2 Light Years
             const lightYears = (distRemaining * 4.2).toFixed(2);
             
             // Dynamic Velocity: Varies naturally over the curve
             const baseVel = 14 + (Math.sin(flightProgress * Math.PI) * 8.5); // Accels in middle of flight
             const actualVel = (baseVel * speed).toFixed(2);
             
             const fuelBase = (Math.max(0, 1.0 - flightProgress) * 100).toFixed(1);

             distEl.innerText = `${lightYears} LY`;
             velEl.innerText = `${actualVel} c`;
             fuelEl.innerText = `${fuelBase} %`;
         }
         flightCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(targetPos.x * 0.3, dist * 0.3, targetPos.z * 0.3),
            targetPos
         ]);

         if (flightProgress >= 1.0) {
            flightProgress = 1.0;
            setIsSimulatingFlight(false); // Arrived!
            rocketGroup.visible = false;
         } else {
            const currentRocPos = flightCurve.getPoint(flightProgress);
            rocketGroup.position.copy(currentRocPos);

            // Drop trail breadcrumb occasionally
            if (Math.random() > 0.6) {
               const dotGeo = new THREE.SphereGeometry(0.1, 4, 4);
               const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
               const dot = new THREE.Mesh(dotGeo, dotMat);
               dot.position.copy(currentRocPos);
               trailGroup.add(dot);
            }

            // Look ahead
            if (flightProgress < 0.99) {
               const lookAhead = flightCurve.getPoint(flightProgress + 0.01);
               rocketGroup.lookAt(lookAhead);
            }

            // Cinematic Flight Camera - follow rocket dynamically!
            targetControlTarget.current.copy(currentRocPos);
            // Bind directly to cameraZoomOffset ensuring physical buttons override script
            targetCameraPos.current.set(
               currentRocPos.x - rocketGroup.getWorldDirection(new THREE.Vector3()).x * cameraZoomOffset.current,
               currentRocPos.y + (cameraZoomOffset.current * 0.4),
               currentRocPos.z - rocketGroup.getWorldDirection(new THREE.Vector3()).z * cameraZoomOffset.current
            );
         }
      }

      // Smooth Camera Lerp
      camera.position.lerp(targetCameraPos.current, 0.05);
      controls.target.lerp(targetControlTarget.current, 0.05);
      
      stars.rotation.y += (0.0002 * speed);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // External Reset hook
    window.resetGalaxyMap = () => {
      localSelected = null;
      setSelectedPlanet(null);
      playSound("click");
      targetCameraPos.current.set(0, 300, 1000);
      targetControlTarget.current.set(0, 0, 0);
      rocketGroup.visible = false;
      setIsSimulatingFlight(false);
      
      // clear trails
      while(trailGroup.children.length > 0){ 
        trailGroup.remove(trailGroup.children[0]); 
      }
      
      if (currentHover) {
        currentHover.userData.coreMesh.material.uniforms.baseColor.value.setHex(0x00f3ff);
        currentHover.userData.haloMesh.material.color.setHex(0x00f3ff);
        currentHover = null;
      }
    };

    window.triggerSimulate = () => {
        if (localSelected) {
          playSound("success");
          rocketGroup.visible = true;
          rocketGroup.position.set(0,0,0);
          flightProgress = 0;
          setIsSimulatingFlight(true);
          // clear previous trails
          while(trailGroup.children.length > 0){ 
             trailGroup.remove(trailGroup.children[0]); 
          }
       }
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onClick);
      }
      document.body.style.cursor = "default";
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      delete window.resetGalaxyMap;
      delete window.triggerSimulate;
    };
  }, [planets, simulateTargetParam]);

  const handleInitiateLaunch = () => {
    playSound("success");
    localStorage.setItem("nasa_target_planet", selectedPlanet.keplerName);
    history.push("/launch");
  };

  const handleZoomIn = () => {
     if (isSimulatingFlight) {
         cameraZoomOffset.current = Math.max(10, cameraZoomOffset.current - 10);
     } else {
         const dir = new THREE.Vector3().subVectors(targetControlTarget.current, targetCameraPos.current).normalize();
         targetCameraPos.current.add(dir.multiplyScalar(80)); 
     }
  };

  const handleZoomOut = () => {
     if (isSimulatingFlight) {
         cameraZoomOffset.current = Math.min(300, cameraZoomOffset.current + 10);
     } else {
         const dir = new THREE.Vector3().subVectors(targetCameraPos.current, targetControlTarget.current).normalize();
         targetCameraPos.current.add(dir.multiplyScalar(80)); 
     }
  };

  return (
    <div className="sci-fi-panel fade-in" style={{ height: "80vh", padding: 0, overflow: "hidden", position: "relative", border: "1px solid #00f3ff" }}>
      
      <div ref={mountRef} style={{ width: "100%", height: "100%", background: "#000" }} />

      {/* Screen HUD Overlays */}
      <div style={{ position: "absolute", top: "20px", left: "20px", pointerEvents: "none", zIndex: 1000 }}>
        <h2 style={{ color: "#00f3ff", fontFamily: "Orbitron", margin: 0, textShadow: "0 0 10px rgba(0,243,255,0.8)" }}>
          ASTRODYNAMICS SIMULATION
        </h2>
        <p style={{ color: "#fff", fontFamily: "Share Tech Mono", marginTop: "5px", fontSize: "14px" }}>
          &gt; {selectedPlanet ? `TARGET LOCKED: ${selectedPlanet.keplerName}` : "INTERACTIVE ORBITAL MECHANICS"}
        </p>

        {isSimulatingFlight && (
          <div className="fade-in" style={{ marginTop: "20px", padding: "15px", background: "rgba(0,10,20,0.8)", borderLeft: "3px solid #ffaa00" }}>
             <h3 style={{ margin: "0 0 10px 0", color: "#ffaa00", fontFamily: "Orbitron" }}>LIVE TELEMETRY FEED</h3>
             <table style={{ color: "#fff", fontFamily: "Share Tech Mono", fontSize: "14px", borderSpacing: "10px 5px", marginLeft: "-10px" }}>
               <tbody>
                 <tr><td style={{ color: "rgba(255,255,255,0.5)"}}>VELOCITY:</td>     <td id="tele-vel" style={{ color: "#00f3ff", fontWeight: "bold" }}>CALCULATING...</td></tr>
                 <tr><td style={{ color: "rgba(255,255,255,0.5)"}}>T-DISTANCE:</td>   <td id="tele-dist" style={{ color: "#00f3ff" }}>CALCULATING...</td></tr>
                 <tr><td style={{ color: "rgba(255,255,255,0.5)"}}>FUEL RESERVE:</td> <td id="tele-fuel" style={{ color: "#ff3333" }}>100.0 %</td></tr>
               </tbody>
             </table>
          </div>
        )}
      </div>

      {/* Time Dilation Control Panel */}
      <div style={{ position: "absolute", bottom: "20px", left: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <strong style={{ color: "#00f3ff", fontFamily: "Share Tech Mono", fontSize: "12px", marginRight: "10px" }}>TIME DILATION:</strong>
          <button className="sci-fi-btn" onClick={() => { playSound("click"); setSimSpeed(0.1); }} style={{ padding: "5px 10px", fontSize: "12px", background: simSpeed === 0.1 ? "rgba(0,243,255,0.5)" : "" }}>0.1x</button>
          <button className="sci-fi-btn" onClick={() => { playSound("click"); setSimSpeed(0.5); }} style={{ padding: "5px 10px", fontSize: "12px", background: simSpeed === 0.5 ? "rgba(0,243,255,0.5)" : "" }}>1x</button>
          <button className="sci-fi-btn" onClick={() => { playSound("click"); setSimSpeed(2.5); }} style={{ padding: "5px 10px", fontSize: "12px", background: simSpeed === 2.5 ? "rgba(0,243,255,0.5)" : "" }}>5x</button>
          <button className="sci-fi-btn" onClick={() => { playSound("click"); setSimSpeed(10.0); }} style={{ padding: "5px 10px", fontSize: "12px", background: simSpeed === 10.0 ? "rgba(0,243,255,0.5)" : "" }}>20x</button>
      </div>

      <div style={{ position: "absolute", bottom: "20px", right: "20px", pointerEvents: "none", textAlign: "right" }}>
        <p style={{ color: "rgba(0,243,255,0.5)", fontFamily: "Share Tech Mono", margin: 0 }}>
          {planets.length} BODIES TRACKING
        </p>
      </div>

      {/* Screen Zoom Control Panel */}
      <div style={{ position: "absolute", bottom: "70px", left: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <strong style={{ color: "#00f3ff", fontFamily: "Share Tech Mono", fontSize: "12px", marginRight: "10px" }}>MAP SCALE:</strong>
          <button className="sci-fi-btn" onClick={() => { playSound("click"); handleZoomIn(); }} style={{ padding: "5px 15px", fontSize: "16px", background: "rgba(0,20,40,0.8)" }}>+</button>
          <button className="sci-fi-btn" onClick={() => { playSound("click"); handleZoomOut(); }} style={{ padding: "5px 15px", fontSize: "16px", background: "rgba(0,20,40,0.8)" }}>-</button>
      </div>

      {/* Hover Tooltip */}
      {hoveredPlanet && !selectedPlanet && (
        <div style={{
          position: "fixed",
          top: mousePos.y + 20,
          left: mousePos.x + 20,
          background: "rgba(0, 20, 20, 0.9)",
          border: "1px solid #ffaa00",
          boxShadow: "0 0 15px rgba(255, 170, 0, 0.4)",
          padding: "15px",
          pointerEvents: "none",
          zIndex: 9999,
          fontFamily: "Share Tech Mono",
          width: "250px"
        }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#ffaa00", fontFamily: "Orbitron", borderBottom: "1px dashed rgba(255,170,0,0.5)", paddingBottom: "5px" }}>
            {hoveredPlanet.keplerName}
          </h3>
          <div style={{ color: "#fff", fontSize: "13px" }}>
            <div><strong style={{color:"#00f3ff"}}>ORBIT_A:</strong> {(hoveredPlanet.orbitCurve?.aY || 0).toFixed(1)} AU</div>
            <div><strong style={{color:"#00f3ff"}}>ORBIT_B:</strong> {(hoveredPlanet.orbitCurve?.xRadius || 0).toFixed(1)} AU</div>
          </div>
        </div>
      )}

      {/* Selected Action Terminal */}
      {selectedPlanet && (
        <div className="fade-in" style={{
          position: "absolute",
          top: "15%",
          right: "5%",
          background: "rgba(0, 5, 20, 0.85)",
          border: "2px solid #00f3ff",
          boxShadow: "0 0 30px rgba(0, 243, 255, 0.4), inset 0 0 20px rgba(0, 243, 255, 0.2)",
          padding: "30px",
          width: "350px",
          zIndex: 9000,
          clipPath: "polygon(0 20px, 20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
          backdropFilter: "blur(10px)"
        }}>
          
          <h2 style={{ fontFamily: "Orbitron", color: "#00f3ff", borderBottom: "2px solid rgba(0,243,255,0.4)", paddingBottom: "10px", margin: "0 0 20px 0" }}>
            {selectedPlanet.keplerName}
          </h2>
          
          <div style={{ fontFamily: "Share Tech Mono", fontSize: "15px", color: "#d3d3d3", lineHeight: "1.8", marginBottom: "30px" }}>
            <p style={{margin: 0}}><strong style={{color:"#fff"}}>COORD_RA:</strong> {selectedPlanet.ra?.toFixed(6) || "N/A"}°</p>
            <p style={{margin: 0}}><strong style={{color:"#fff"}}>COORD_DEC:</strong> {selectedPlanet.dec?.toFixed(6) || "N/A"}°</p>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.2)", margin: "10px 0" }}></div>
            {isSimulatingFlight ? (
              <p style={{margin: 0, color: "#ffaa00", animation: "pulse 1s infinite alternate"}}>&gt; ROCKET TRAJECTORY INTERCEPTING...</p>
            ) : (
                <p style={{margin: 0, color: "#00ffaa"}}>&gt; ORBITAL PATH LOCKED.</p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
             {!isSimulatingFlight && (
                <button 
                  onClick={() => window.triggerSimulate()}
                  className="sci-fi-btn" 
                  style={{ width: "100%", padding: "10px", fontSize: "13px", color: "#ffaa00", borderColor: "#ffaa00" }}
                >
                  SIMULATE FLIGHT ROUTE
                </button>
             )}
            <button 
              onClick={handleInitiateLaunch}
              className="sci-fi-btn" 
              style={{ width: "100%", padding: "15px", fontSize: "15px", background: "rgba(0,243,255,0.2)" }}
            >
              INITIALIZE LOGISTICS &gt;&gt;
            </button>
            <button 
              onClick={() => window.resetGalaxyMap()}
              className="sci-fi-btn" 
              style={{ width: "100%", padding: "10px", fontSize: "14px", border: "1px solid #ff3333", color: "#ff3333" }}
            >
              &lt; BREAK ORBIT 
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default ExoplanetMap;
