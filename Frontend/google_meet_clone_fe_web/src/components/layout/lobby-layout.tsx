"use client"

import { PropsWithChildren, useRef } from "react"
import { Card } from "@/components/ui/card"
import { gsap } from "gsap"

export default function LobbyLayout({ children }: PropsWithChildren) {
    const cardRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return
        const rect = e.currentTarget.getBoundingClientRect()
        const relX = e.clientX - rect.left
        const relY = e.clientY - rect.top
        const midX = rect.width / 2
        const midY = rect.height / 2
        const rotateY = ((relX - midX) / midX) * 6
        const rotateX = -((relY - midY) / midY) * 6
        gsap.to(cardRef.current, {
            rotateY,
            rotateX,
            transformPerspective: 900,
            transformOrigin: "center",
            duration: 0.25,
            ease: "power2.out",
        })
    }

    const handleMouseLeave = () => {
        if (!cardRef.current) return
        gsap.to(cardRef.current, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: "power3.out",
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10 overflow-hidden" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {/* Animated gradient blobs and soft vignette */}
            <div className="pointer-events-none absolute -z-10 -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-purple-500/25 to-cyan-500/25 blur-[100px]" />
            <div className="pointer-events-none absolute -z-10 -bottom-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-rose-500/20 to-amber-500/20 blur-[110px]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_55%)]" />

            <Card ref={cardRef} className="w-full max-w-5xl p-8 md:p-10 backdrop-blur-xl bg-card/70 border-border/40 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)]">
                {children}
            </Card>
        </div>
    )
}


