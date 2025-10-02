"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei"
import type * as THREE from "three"

function AnimatedSphere({
    position,
    color,
    speed,
}: { position: [number, number, number]; color: string; speed: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3
            meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2
        }
    })

    return (
        <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
                <MeshDistortMaterial color={color} attach="material" distort={0.4} speed={2} roughness={0.2} metalness={0.8} />
            </Sphere>
        </Float>
    )
}

function RotatingTorus({ position }: { position: [number, number, number] }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
        }
    })

    return (
        <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef} position={position}>
                <torusGeometry args={[1.5, 0.4, 16, 100]} />
                <meshStandardMaterial
                    color="#8b5cf6"
                    roughness={0.1}
                    metalness={0.9}
                    emissive="#8b5cf6"
                    emissiveIntensity={0.3}
                />
            </mesh>
        </Float>
    )
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
            <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} castShadow />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <AnimatedSphere position={[-4, 2, -5]} color="#6366f1" speed={0.5} />
            <AnimatedSphere position={[4, -2, -5]} color="#8b5cf6" speed={0.7} />
            <AnimatedSphere position={[0, 3, -8]} color="#a855f7" speed={0.4} />

            <RotatingTorus position={[5, 0, -6]} />

            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <mesh position={[-5, -1, -4]}>
                    <octahedronGeometry args={[1.5, 0]} />
                    <meshStandardMaterial
                        color="#6366f1"
                        roughness={0.2}
                        metalness={0.8}
                        emissive="#6366f1"
                        emissiveIntensity={0.2}
                    />
                </mesh>
            </Float>

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
            />
        </>
    )
}

export default function ThreeDLoginBackground() {
    return (
        <div className="fixed inset-0 -z-10">
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }} gl={{ alpha: true, antialias: true }}>
                <Scene />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
        </div>
    )
}
