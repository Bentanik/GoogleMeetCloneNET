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

export default function LobbyPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const meetingCode = useLobbyStore((s) => s.meetingCode)
  const setMeetingCode = useLobbyStore((s) => s.setMeetingCode)
  const isVideoEnabled = useLobbyStore((s) => s.isVideoEnabled)
  const isAudioEnabled = useLobbyStore((s) => s.isAudioEnabled)
  const displayName = useLobbyStore((s) => s.displayName)
  const setDisplayName = useLobbyStore((s) => s.setDisplayName)
  const stream = useLobbyStore((s) => s.stream)
  const setStream = useLobbyStore((s) => s.setStream)
  const toggleVideo = useLobbyStore((s) => s.toggleVideo)
  const toggleAudio = useLobbyStore((s) => s.toggleAudio)
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

  // Cleanup media streams on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop()
          track.enabled = false
        })
        setStream(null)
      }
      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [stream, setStream])

  // Optimized stream management with proper cleanup
  const ensureStreamFor = useCallback(async (wantVideo: boolean, wantAudio: boolean) => {
    const hasVideo = !!stream?.getVideoTracks().length
    const hasAudio = !!stream?.getAudioTracks().length

    // If no desired media types, stop and clear
    if (!wantVideo && !wantAudio) {
      if (stream) {
        stream.getTracks().forEach((t) => {
          t.stop()
          t.enabled = false
        })
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
      if (stream) {
        stream.getTracks().forEach((t) => {
          t.stop()
          t.enabled = false
        })
      }
      setStream(newStream)
      // Attach to video element only if we have video
      if (videoRef.current) {
        videoRef.current.srcObject = wantVideo ? newStream : null
      }
    } catch (err) {
      console.error("[lobby] Error requesting media:", err)
    }
  }, [stream, setStream])

  useEffect(() => {
    void ensureStreamFor(isVideoEnabled, isAudioEnabled)
  }, [isVideoEnabled, isAudioEnabled, ensureStreamFor])

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
