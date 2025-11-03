
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
  </svg>
);

const ModelIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.75 2.25a.75.75 0 0 0-1.5 0v.816A11.22 11.22 0 0 0 3.12 12.333a.75.75 0 0 0 .82.684c.246-.03.458-.21.5-.458A9.725 9.725 0 0 1 12 4.516a9.725 9.725 0 0 1 7.56 7.043c.042.248.254.428.5.458a.75.75 0 0 0 .82-.684 11.22 11.22 0 0 0-8.13-9.267V2.25Z" />
    <path fillRule="evenodd" d="M9.773 13.49a.75.75 0 0 1 0-1.06l1.272-1.273a.75.75 0 0 1 1.06 0l1.273 1.273a.75.75 0 1 1-1.06 1.06L12 13.06l-.94.94a.75.75 0 0 1-1.06 0-.75.75 0 0 1 0-1.06l1.273-1.273a.75.75 0 0 1 1.06 0l1.273 1.273a.75.75 0 0 1-1.06 1.06L12 13.06l-.94.94a.75.75 0 0 1-.53.22h-.001a.75.75 0 0 1-.53-.22Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M6.34 16.543a.75.75 0 0 1 .53-.22h10.26a.75.75 0 0 1 .53.22.75.75 0 0 1 0 1.06l-2.06 2.06a.75.75 0 0 1-1.06 0L12 17.06l-2.56 2.563a.75.75 0 0 1-1.06 0l-2.06-2.06a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const containerClasses = `flex items-start gap-3 md:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl ${isUser ? 'bg-blue-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`;
  const textClasses = 'text-base leading-relaxed whitespace-pre-wrap';

  return (
    <div className={containerClasses}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-600">
          <ModelIcon />
        </div>
      )}
      <div className={bubbleClasses}>
        <p className={textClasses}>{message.content}</p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-600">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
