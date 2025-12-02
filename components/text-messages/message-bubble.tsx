import type { Message } from "@/lib/types/text-message"

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user'

  // Format timestamp to HH:MM format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="flex flex-col max-w-[75%]">
        <div
          className={`
            rounded-[18px] px-4 py-2 text-[17px] leading-[22px]
            ${isUser
              ? 'bg-[#007AFF] text-white rounded-br-[4px]'
              : 'bg-[#E5E5EA] text-black rounded-bl-[4px]'
            }
          `}
        >
          <p className="break-words">{message.text}</p>
        </div>
        <span className={`text-[11px] text-gray-500 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
