import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ParticleSystem = ({ count = 200, color = '#1B3A6B' }) => {
  const meshRef = useRef()

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      vel[i * 3] = (Math.random() - 0.5) * 0.01
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01
      vel[i * 3 + 2] = 0
    }
    return [pos, vel]
  }, [count])

  useFrame(() => {
    if (meshRef.current) {
      const posArray = meshRef.current.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        posArray[i * 3] += velocities[i * 3]
        posArray[i * 3 + 1] += velocities[i * 3 + 1]
        if (Math.abs(posArray[i * 3]) > 10) velocities[i * 3] *= -1
        if (Math.abs(posArray[i * 3 + 1]) > 10) velocities[i * 3 + 1] *= -1
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.05}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

const WaveGrid = () => {
  const meshRef = useRef()
  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.x =
        Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })

  return (
    <mesh ref={meshRef} position={[0, -3, -5]} rotation={[-Math.PI / 4, 0, 0]}>
      <planeGeometry args={[30, 30, 30, 30]} />
      <meshStandardMaterial
        color='#1B3A6B'
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  )
}

const Background = ({
  particleCount = 150,
  particleColor = '#1B3A6B',
  showGrid = true,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={style}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <ParticleSystem count={particleCount} color={particleColor} />
        {showGrid && <WaveGrid />}
      </Canvas>
    </div>
  )
}

export default Background
