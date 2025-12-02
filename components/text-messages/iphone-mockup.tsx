"use client"

import { MessageBubble } from "./message-bubble"
import type { TextMessage } from "@/lib/types/text-message"
import { ChevronLeft, Camera, Phone, Video } from "lucide-react"

interface IPhoneMockupProps {
  textMessage: TextMessage
}

export function IPhoneMockup({ textMessage }: IPhoneMockupProps) {
  const { contactName, contactImage, messages, draftMessage } = textMessage

  // Get current time for status bar
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className="mx-auto max-w-[390px] bg-black rounded-[50px] p-3 shadow-2xl">
      {/* iPhone Frame */}
      <div className="bg-white rounded-[40px] overflow-hidden">
        {/* Status Bar */}
        <div className="bg-[#F2F2F7] h-11 flex items-center justify-between px-6 pt-1">
          <span className="text-[15px] font-semibold">{currentTime}</span>
          <div className="flex items-center gap-1">
            {/* Signal, WiFi, Battery icons */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/>
              <rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor"/>
              <rect x="10" y="2" width="3" height="10" rx="1" fill="currentColor"/>
              <rect x="15" y="0" width="2" height="12" rx="1" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#F2F2F7] border-b border-gray-300 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button className="text-[#007AFF]">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              {/* Contact Avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                {contactImage ? (
                  <img
                    src={contactImage}
                    alt={contactName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {contactName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="font-semibold text-[17px]">{contactName}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#007AFF]">
              <Phone className="h-5 w-5" />
            </button>
            <button className="text-[#007AFF]">
              <Video className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="bg-white min-h-[500px] max-h-[600px] overflow-y-auto p-4">
          <div className="space-y-1">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-[#F2F2F7] border-t border-gray-300 p-2">
          <div className="flex items-end gap-2">
            <button className="text-[#007AFF] pb-2">
              <Camera className="h-6 w-6" />
            </button>
            <div className="flex-1 bg-white rounded-[20px] px-4 py-2 min-h-[36px] flex items-center">
              {draftMessage ? (
                <span className="text-[17px] text-gray-900">{draftMessage}</span>
              ) : (
                <span className="text-[17px] text-gray-400">iMessage</span>
              )}
            </div>
            {draftMessage && (
              <button className="text-[#007AFF] pb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Home Indicator */}
        <div className="bg-[#F2F2F7] h-5 flex items-center justify-center">
          <div className="w-32 h-1 bg-black rounded-full opacity-30"></div>
        </div>
      </div>
    </div>
  )
}
