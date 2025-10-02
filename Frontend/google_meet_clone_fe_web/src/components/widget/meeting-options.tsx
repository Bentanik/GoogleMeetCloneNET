"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type MeetingOptionsProps = {
    meetingCode: string
    setMeetingCode: (v: string) => void
    displayName: string
    setDisplayName: (v: string) => void
    onJoin: () => void
    onNew: () => void
}

export default function MeetingOptions({ meetingCode, setMeetingCode, displayName, setDisplayName, onJoin, onNew }: MeetingOptionsProps) {
    return (
        <div className="space-y-7 flex flex-col justify-center">
            <div className="space-y-3 option-block">
                <h3 className="text-lg font-semibold text-primary">Display name</h3>
                <Input
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 focus-visible:ring-0"
                />
            </div>
            <div className="space-y-3 option-block">
                <h3 className="text-lg font-semibold text-primary">Join a meeting</h3>
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter meeting code"
                        value={meetingCode}
                        onChange={(e) => setMeetingCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onJoin()}
                        className="flex-1 focus-visible:ring-0"
                    />
                    <Button onClick={onJoin} disabled={!meetingCode.trim() || !displayName.trim()}>Join</Button>
                </div>
            </div>

            <div className="relative option-block">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
            </div>

            <div className="space-y-3 option-block">
                <h3 className="text-lg font-semibold text-primary">Start a new meeting</h3>
                <Button onClick={onNew} className="w-full" size="lg" disabled={!displayName.trim()}>Create Meeting</Button>
            </div>
        </div>
    )
}



