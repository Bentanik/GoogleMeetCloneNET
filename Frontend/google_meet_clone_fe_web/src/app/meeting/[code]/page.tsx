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

export default function MeetingPage() {
    const params = useParams()
    const meetingCode = Array.isArray(params.code) ? params.code[0] : params.code ?? ""
    const containerRef = useRef<HTMLDivElement>(null)

    // use central store for media toggles so controls and options stay in sync
    const isVideoEnabled = useMediaStore((s) => s.isVideoEnabled)
    const isAudioEnabled = useMediaStore((s) => s.isAudioEnabled)
    const isScreenSharing = useMediaStore((s) => s.isScreenSharing)
    const stream = useMediaStore((s) => s.stream)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)
    const [participants, setParticipants] = useState<any[]>([
        { id: "local", name: "You", stream: null, isLocal: true, isHost: true, isMuted: false },
    ])
    // Pagination for large participant sets (frontend)
    // NOTE: PAGE_SIZE controls how many participant tiles are shown per page.
    // We use frontend pagination to avoid vertical overflow and keep the layout performant
    // when there are many participants. Adjust PAGE_SIZE here to change behavior.
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 16

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(containerRef.current, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
            })
        })

        // Simulate a couple of participants joining (only when not already populated)
        let timer1: ReturnType<typeof setTimeout> | null = null
        let timer2: ReturnType<typeof setTimeout> | null = null
        if (participants.length <= 1) {
            timer1 = setTimeout(() => {
                setParticipants((prev) => [
                    ...prev,
                    { id: "user-1", name: "Alex Chen", stream: null, isLocal: false, isMuted: false },
                ])
            }, 2000)

            timer2 = setTimeout(() => {
                setParticipants((prev) => [
                    ...prev,
                    { id: "user-2", name: "Sarah Johnson", stream: null, isLocal: false, isMuted: false },
                ])
            }, 4000)
        }

        return () => {
            ctx.revert()
            if (timer1) clearTimeout(timer1)
            if (timer2) clearTimeout(timer2)
        }
    }, [])

    const simulateHundred = () => {
        const simulated = [
            { id: "local", name: "You", stream: null, isLocal: true, isHost: true, isMuted: false },
        ]
        for (let i = 1; i <= 99; i++) {
            simulated.push({ id: `sim-${i}`, name: `Guest ${i}`, stream: null, isLocal: false, isHost: false, isMuted: false })
        }
        setParticipants(simulated)
        setPage(1)
    }

    // Keep the local participant's stream in sync with media store stream
    useEffect(() => {
        setParticipants((prev) =>
            prev.map((p) => (p.isLocal ? { ...p, stream: stream ?? null } : p))
        )

        // When stream or media flags change, enable/disable tracks accordingly
        if (stream) {
            try {
                stream.getVideoTracks().forEach((t) => (t.enabled = isVideoEnabled))
                stream.getAudioTracks().forEach((t) => (t.enabled = isAudioEnabled))
            } catch (err) {
                // ignore if tracks are not available
            }
        }
    }, [stream, isVideoEnabled, isAudioEnabled])

    // Delegate stream lifecycle to media store
    const requestStream = useMediaStore((s) => s.requestStream)
    const stopStream = useMediaStore((s) => s.stopStream)
    useEffect(() => {
        void requestStream(isVideoEnabled, isAudioEnabled)

        if (!isVideoEnabled && !isAudioEnabled) {
            stopStream()
        }
    }, [isVideoEnabled, isAudioEnabled, requestStream, stopStream])

    const handleToggleChat = () => {
        setIsChatOpen(!isChatOpen)
        if (!isChatOpen && isParticipantsOpen) {
            setIsParticipantsOpen(false)
        }
    }

    const handleToggleParticipants = () => {
        setIsParticipantsOpen(!isParticipantsOpen)
        if (!isParticipantsOpen && isChatOpen) {
            setIsChatOpen(false)
        }
    }

    // Ensure current page is valid when participants change
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(participants.length / PAGE_SIZE))
        if (page > totalPages) setPage(totalPages)
    }, [participants.length, page])

    const totalPages = Math.max(1, Math.ceil(participants.length / PAGE_SIZE))
    const startIdx = (page - 1) * PAGE_SIZE
    const endIdx = startIdx + PAGE_SIZE
    const participantsToShow = participants.length > PAGE_SIZE ? participants.slice(startIdx, endIdx) : participants

    // Pagination props to pass down to MeetingControls
    // Keyboard navigation and UI moved into MeetingControls

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

                {/* Pagination UI moved into MeetingControls for consistent placement */}

                <MeetingControls
                    onToggleChat={handleToggleChat}
                    onToggleParticipants={handleToggleParticipants}
                    meetingCode={meetingCode}
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    participantsCount={participants.length}
                />
                {/* Debug: simulate 100 participants (floating button) */}
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
