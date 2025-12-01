import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: number;
}

const VivaSession: React.FC = () => {
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isRecording, audioBlob, startRecording, stopRecording, resetRecording } = useAudioRecorder();

    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const [timer, setTimer] = useState(0);
    const [lastTone, setLastTone] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const speakText = (text: string) => {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel(); // Stop previous

        const utterance = new SpeechSynthesisUtterance(text);

        // Get voices again to be sure (sometimes they load async)
        const availableVoices = window.speechSynthesis.getVoices();

        // Priority list for better voices
        const preferredVoice = availableVoices.find(voice =>
            voice.name.includes("Google US English") ||
            voice.name.includes("Google UK English Female") ||
            voice.name.includes("Microsoft Zira") ||
            (voice.name.includes("Natural") && voice.lang.startsWith("en"))
        ) || availableVoices.find(voice => voice.lang.startsWith("en"));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    };

    // Initialize with first question if available
    useEffect(() => {
        if (location.state?.firstQuestion && messages.length === 0) {
            setMessages([{ role: 'assistant', content: location.state.firstQuestion, timestamp: Date.now() }]);
            speakText(location.state.firstQuestion);
        }
    }, [location.state, messages.length]);

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle audio upload when blob is ready
    useEffect(() => {
        if (audioBlob) {
            handleSendAnswer();
        }
    }, [audioBlob]);

    const handleSendAnswer = async () => {
        if (!audioBlob || !sessionId) return;

        setStatus('processing');
        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('audio', audioBlob);

        try {
            const response = await fetch('/api/session/answer', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            // Add user's transcribed answer
            setMessages(prev => [...prev, { role: 'user', content: data.transcribedAnswer, timestamp: Date.now() }]);

            // Add examiner's response
            setMessages(prev => [...prev, { role: 'assistant', content: data.examinerMessage, timestamp: Date.now() }]);
            speakText(data.examinerMessage);

            if (data.tone) {
                setLastTone(data.tone);
            }

            setStatus('idle');
            resetRecording();

        } catch (error) {
            console.error("Error sending answer:", error);
            setStatus('idle');
            alert("Failed to send answer.");
        }
    };

    const handleStopViva = async () => {
        if (!sessionId) return;
        try {
            const response = await fetch('/api/session/finish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
            const data = await response.json();
            navigate('/summary', { state: { summary: data.summary, fillerStats: data.fillerStats } });
        } catch (error) {
            console.error("Error finishing session:", error);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="font-bold text-xl text-primary">Ruthless Viva</div>
                <div className="font-mono text-lg bg-slate-100 px-3 py-1 rounded">{formatTime(timer)}</div>
                <button onClick={handleStopViva} className="btn btn-danger text-sm">Stop Viva</button>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full pb-64">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-4 ${msg.role === 'user'
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                            }`}>
                            <p className="text-sm font-semibold mb-1 opacity-75">{msg.role === 'user' ? 'You' : 'Examiner'}</p>
                            <div className="markdown-content">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-6">
                <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                            {status === 'idle' && 'Ready to answer'}
                            {status === 'listening' && <span className="text-red-500 animate-pulse">● Listening...</span>}
                            {status === 'processing' && <span className="text-blue-500">Thinking...</span>}
                        </div>
                        {lastTone && status === 'idle' && (
                            <div className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 max-w-md text-center truncate">
                                Detected Tone: <span className="font-semibold">{lastTone}</span>
                            </div>
                        )}
                    </div>

                    <button
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200 scale-110'
                            : 'bg-primary hover:bg-blue-600 shadow-lg hover:shadow-xl'
                            } ${status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={status === 'processing'}
                    >
                        {isRecording ? (
                            <div className="w-6 h-6 bg-white rounded-sm" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        )}
                    </button>
                    <p className="text-xs text-slate-400">
                        {isRecording ? 'Tap to stop' : 'Tap mic to speak'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VivaSession;
