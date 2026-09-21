import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { getSubjectHexColor } from '../utils/subjectColors'

const Card3D = ({ color, isHovered }) => {
  const meshRef = useRef()
  const glowRef = useRef()

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y = isHovered
        ? Math.sin(state.clock.elapsedTime * 2) * 0.2
        : Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      meshRef.current.rotation.x = isHovered
        ? Math.cos(state.clock.elapsedTime * 2) * 0.1
        : Math.cos(state.clock.elapsedTime * 0.5) * 0.03
      meshRef.current.scale.setScalar(isHovered ? 1.1 : 1.0)
    }
  })

  const cardColor = new THREE.Color(color)

  return (
    <group>
      <RoundedBox
        ref={meshRef}
        args={[2.5, 3.5, 0.15]}
        radius={0.15}
        smoothness={4}
      >
        <meshStandardMaterial
          color={cardColor}
          metalness={0.3}
          roughness={0.4}
          emissive={cardColor}
          emissiveIntensity={isHovered ? 0.3 : 0.1}
        />
      </RoundedBox>

      {isHovered && (
        <RoundedBox
          args={[2.7, 3.7, 0.05]}
          radius={0.15}
          position={[0, 0, -0.1]}
        >
          <meshStandardMaterial
            color={cardColor}
            transparent
            opacity={0.3}
            emissive={cardColor}
            emissiveIntensity={0.5}
          />
        </RoundedBox>
      )}
    </group>
  )
}

const SubjectCard3D = ({
  subject = 'math',
  onClick,
  className = '',
  size = 120
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const color = getSubjectHexColor(subject)

  return (
    <div
      style={{ width: size, height: size * 1.4 }}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color={color} />
        <Card3D color={color} isHovered={isHovered} />
      </Canvas>
    </div>
  )
}

export default SubjectCard3D
