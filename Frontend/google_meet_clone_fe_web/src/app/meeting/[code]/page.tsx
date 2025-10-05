"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { gsap } from "gsap"
import VideoGrid from "@/components/widget/video-grid"
import MeetingControls from "@/components/widget/meeting-controls"
import MeetingHeader from "@/components/widget/meeting-header"
import ChatSidebar from "@/components/widget/chat-sidebar"
import ParticipantsSidebar from "@/components/widget/participants-sidebar"
import { useMediaStore } from "@/stores/zustand/media"

interface Participant {
    id: string
    name: string
    stream: MediaStream | null
    isLocal: boolean
    isHost?: boolean
    isMuted?: boolean
}

export default function MeetingPage() {
    const params = useParams()
    const meetingCode = Array.isArray(params.code) ? params.code[0] : params.code ?? ""
    const containerRef = useRef<HTMLDivElement>(null)

    const isVideoEnabled = useMediaStore((s) => s.isVideoEnabled)
    const isAudioEnabled = useMediaStore((s) => s.isAudioEnabled)
    const stream = useMediaStore((s) => s.stream)
    const requestStream = useMediaStore((s) => s.requestStream)
    const stopStream = useMediaStore((s) => s.stopStream)

    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)

    const [participants, setParticipants] = useState<Participant[]>([
        { id: "local", name: "You", stream: null, isLocal: true, isHost: true, isMuted: false },
    ])

    const [page, setPage] = useState(1)
    const [tilesPerPage, setTilesPerPage] = useState(16)

    // Animate & simulate some participants
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(containerRef.current, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
            })
        })

        const timer1 = setTimeout(() => {
            setParticipants((prev) => [
                ...prev,
                { id: "user-1", name: "Alex Chen", stream: null, isLocal: false, isMuted: false },
            ])
        }, 2000)

        const timer2 = setTimeout(() => {
            setParticipants((prev) => [
                ...prev,
                { id: "user-2", name: "Sarah Johnson", stream: null, isLocal: false, isMuted: false },
            ])
        }, 4000)

        return () => {
            ctx.revert()
            clearTimeout(timer1)
            clearTimeout(timer2)
        }
    }, [])

    const simulateHundred = () => {
        const simulated: Participant[] = [
            { id: "local", name: "You", stream: null, isLocal: true, isHost: true, isMuted: false },
        ]
        for (let i = 1; i <= 99; i++) {
            simulated.push({ id: `sim-${i}`, name: `Guest ${i}`, stream: null, isLocal: false, isHost: false, isMuted: false })
        }
        setParticipants(simulated)
        setPage(1)
    }

    // Sync local stream
    useEffect(() => {
        setParticipants((prev) =>
            prev.map((p) => (p.isLocal ? { ...p, stream: stream ?? null } : p))
        )
        if (stream) {
            try {
                stream.getVideoTracks().forEach((t) => (t.enabled = isVideoEnabled))
                stream.getAudioTracks().forEach((t) => (t.enabled = isAudioEnabled))
            } catch { }
        }
    }, [stream, isVideoEnabled, isAudioEnabled])

    useEffect(() => {
        void requestStream(isVideoEnabled, isAudioEnabled)
        if (!isVideoEnabled && !isAudioEnabled) stopStream()
    }, [isVideoEnabled, isAudioEnabled, requestStream, stopStream])

    // Responsive tilesPerPage based on container size
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return
            const W = containerRef.current.offsetWidth
            const H = containerRef.current.offsetHeight - 120

            const minTileW = 180
            const minTileH = 100
            const gap = 16

            const cols = Math.max(1, Math.floor((W + gap) / (minTileW + gap)))
            const rows = Math.max(1, Math.floor((H + gap) / (minTileH + gap)))

            setTilesPerPage(rows * cols)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Toggle sidebars
    const handleToggleChat = () => {
        setIsChatOpen(!isChatOpen)
        if (!isChatOpen && isParticipantsOpen) setIsParticipantsOpen(false)
    }

    const handleToggleParticipants = () => {
        setIsParticipantsOpen(!isParticipantsOpen)
        if (!isParticipantsOpen && isChatOpen) setIsChatOpen(false)
    }

    // Ensure page is valid
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(participants.length / tilesPerPage))
        if (page > totalPages) setPage(totalPages)
    }, [participants.length, tilesPerPage, page])

    const totalPages = Math.max(1, Math.ceil(participants.length / tilesPerPage))
    const startIdx = (page - 1) * tilesPerPage
    const endIdx = startIdx + tilesPerPage
    const participantsToShow = participants.slice(startIdx, endIdx)

    return (
        <>
            <div ref={containerRef} className="h-screen flex flex-col relative z-10">
                <MeetingHeader meetingCode={meetingCode} participantCount={participants.length} />

                <div className="flex-1 flex items-start justify-center p-4 overflow-hidden">
                    <VideoGrid
                        participants={participantsToShow}
                        isVideoEnabled={isVideoEnabled}
                        isAudioEnabled={isAudioEnabled}
                    />
                </div>

                <MeetingControls
                    onToggleChat={handleToggleChat}
                    onToggleParticipants={handleToggleParticipants}
                    meetingCode={meetingCode}
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    participantsCount={participants.length}
                />

                <button
                    onClick={simulateHundred}
                    title="Simulate 100 participants"
                    className="fixed bottom-6 right-6 z-50 bg-primary text-white px-3 py-2 rounded-full shadow-lg hover:brightness-95"
                >
                    Simulate 100
                </button>
            </div>

            <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            <ParticipantsSidebar
                isOpen={isParticipantsOpen}
                onClose={() => setIsParticipantsOpen(false)}
                participants={participants}
            />
        </>
    )
}
