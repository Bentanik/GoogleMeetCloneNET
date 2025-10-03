"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Phone, MessageSquare, Users, Settings } from "lucide-react"
import { useMediaStore } from "@/stores/zustand/media"

interface MeetingControlsProps {
    onToggleChat: () => void
    onToggleParticipants: () => void
    meetingCode?: string
    page?: number
    setPage?: (p: number | ((prev: number) => number)) => void
    totalPages?: number
    participantsCount?: number
}

export default function MeetingControls({ onToggleChat, onToggleParticipants, page, setPage, totalPages, participantsCount }: MeetingControlsProps) {
    const router = useRouter()
    const controlsRef = useRef<HTMLDivElement>(null)
    const [showEndConfirm, setShowEndConfirm] = useState(false)

    const isVideoEnabled = useMediaStore((s) => s.isVideoEnabled)
    const isAudioEnabled = useMediaStore((s) => s.isAudioEnabled)
    const isScreenSharing = useMediaStore((s) => s.isScreenSharing)
    const toggleVideo = useMediaStore((s) => s.toggleVideo)
    const toggleAudio = useMediaStore((s) => s.toggleAudio)
    const toggleScreenShare = useMediaStore((s) => s.toggleScreenShare)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(controlsRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.6,
                delay: 0.4,
                ease: "power2.out",
            })
        })

        return () => ctx.revert()
    }, [])

    // Keyboard navigation for pages moved here if props provided
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (!page || !setPage || !totalPages) return
            if (e.key === "ArrowLeft") setPage((p: number) => Math.max(1, p - 1))
            if (e.key === "ArrowRight") setPage((p: number) => Math.min(totalPages, p + 1))
        }

        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [page, setPage, totalPages])

    const handleEndCall = () => {
        gsap.to(controlsRef.current, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => router.push("/lobby"),
        })
    }

    return (
        <div ref={controlsRef} className="p-3 sm:p-4 backdrop-blur-xl bg-card/50 border-t border-border/50">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-3">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                    <Button aria-label="Open chat" size="icon" variant="ghost" onClick={onToggleChat} className="rounded-full h-10 w-10 sm:h-12 sm:w-12">
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                    <Button aria-label="Participants" size="icon" variant="ghost" onClick={onToggleParticipants} className="rounded-full h-10 w-10 sm:h-12 sm:w-12">
                        <Users className="h-5 w-5" />
                    </Button>
                </div>

                {/* Center Controls */}
                <div className="flex items-center gap-3">
                    <Button
                        aria-label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                        size="icon"
                        variant={isVideoEnabled ? "default" : "destructive"}
                        onClick={toggleVideo}
                        className="rounded-full h-12 w-12 sm:h-14 sm:w-14"
                    >
                        {isVideoEnabled ? <Video className="h-5 w-5 sm:h-6 sm:w-6" /> : <VideoOff className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </Button>

                    <Button
                        aria-label={isAudioEnabled ? "Mute" : "Unmute"}
                        size="icon"
                        variant={isAudioEnabled ? "default" : "destructive"}
                        onClick={toggleAudio}
                        className="rounded-full h-12 w-12 sm:h-14 sm:w-14"
                    >
                        {isAudioEnabled ? <Mic className="h-5 w-5 sm:h-6 sm:w-6" /> : <MicOff className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </Button>

                    <Button
                        aria-label={isScreenSharing ? "Stop sharing" : "Share screen"}
                        size="icon"
                        variant={isScreenSharing ? "default" : "outline"}
                        onClick={toggleScreenShare}
                        className="rounded-full h-12 w-12 sm:h-14 sm:w-14"
                    >
                        {isScreenSharing ? <Monitor className="h-5 w-5 sm:h-6 sm:w-6" /> : <MonitorOff className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </Button>

                    {showEndConfirm ? (
                        <div className="flex items-center gap-2 ml-2">
                            <Button size="sm" variant="destructive" onClick={handleEndCall} className="rounded-full">
                                Confirm End
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowEndConfirm(false)} className="rounded-full">
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => setShowEndConfirm(true)}
                            className="rounded-full h-12 w-12 sm:h-14 sm:w-14 ml-2"
                            aria-label="End call"
                        >
                            <Phone className="h-5 w-5 sm:h-6 sm:w-6 rotate-[135deg]" />
                        </Button>
                    )}
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                    {/* Pagination in controls */}
                    {totalPages && totalPages > 1 && setPage && page ? (
                        <div className="flex items-center gap-2 mr-2">
                            <button
                                title="Previous page"
                                aria-label="Previous page"
                                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                                className="p-2 rounded-full bg-muted/80 hover:bg-muted text-sm flex items-center justify-center shadow-sm"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <div className="px-3 py-1 rounded-full bg-muted/60 text-sm font-medium">{page} / {totalPages}</div>

                            <button
                                title="Next page"
                                aria-label="Next page"
                                onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                                className="p-2 rounded-full bg-muted/80 hover:bg-muted text-sm flex items-center justify-center shadow-sm"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    ) : null}

                    <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 sm:h-12 sm:w-12" title="Settings">
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
