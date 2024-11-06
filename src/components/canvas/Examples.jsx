'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import { Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'

export const Blob = ({ route = '/', ...props }) => {
  const router = useRouter()
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  return (
    <mesh
      onClick={() => router.push(route)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
    </mesh>
  )
}

export const Logo = ({ route = '/blob', ...props }) => {
  const mesh = useRef(null)
  const router = useRouter()

  const [hovered, hover] = useState(false)
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), [])

  useCursor(hovered)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(t) * (Math.PI / 8)
    mesh.current.rotation.x = Math.cos(t) * (Math.PI / 8)
    mesh.current.rotation.z -= delta / 4
  })

  return (
    <group ref={mesh} {...props}>
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, 1]} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, -1]} />
      <mesh onClick={() => router.push(route)} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
      </mesh>
    </group>
  )
}

export const Cubes = (props) => {
  const mesh = useRef()
  const timeRef = useRef(0)

  // Initialize the MarchingCubes effect using useMemo
  const effect = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      color: 0x8e13ed,
      specular: 0x0099ff,
      shininess: 100,
    })
    const marchingCubes = new MarchingCubes(28, material, true, true, 100000)
    marchingCubes.position.set(0, 0, 0)
    marchingCubes.scale.set(2, 2, 2)
    marchingCubes.enableUvs = false
    marchingCubes.enableColors = false
    marchingCubes.isolation = 80
    return marchingCubes
  }, [])

  // Animation loop using useFrame
  useFrame((state, delta) => {
    timeRef.current += delta * 2
    effect.reset()

    const numblobs = 8
    const subtract = 12
    const strength = 1.2 / ((Math.sqrt(numblobs) - 1) / 4 + 1)

    // Add metaballs to the effect
    for (let i = 0; i < numblobs; i++) {
      const ballx = Math.sin(i + 1.26 * timeRef.current * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.37 + 0.5
      const bally = Math.abs(Math.cos(i + 1.12 * timeRef.current * Math.cos(1.22 + 0.1424 * i))) * 0.77
      const ballz = Math.cos(i + 1.32 * timeRef.current * 0.1 * Math.sin(0.92 + 0.53 * i)) * 0.27 + 0.5
      effect.addBall(ballx, bally, ballz, strength, subtract)
    }

    effect.update()

    // Rotate the mesh
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(timeRef.current * 0.5) * (Math.PI / 8)
      mesh.current.rotation.x = Math.cos(timeRef.current * 0.5) * (Math.PI / 8)
    }
  })

  // Return the primitive component
  return <primitive ref={mesh} object={effect} {...props} />
}
