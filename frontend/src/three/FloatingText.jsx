import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'

const FloatingWord = ({
  text,
  position,
  color = '#ffffff',
  fontSize = 0.5,
  floatIntensity = 1
}) => {
  const ref = useRef()

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={floatIntensity}>
      <Text
        ref={ref}
        position={position}
        fontSize={fontSize}
        color={color}
        anchorX='center'
        anchorY='middle'
        font='/fonts/inter-bold.woff'
      >
        {text}
      </Text>
    </Float>
  )
}

const SubjectWords = () => {
  const subjects = [
    { text: '📐 Math', position: [-4, 2, 0], color: '#60a5fa' },
    { text: '📚 English', position: [4, 1, -1], color: '#34d399' },
    { text: '🔬 Biology', position: [-3, -2, 0], color: '#22d3ee' },
    { text: '⚗️ Chemistry', position: [3, -1, -1], color: '#fb923c' },
    { text: '⚡ Physics', position: [0, 3, -1], color: '#a78bfa' },
    { text: '🏛️ Civics', position: [0, -3, 0], color: '#f87171' },
    { text: 'HEROY', position: [0, 0, 0], color: '#ffffff', fontSize: 1.2 }
  ]

  return (
    <>
      {subjects.map((word, i) => (
        <FloatingWord
          key={i}
          text={word.text}
          position={word.position}
          color={word.color}
          fontSize={word.fontSize || 0.4}
          floatIntensity={0.5 + Math.random() * 0.5}
        />
      ))}
    </>
  )
}

const FloatingText = ({ className = '', height = '400px' }) => {
  return (
    <div style={{ width: '100%', height }} className={className}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} color='#4fc3f7' />
        <SubjectWords />
      </Canvas>
    </div>
  )
}

export default FloatingText
