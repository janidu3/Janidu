
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Header from './components/Header';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = useCallback(() => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a helpful and friendly assistant. Your name is Sampurana. Engage in a natural, supportive conversation.',
        },
      });
      setChat(newChat);
      setMessages([
        {
          role: 'model',
          content: 'ආයුබෝවන්! මම සම්පූර්ණ. ඔබට උදව් කළ හැක්කේ කෙසේද? (Hello! I am Sampurana. How can I help you?)',
        },
      ]);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to initialize the chat service. Please check your API key.");
      console.error(e);
    }
  }, []);

  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (userInput: string) => {
    if (!chat || isLoading || !userInput.trim()) return;

    setIsLoading(true);
    setError(null);
    const userMessage: Message = { role: 'user', content: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const stream = await chat.sendMessageStream({ message: userInput });
      
      let modelResponse = '';
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'model', content: '...' },
      ]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1] = { role: 'model', content: modelResponse };
          return newMessages;
        });
      }
    } catch (e: any) {
      console.error(e);
      const errorMessage = "Sorry, I encountered an error. Please try again. Error: " + (e.message || "Unknown error");
      setError(errorMessage);
       setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'model', content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to start a new chat? The current conversation will be cleared.")) {
      initializeChat();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      <Header onClearChat={handleClearChat} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
         {error && (
            <div className="flex justify-center">
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg max-w-2xl text-center">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 p-4 sticky bottom-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;