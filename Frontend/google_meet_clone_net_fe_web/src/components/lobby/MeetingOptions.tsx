"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type MeetingOptionsProps = {
    meetingCode: string
    setMeetingCode: (v: string) => void
    onJoin: () => void
    onNew: () => void
}

export default function MeetingOptions({ meetingCode, setMeetingCode, onJoin, onNew }: MeetingOptionsProps) {
    return (
        <div className="space-y-7 flex flex-col justify-center">
            <div className="space-y-3 option-block">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Join a meeting</h3>
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter meeting code"
                        value={meetingCode}
                        onChange={(e) => setMeetingCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onJoin()}
                        className="flex-1"
                    />
                    <Button onClick={onJoin} disabled={!meetingCode.trim()}>Join</Button>
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
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">Start a new meeting</h3>
                <Button onClick={onNew} className="w-full" size="lg">Create Meeting</Button>
            </div>
        </div>
    )
}


