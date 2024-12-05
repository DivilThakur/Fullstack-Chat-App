import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore.js'
import MessageSkeleton from '../components/Skeletons/MessageSkeleton.jsx'
import ChatHeader from '../components/ChatHeader.jsx'
import MessageInput from '../components/MessageInput.jsx'
import { useAuthStore } from '../store/useAuthStore.js'
import { formatMessageTime } from '../lib/utils.js'

function ChatContainer() {

  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessage } = useChatStore();
  const { authUser } = useAuthStore();
  const messageRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id)

    subscribeToMessages();

    return () => unsubscribeFromMessage()
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessage])


  useEffect(() => {

    if(messageRef.current){
      messageRef.current.scrollIntoView({ behaviour: 'smooth' });
    }
  }, [messages])


  if (isMessagesLoading) return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />
      <MessageSkeleton />
      <MessageInput />
    </div>
  )

  return (
    <div className='flex-1 flex flex-col overflow-auto'>

      <ChatHeader />

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {
          messages.map((message) => (
            <div key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              ref={messageRef}
            >
              <div className='chat-image avatar'>
                <div className='size-10 rounded-full border'>
                  <img src={message.senderId === authUser._id ? authUser.profilePic : selectedUser.profilePic} alt="Profile pic" />
                </div>
              </div>

              <div className='chat-header mb-1 '>
                <time className='text-xs opacity-50 ml-1'>{formatMessageTime(message.createdAt)}</time>
              </div>

              <div className='chat-bubble flex flex-col'>
                {message.image && (
                  <img src={message.image} alt="Attachment"
                    className='sm:max-w-[200px] rounded-md mb-2'
                  />
                )}
                {message.text && <p>{message.text}</p>}

              </div>

            </div>
          ))
        }
      </div>

      <MessageInput />

    </div>
  )
}

export default ChatContainer