import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any | null>(null);

  const PERMISSION_DENIED_MESSAGE = "Microphone access is blocked. To use voice input, please go to your browser's site settings and allow microphone access for this page.";

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
      }
    };
  }, []);

  const handleMicClick = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    setMicError(null);

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setMicError("Sorry, your browser doesn't support speech recognition.");
      return;
    }
    
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as any });
      if (permissionStatus.state === 'denied') {
        setMicError(PERMISSION_DENIED_MESSAGE);
        return;
      }
    } catch (e) {
      console.warn("Could not query microphone permission status. This is common in some browsers like Firefox. Proceeding to request permission directly.", e);
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setInput('');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        console.warn('Speech recognition permission denied by user.');
        setMicError(PERMISSION_DENIED_MESSAGE);
      } else {
         console.error('Speech recognition error:', event.error);
         setMicError(`An error occurred: ${event.error}. Please try again.`);
      }
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        onSendMessage(transcript);
      }
    };
    
    try {
        recognition.start();
    } catch (e) {
        console.error("Error starting speech recognition:", e);
        setMicError("Could not start voice recognition. Please ensure your microphone is working correctly.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      if (micError) setMicError(null);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (micError) {
      setMicError(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {micError && (
        <div className="bg-red-900/50 border border-red-500/50 text-red-300 text-sm rounded-lg p-3 mb-2 flex items-start gap-3" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p>{micError}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={isRecording ? "Listening..." : "Type your message or use the mic..."}
          className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 pl-4 pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 text-slate-100 placeholder-slate-400"
          rows={1}
          disabled={isLoading || isRecording}
          style={{ minHeight: '52px', maxHeight: '200px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isLoading}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                <path d="M5.5 13.5A2.5 2.5 0 008 16v1a1 1 0 001 1h2a1 1 0 001-1v-1a2.5 2.5 0 002.5-2.5V13h-1v.5a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 017 13.5V13h-1.5v.5z" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim() || isRecording}
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;