"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Users, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface MeetingHeaderProps {
    meetingCode: string
    participantCount: number
}

export default function MeetingHeader({ meetingCode, participantCount }: MeetingHeaderProps) {
    const headerRef = useRef<HTMLDivElement>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, {
                y: -20,
                opacity: 0,
                duration: 0.6,
                delay: 0.2,
                ease: "power2.out",
            })
        })

        return () => ctx.revert()
    }, [])

    const copyMeetingCode = () => {
        navigator.clipboard.writeText(meetingCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div
            ref={headerRef}
            className="flex items-center justify-between p-4 backdrop-blur-xl bg-card/50 border-b border-border/50"
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">
                        {participantCount} participant{participantCount !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Meeting code:</span>
                    <span className="text-sm font-mono font-semibold">{meetingCode}</span>
                </div>
                <Button size="sm" variant="outline" onClick={copyMeetingCode} className="gap-2 bg-transparent">
                    {copied ? (
                        <>
                            <Check className="h-4 w-4" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            Copy
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
