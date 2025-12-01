import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SummaryPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { summary, fillerStats } = location.state || {};

    if (!summary) {
        return <div className="p-8 text-center">No summary available. <button onClick={() => navigate('/')} className="text-primary underline">Go Home</button></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Viva Summary</h1>
                    <p className="text-slate-600">Here is how you performed.</p>
                </div>

                {/* Overall Score */}
                <div className="card text-center py-8">
                    <div className="text-6xl font-bold text-primary mb-2">{summary.overallScore}<span className="text-2xl text-slate-400">/10</span></div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Overall Score</div>
                </div>

                {/* Sub Scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Concept', value: summary.conceptScore },
                        { label: 'Clarity', value: summary.clarityScore },
                        { label: 'Confidence', value: summary.confidenceScore },
                        { label: 'Filler Control', value: summary.fillerControlScore },
                    ].map((s, i) => (
                        <div key={i} className="card p-4 text-center">
                            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                            <div className="text-xs text-slate-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="font-semibold text-lg mb-4 text-green-600">Strengths</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-700">
                            {summary.strengths?.map((s: string, i: number) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="card">
                        <h3 className="font-semibold text-lg mb-4 text-red-600">Improvements</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-700">
                            {summary.improvements?.map((s: string, i: number) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Filler Stats */}
                <div className="card">
                    <h3 className="font-semibold text-lg mb-4">Filler Word Analysis</h3>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-600">Total Words Spoken:</span>
                        <span className="font-bold">{fillerStats?.totalWords || 0}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-600">Total Fillers:</span>
                        <span className="font-bold text-red-500">{fillerStats?.fillerCount || 0}</span>
                    </div>

                    <div className="space-y-2">
                        {Object.entries(fillerStats?.byWord || {}).map(([word, count]: [string, any]) => (
                            <div key={word} className="flex justify-between items-center text-sm border-b border-slate-100 pb-1">
                                <span className="capitalize text-slate-700">{word}</span>
                                <span className="font-mono text-slate-500">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center pt-8">
                    <button onClick={() => navigate('/')} className="btn btn-primary px-8">Practice Again</button>
                </div>
            </div>
        </div>
    );
};

export default SummaryPage;
