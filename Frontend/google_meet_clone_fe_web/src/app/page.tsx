"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import LobbyLayout from "@/components/layout/lobby-layout"
import Title from "@/components/widget/title"
import VideoPreview from "@/components/widget/video-preview"
import MeetingOptions from "@/components/widget/meeting-options"
import { RoomService } from "@/services/room"
import { useLobbyStore } from "@/stores/zustand/lobby"
import { useMediaStore } from "@/stores/zustand/media"

export default function LobbyPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const meetingCode = useLobbyStore((s) => s.meetingCode)
  const setMeetingCode = useLobbyStore((s) => s.setMeetingCode)
  const isVideoEnabled = useMediaStore((s) => s.isVideoEnabled)
  const isAudioEnabled = useMediaStore((s) => s.isAudioEnabled)
  const displayName = useLobbyStore((s) => s.displayName)
  const setDisplayName = useLobbyStore((s) => s.setDisplayName)
  const stream = useMediaStore((s) => s.stream)
  const setStream = useMediaStore((s) => s.setStream)
  const toggleVideo = useMediaStore((s) => s.toggleVideo)
  const toggleAudio = useMediaStore((s) => s.toggleAudio)
  const meetingPassword = useLobbyStore((s) => s.meetingPassword)
  const setMeetingPassword = useLobbyStore((s) => s.setMeetingPassword)
  const hasPassword = useLobbyStore((s) => s.hasPassword)
  const setHasPassword = useLobbyStore((s) => s.setHasPassword)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from(contentRef.current, { opacity: 0, y: 16, duration: 0.6 })
        .from(titleRef.current, { y: 16, opacity: 0, duration: 0.5 }, "<+0.05")
        .from(previewRef.current, { y: 16, opacity: 0, duration: 0.5 }, "<")

      if (optionsRef.current) {
        const optionBlocks = optionsRef.current.querySelectorAll(".option-block")
        tl.from(optionBlocks, { y: 14, opacity: 0, stagger: 0.08, duration: 0.4 }, "<")
      }
    })

    return () => ctx.revert()
  }, [])

  const requestStream = useMediaStore((s) => s.requestStream)
  const stopStream = useMediaStore((s) => s.stopStream)

  // react to media flags changes by delegating to media store
  useEffect(() => {
    void requestStream(isVideoEnabled, isAudioEnabled)
  }, [isVideoEnabled, isAudioEnabled, requestStream])

  // attach store stream to video ref when available and cleanup on unmount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null
    }
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null
      // do not stop stream here; store manages lifecycle
    }
  }, [stream])

  const handleJoinMeeting = useCallback(async () => {
    if (!meetingCode.trim()) return
    setIsJoining(true)
    try {
      router.push(`/meeting/${meetingCode}`)
    } finally {
      setIsJoining(false)
    }
  }, [meetingCode, router])

  const handleNewMeeting = useCallback(async () => {
    const newCode = Math.random().toString(36).substring(2, 10)
    setIsCreating(true)
    try {
      const payload = {
        password: hasPassword ? meetingPassword : undefined,
      }
      const res = await RoomService.createRoom(payload)
      const roomCode = res.data?.roomCode ?? newCode
      router.push(`/meeting/${roomCode}`)
    } catch (err) {
      console.error("Failed to create room:", err)
    } finally {
      setIsCreating(false)
    }
  }, [router, hasPassword, meetingPassword])

  return (
    <>
      <LobbyLayout>
        <div ref={contentRef} className="grid md:grid-cols-2 gap-8">
          {/* Video Preview */}
          <div className="space-y-5">
            <Title ref={titleRef}>Ready to join?</Title>
            <div ref={previewRef}>
              <VideoPreview
                ref={videoRef}
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                displayName={displayName}
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
              displayName={displayName}
              setDisplayName={setDisplayName}
              meetingPassword={meetingPassword}
              setMeetingPassword={setMeetingPassword}
              hasPassword={hasPassword}
              setHasPassword={setHasPassword}
              onJoin={handleJoinMeeting}
              onNew={handleNewMeeting}
              isCreating={isCreating}
              isJoining={isJoining}
            />
          </div>
        </div>
      </LobbyLayout>
    </>
  )
}
