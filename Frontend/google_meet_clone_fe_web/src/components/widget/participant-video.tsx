"use client"

import { useEffect, useRef } from "react"
import { useMediaStore } from "@/stores/zustand/media"
import { MicOff } from "lucide-react"

interface Participant {
    id: string
    name: string
    stream: MediaStream | null
    isLocal: boolean
}

interface ParticipantVideoProps {
    participant: Participant
    isVideoEnabled: boolean
    isAudioEnabled: boolean
}

export default function ParticipantVideo({ participant, isVideoEnabled, isAudioEnabled }: ParticipantVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    // For local participant, use the centralized media store stream
    const storeStream = useMediaStore((s) => s.stream)

    useEffect(() => {
        const current = participant.isLocal ? storeStream : participant.stream
        if (videoRef.current) {
            videoRef.current.srcObject = current ?? null
        }

        // Enable/disable video/audio tracks based on flags when local
        if (participant.isLocal && storeStream) {
            try {
                storeStream.getVideoTracks().forEach((t) => (t.enabled = isVideoEnabled))
                storeStream.getAudioTracks().forEach((t) => (t.enabled = isAudioEnabled))
            } catch (err) {
                // ignore
            }
        }
    }, [participant, participant.stream, participant.isLocal, storeStream, isVideoEnabled, isAudioEnabled])

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    return (
        <div
            className="participant-video relative bg-card rounded-lg overflow-hidden border border-border/50 shadow-lg group"
            style={{ width: "100%", height: "100%", boxSizing: "border-box", borderWidth: "1px" }}
        >
            {((participant.isLocal && isVideoEnabled && storeStream) || (!participant.isLocal && participant.stream)) ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary-foreground">{getInitials(participant.name)}</span>
                    </div>
                </div>
            )}

            {/* Participant Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm drop-shadow-lg">{participant.name}</span>
                    <div className="flex items-center gap-2">
                        {!isAudioEnabled && (
                            <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                                <MicOff className="h-4 w-4 text-white" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Speaking Indicator */}
            {isAudioEnabled && (
                <div className="absolute inset-0 border-2 border-accent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </div>
    )
}
