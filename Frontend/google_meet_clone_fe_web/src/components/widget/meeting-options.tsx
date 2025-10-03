"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from "lucide-react"

type MeetingOptionsProps = {
    meetingCode: string
    setMeetingCode: (v: string) => void
    displayName: string
    setDisplayName: (v: string) => void
    meetingPassword: string
    setMeetingPassword: (v: string) => void
    hasPassword: boolean
    setHasPassword: (v: boolean) => void
    onJoin: () => void
    onNew: () => void
    isCreating?: boolean
    isJoining?: boolean
}

export default function MeetingOptions({
    meetingCode,
    setMeetingCode,
    displayName,
    setDisplayName,
    meetingPassword,
    setMeetingPassword,
    hasPassword,
    setHasPassword,
    onJoin,
    onNew,
    isCreating = false,
    isJoining = false,
}: MeetingOptionsProps) {
    const [showPassword, setShowPassword] = useState(false)
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
                    <Button onClick={onJoin} disabled={!meetingCode.trim() || !displayName.trim() || isJoining}>
                        {isJoining ? "Joining..." : "Join"}
                    </Button>
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

                {/* Password Options */}
                <Card className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="hasPassword"
                            checked={hasPassword}
                            onChange={(e) => setHasPassword(e.target.checked)}
                            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-0"
                        />
                        <label htmlFor="hasPassword" className="text-sm font-medium text-primary cursor-pointer">
                            Require password for this meeting
                        </label>
                    </div>

                    {hasPassword && (
                        <div className="space-y-2">
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter meeting password"
                                    value={meetingPassword}
                                    onChange={(e) => setMeetingPassword(e.target.value)}
                                    autoComplete="off"
                                    className="focus-visible:ring-0 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeIcon className="w-4 h-4" />
                                    ) : (
                                        <EyeOffIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Participants will need this password to join the meeting
                            </p>
                        </div>
                    )}
                </Card>

                <Button
                    onClick={onNew}
                    className="w-full"
                    size="lg"
                    disabled={!displayName.trim() || (hasPassword && !meetingPassword.trim()) || isCreating}
                >
                    {isCreating ? "Creating..." : "Create Meeting"}
                </Button>
            </div>
        </div>
    )
}



