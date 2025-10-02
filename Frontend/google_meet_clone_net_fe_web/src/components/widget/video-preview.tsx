"use client"

import { forwardRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff, SlidersHorizontal } from "lucide-react"

type VideoPreviewProps = {
    isVideoEnabled: boolean
    isAudioEnabled: boolean
    displayName?: string
    onToggleVideo: () => void
    onToggleAudio: () => void
}

const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>(
    ({ isVideoEnabled, isAudioEnabled, displayName, onToggleVideo, onToggleAudio }, ref) => {
        const [collapsed, setCollapsed] = useState(false)
        return (
            <div className="relative aspect-video rounded-xl overflow-hidden ring-1 ring-border/60 bg-transparent">
                {isVideoEnabled ? (
                    <video ref={ref} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1] bg-transparent" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/40">
                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary-foreground">
                                {displayName?.trim() ? displayName.trim()[0].toUpperCase() : "U"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Floating control bar with collapsible behavior */}
                {!collapsed ? (
                    <div className="absolute inset-x-0 bottom-3 flex items-center justify-center">
                        <div className="flex items-center gap-3 rounded-full bg-card/80 backdrop-blur-md px-3 py-2 ring-1 ring-border/60 shadow-md">
                            <Button size="icon" variant={isVideoEnabled ? "default" : "destructive"} onClick={onToggleVideo} className="rounded-full h-10 w-10">
                                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                            </Button>
                            <Button size="icon" variant={isAudioEnabled ? "default" : "destructive"} onClick={onToggleAudio} className="rounded-full h-10 w-10">
                                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                            </Button>
                            <Button size="icon" variant="outline" className="rounded-full h-10 w-10 bg-transparent" onClick={() => setCollapsed(true)}>
                                <SlidersHorizontal className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="absolute bottom-3 right-3">
                        <Button size="icon" variant="default" className="rounded-full h-10 w-10" onClick={() => setCollapsed(false)} aria-label="Expand controls">
                            <SlidersHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
        )
    }
)

VideoPreview.displayName = "VideoPreview"

export default VideoPreview



