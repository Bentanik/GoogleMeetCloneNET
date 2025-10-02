"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { Card } from "@/components/ui/card"
import Title from "@/components/lobby/Title"
import VideoPreview from "@/components/lobby/VideoPreview"
import MeetingOptions from "@/components/lobby/MeetingOptions"

export default function LobbyPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)
  const [meetingCode, setMeetingCode] = useState("")
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from(containerRef.current, { opacity: 0, duration: 0.6 })
        .from(
          cardRef.current,
          { y: 40, opacity: 0, duration: 0.9 },
          "<+0.1"
        )
        .from(titleRef.current, { y: 20, opacity: 0, duration: 0.6 }, "<+0.1")
        .from(previewRef.current, { y: 20, opacity: 0, duration: 0.6 }, "<")

      if (controlsRef.current) {
        const buttons = controlsRef.current.querySelectorAll("button")
        tl.from(
          buttons,
          { y: 12, opacity: 0, stagger: 0.08, duration: 0.4 },
          "<+0.05"
        )
      }

      if (optionsRef.current) {
        const optionBlocks = optionsRef.current.querySelectorAll(".option-block")
        tl.from(optionBlocks, { y: 16, opacity: 0, stagger: 0.08, duration: 0.45 }, "<")
      }

      // Animate subtle background blobs
      if (blob1Ref.current) {
        gsap.to(blob1Ref.current, {
          x: 20,
          y: 10,
          scale: 1.05,
          rotate: 8,
          duration: 10,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        })
      }
      if (blob2Ref.current) {
        gsap.to(blob2Ref.current, {
          x: -24,
          y: -12,
          scale: 1.06,
          rotate: -10,
          duration: 12,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        })
      }
    })

    return () => ctx.revert()
  }, [])

  // Release media tracks on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  // Lazily request/adjust stream when toggles change
  useEffect(() => {
    async function ensureStreamFor(wantVideo: boolean, wantAudio: boolean) {
      const hasVideo = !!stream?.getVideoTracks().length
      const hasAudio = !!stream?.getAudioTracks().length

      // If no desired media types, stop and clear
      if (!wantVideo && !wantAudio) {
        if (stream) {
          stream.getTracks().forEach((t) => t.stop())
        }
        setStream(null)
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
        return
      }

      // If current stream already matches desired types, just enable/disable tracks
      if (stream && hasVideo === wantVideo && hasAudio === wantAudio) {
        stream.getVideoTracks().forEach((t) => (t.enabled = wantVideo))
        stream.getAudioTracks().forEach((t) => (t.enabled = wantAudio))
        if (videoRef.current && wantVideo) {
          videoRef.current.srcObject = stream
        }
        if (videoRef.current && !wantVideo) {
          // keep preview area but without src
          videoRef.current.srcObject = null
        }
        return
      }

      // Otherwise, (re)request with the exact desired constraints
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: wantVideo,
          audio: wantAudio,
        })
        // Stop old stream if exists
        if (stream) stream.getTracks().forEach((t) => t.stop())
        setStream(newStream)
        // Attach to video element only if we have video
        if (videoRef.current) {
          videoRef.current.srcObject = wantVideo ? newStream : null
        }
      } catch (err) {
        console.error("[lobby] Error requesting media:", err)
      } ``
    }

    void ensureStreamFor(isVideoEnabled, isAudioEnabled)
  }, [isVideoEnabled, isAudioEnabled])

  // Handlers for controls ensure user intent drives permissions
  const toggleVideo = () => setIsVideoEnabled((v) => !v)
  const toggleAudio = () => setIsAudioEnabled((v) => !v)

  const handleJoinMeeting = () => {
    if (meetingCode.trim()) {
      router.push(`/meeting/${meetingCode}`)
    }
  }

  const handleNewMeeting = () => {
    const newCode = Math.random().toString(36).substring(2, 10)
    router.push(`/meeting/${newCode}`)
  }

  // Subtle parallax tilt on the card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const midX = rect.width / 2
    const midY = rect.height / 2
    const rotateY = ((relX - midX) / midX) * 6
    const rotateX = -((relY - midY) / midY) * 6
    gsap.to(cardRef.current, {
      rotateY,
      rotateX,
      transformPerspective: 900,
      transformOrigin: "center",
      duration: 0.25,
      ease: "power2.out",
    })
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power3.out",
    })
  }

  return (
    <>
      <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4 relative z-10 overflow-hidden" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        {/* Animated gradient blobs and soft vignette */}
        <div ref={blob1Ref} className="pointer-events-none absolute -z-10 -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-purple-500/25 to-cyan-500/25 blur-[100px]" />
        <div ref={blob2Ref} className="pointer-events-none absolute -z-10 -bottom-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-rose-500/20 to-amber-500/20 blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_55%)]" />

        <Card ref={cardRef} className="w-full max-w-5xl p-8 md:p-10 backdrop-blur-xl bg-card/70 border-border/40 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)]">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Video Preview */}
            <div className="space-y-5">
              <Title ref={titleRef}>Ready to join?</Title>
              <div ref={previewRef}>
                <VideoPreview
                  ref={videoRef}
                  isVideoEnabled={isVideoEnabled}
                  isAudioEnabled={isAudioEnabled}
                  meetingCode={meetingCode}
                  onToggleVideo={toggleVideo}
                  onToggleAudio={toggleAudio}
                />
              </div>
            </div>

            {/* Meeting Options */}
            <div ref={optionsRef}>
              <MeetingOptions
                meetingCode={meetingCode}
                setMeetingCode={setMeetingCode}
                onJoin={handleJoinMeeting}
                onNew={handleNewMeeting}
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
