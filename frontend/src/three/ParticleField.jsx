import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const Particles = ({ count = 300, mousePosition }) => {
  const meshRef = useRef()
  const mouse = useRef({ x: 0, y: 0 })

  const [positions, originalPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const orig = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15
      const y = (Math.random() - 0.5) * 15
      const z = (Math.random() - 0.5) * 5
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
      orig[i * 3] = x
      orig[i * 3 + 1] = y
      orig[i * 3 + 2] = z
    }
    return [pos, orig]
  }, [count])

  useFrame(state => {
    if (!meshRef.current) return
    const posArray = meshRef.current.geometry.attributes.position.array
    const time = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      posArray[ix] =
        originalPositions[ix] + Math.sin(time * 0.5 + i * 0.1) * 0.3
      posArray[ix + 1] =
        originalPositions[ix + 1] + Math.cos(time * 0.3 + i * 0.05) * 0.3
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.rotation.y = time * 0.05
  })

  const colors = useMemo(() => {
    const colorArray = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#1B3A6B'),
      new THREE.Color('#2563EB'),
      new THREE.Color('#22c55e'),
      new THREE.Color('#7c3aed'),
      new THREE.Color('#f59e0b')
    ]
    for (let i = 0; i < count; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)]
      colorArray[i * 3] = color.r
      colorArray[i * 3 + 1] = color.g
      colorArray[i * 3 + 2] = color.b
    }
    return colorArray
  }, [count])

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach='attributes-color'
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

const ParticleField = ({
  count = 300,
  height = '100%',
  className = '',
  interactive = false
}) => {
  return (
    <div style={{ width: '100%', height }} className={className}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1} />
        <Particles count={count} />
      </Canvas>
    </div>
  )
}

export default ParticleField
