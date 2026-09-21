import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const RotatingSphere = ({ position, color, speed = 0.01, radius = 0.5 }) => {
  const meshRef = useRef()
  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed
      meshRef.current.rotation.y += speed * 1.5
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.7}
        wireframe={false}
        roughness={0.3}
        metalness={0.8}
      />
    </mesh>
  )
}

const FloatingRing = ({ position, color, rotationSpeed = 0.02 }) => {
  const meshRef = useRef()
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed
      meshRef.current.rotation.z += rotationSpeed * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[1, 0.08, 16, 100]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  )
}

const SceneSetup = ({
  showStars = true,
  showControls = false,
  backgroundColor = '#0a0a1a',
  className = '',
  height = '100vh'
}) => {
  return (
    <div style={{ width: '100%', height }} className={className}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: backgroundColor }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color='#4fc3f7' />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color='#7c4dff'
        />
        <spotLight position={[0, 10, 0]} intensity={0.8} color='#ffffff' />

        {showStars && (
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
        )}

        <RotatingSphere
          position={[-4, 2, -2]}
          color='#1B3A6B'
          speed={0.008}
          radius={0.8}
        />
        <RotatingSphere
          position={[4, -2, -3]}
          color='#22c55e'
          speed={0.012}
          radius={0.6}
        />
        <RotatingSphere
          position={[0, 3, -4]}
          color='#7c3aed'
          speed={0.006}
          radius={1.0}
        />
        <RotatingSphere
          position={[-3, -3, -2]}
          color='#f59e0b'
          speed={0.015}
          radius={0.4}
        />
        <RotatingSphere
          position={[3, 3, -1]}
          color='#ef4444'
          speed={0.01}
          radius={0.5}
        />

        <FloatingRing
          position={[2, 0, -2]}
          color='#4fc3f7'
          rotationSpeed={0.015}
        />
        <FloatingRing
          position={[-2, 1, -3]}
          color='#7c3aed'
          rotationSpeed={0.01}
        />

        {showControls && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>
    </div>
  )
}

export default SceneSetup
