"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send } from "lucide-react"

interface Message {
    id: string
    sender: string
    text: string
    timestamp: Date
    isLocal: boolean
}

interface ChatSidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
    const sidebarRef = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            sender: "Alex Chen",
            text: "Hey everyone! Glad we could all make it.",
            timestamp: new Date(Date.now() - 300000),
            isLocal: false,
        },
        {
            id: "2",
            sender: "Sarah Johnson",
            text: "Thanks for setting this up!",
            timestamp: new Date(Date.now() - 180000),
            isLocal: false,
        },
    ])
    const [newMessage, setNewMessage] = useState("")

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

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message: Message = {
                id: Date.now().toString(),
                sender: "You",
                text: newMessage,
                timestamp: new Date(),
                isLocal: true,
            }
            setMessages([...messages, message])
            setNewMessage("")
        }
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    }

    if (!isOpen) return null

    return (
        <div
            ref={sidebarRef}
            className="fixed right-0 top-0 bottom-0 w-80 bg-card/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-50 flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="font-semibold text-lg">Chat</h3>
                <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex flex-col ${message.isLocal ? "items-end" : "items-start"}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-muted-foreground">{message.sender}</span>
                                <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                            </div>
                            <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 ${message.isLocal ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                            >
                                <p className="text-sm">{message.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
