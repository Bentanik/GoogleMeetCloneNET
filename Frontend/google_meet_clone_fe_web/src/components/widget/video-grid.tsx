"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"
import ParticipantVideo from "@/components/widget/participant-video"

interface Participant {
    id: string
    name: string
    stream: MediaStream | null
    isLocal: boolean
}

interface VideoGridProps {
    participants: Participant[]
    isVideoEnabled: boolean
    isAudioEnabled: boolean
}

export default function VideoGrid({ participants, isVideoEnabled, isAudioEnabled }: VideoGridProps) {
    const gridRef = useRef<HTMLDivElement>(null)

    const [cols, setCols] = useState(1)
    const [rows, setRows] = useState(1)
    const [tileW, setTileW] = useState(180)
    const [tileH, setTileH] = useState(100)

    const aspectW = 16
    const aspectH = 9

    const computeLayout = useCallback((N: number, W: number, H: number) => {
        if (N <= 0 || W <= 0 || H <= 0) {
            setCols(1)
            setRows(1)
            setTileW(Math.floor(W))
            setTileH(Math.floor(H))
            return
        }

        // account for grid gap (Tailwind gap-4 = 1rem = 16px)
        const gap = 16

        // Try possible row counts and choose the layout that maximizes tile area while fitting the container.
        let best = { cols: 1, rows: N, tileH: 0, tileW: 0, area: 0, wasted: Infinity }

        // We'll iterate rows from 1..N (but cap to reasonable number to avoid long loops)
        const maxRows = Math.min(N, 50)
        for (let r = 1; r <= maxRows; r++) {
            const c = Math.ceil(N / r)
            const totalGapW = Math.max(0, (c - 1) * gap)
            const totalGapH = Math.max(0, (r - 1) * gap)
            const availW = W - totalGapW
            const availH = H - totalGapH

            if (availW <= 0 || availH <= 0) continue

            // max tile width by width constraint and by height constraint (with aspect)
            const maxTileWByWidth = Math.floor(availW / c)
            const maxTileHByHeight = Math.floor(availH / r)
            const maxTileWByHeight = Math.floor(maxTileHByHeight * (aspectW / aspectH))

            const tileW = Math.max(0, Math.min(maxTileWByWidth, maxTileWByHeight))
            const tileH = Math.floor(tileW * (aspectH / aspectW))

            if (tileW <= 0 || tileH <= 0) continue

            const usedW = c * tileW + totalGapW
            const usedH = r * tileH + totalGapH
            const wastedW = Math.max(0, W - usedW)
            const wastedH = Math.max(0, H - usedH)
            const wasted = wastedW * H + wastedH * W // heuristic for wasted space
            const area = tileW * tileH

            // prefer larger tile area; tie-breaker: smaller wasted space
            if (area > best.area || (area === best.area && wasted < best.wasted)) {
                best = { cols: c, rows: r, tileH, tileW, area, wasted }
            }
        }

        if (best.tileH <= 0) {
            setCols(1)
            setRows(N)
            const fallbackH = Math.max(80, Math.floor(H / N))
            setTileH(fallbackH)
            setTileW(Math.max(80, Math.floor(fallbackH * (aspectW / aspectH))))
            return
        }

        setCols(best.cols)
        setRows(best.rows)
        setTileH(best.tileH)
        setTileW(best.tileW)
    }, [])

    useEffect(() => {
        if (gridRef.current) {
            const videos = gridRef.current.querySelectorAll(".participant-video")
            if (videos.length > 0) {
                gsap.from(videos[videos.length - 1], {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.5,
                    ease: "back.out(1.7)",
                })
            }

            const rect = gridRef.current.getBoundingClientRect()
            computeLayout(participants.length, rect.width, rect.height)

            const ro = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const cr = entry.contentRect
                    computeLayout(participants.length, cr.width, cr.height)
                }
            })
            ro.observe(gridRef.current)
            return () => ro.disconnect()
        }
    }, [participants.length, computeLayout])

    return (
        <div className="w-full h-full flex items-start justify-center">
            <div
                ref={gridRef}
                className="grid gap-4 w-full h-full"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridAutoRows: `${tileH}px`,
                    alignContent: "start",
                    justifyItems: "stretch",
                }}
            >
                {participants.map((participant) => (
                    <div key={participant.id} style={{ width: "100%", height: `${tileH}px` }}>
                        <ParticipantVideo
                            participant={participant}
                            isVideoEnabled={participant.isLocal ? isVideoEnabled : true}
                            isAudioEnabled={participant.isLocal ? isAudioEnabled : true}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
