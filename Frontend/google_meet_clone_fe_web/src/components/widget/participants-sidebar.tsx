"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Mic, MicOff, Crown } from "lucide-react"

interface Participant {
    id: string
    name: string
    isLocal: boolean
    isMuted?: boolean
    isHost?: boolean
}

interface ParticipantsSidebarProps {
    isOpen: boolean
    onClose: () => void
    participants: Participant[]
}

export default function ParticipantsSidebar({ isOpen, onClose, participants }: ParticipantsSidebarProps) {
    const sidebarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen && sidebarRef.current) {
            gsap.fromTo(sidebarRef.current, { x: "100%" }, { x: "0%", duration: 0.4, ease: "power3.out" })
        } else if (!isOpen && sidebarRef.current) {
            gsap.to(sidebarRef.current, {
                x: "100%",
                duration: 0.3,
                ease: "power2.in",
            })
        }
    }, [isOpen])

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    if (!isOpen) return null

    return (
        <div
            ref={sidebarRef}
            className="fixed right-0 top-0 bottom-0 w-80 bg-card/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-50 flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div>
                    <h3 className="font-semibold text-lg">Participants</h3>
                    <p className="text-xs text-muted-foreground">{participants.length} in meeting</p>
                </div>
                <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Participants List */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                    {participants.map((participant) => (
                        <div
                            key={participant.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary-foreground">{getInitials(participant.name)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                    {participant.name}
                                    {participant.isLocal && " (You)"}
                                </p>
                                {participant.isHost && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Crown className="h-3 w-3" />
                                        <span>Host</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                                {participant.isMuted ? (
                                    <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                                        <MicOff className="h-4 w-4 text-destructive" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Mic className="h-4 w-4 text-primary" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
