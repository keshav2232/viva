import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SetupPage: React.FC = () => {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('moderate');
    const [persona, setPersona] = useState('friendly_teacher');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        console.log("Start button clicked. Topic:", topic);
        if (!topic) {
            console.warn("No topic selected");
            return;
        }
        setIsLoading(true);
        try {
            console.log("Sending request to /api/session/start...");
            const response = await fetch('/api/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, difficulty, persona, notes })
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log("Response data:", data);

            if (data.sessionId) {
                navigate(`/session/${data.sessionId}`, { state: { firstQuestion: data.firstQuestion } });
            } else {
                console.error("No sessionId in response");
                alert("Error: No session ID received from server.");
            }
        } catch (error) {
            console.error("Failed to start session:", error);
            alert(`Failed to start session: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Ruthless Viva Simulator</h1>
                    <p className="text-lg text-slate-600">Practice like it’s your final viva. Fail here so you don’t fail there.</p>
                </div>

                <div className="card space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Thermodynamics, React Hooks, World War II"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                        <select
                            className="input-field"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="easy">Easy</option>
                            <option value="moderate">Moderate</option>
                            <option value="tough">Tough</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Examiner Persona</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'friendly_teacher', name: 'Friendly Teacher', desc: 'Encouraging, gives hints.' },
                                { id: 'confused_peer', name: 'Confused Peer', desc: 'Asks naive questions.' },
                                { id: 'ruthless_examiner', name: 'Ruthless Examiner', desc: 'Strict, interrupts, no mercy.' },
                            ].map((p) => (
                                <div
                                    key={p.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${persona === p.id ? 'border-primary bg-blue-50 ring-2 ring-primary ring-opacity-50' : 'border-slate-200 hover:border-primary'}`}
                                    onClick={() => setPersona(p.id)}
                                >
                                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                        <textarea
                            className="input-field h-24 resize-none"
                            placeholder="Paste your notes here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <button
                        className={`w-full btn btn-primary py-3 text-lg ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        onClick={handleStart}
                        disabled={!topic || isLoading}
                    >
                        {isLoading ? 'Starting Session...' : 'Start Viva'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupPage;
