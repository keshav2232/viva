import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
                            <span className="font-bold text-xl text-slate-900">Ruthless Viva</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/login')} className="text-slate-600 hover:text-primary font-medium transition-colors">Login</button>
                            <button onClick={() => navigate('/login')} className="btn btn-primary">Get Started</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="inline-block animate-bounce bg-blue-100 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                        🚀 Ace your next viva with AI
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Master Your Viva <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Before It Happens</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Face a ruthless AI examiner that adapts to your answers. Practice with real-time feedback, tone analysis, and tough follow-up questions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <button onClick={() => navigate('/login')} className="btn btn-primary text-lg px-8 py-4 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all transform hover:-translate-y-1">
                            Start Your Session
                        </button>
                        <button className="px-8 py-4 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200">
                            View Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Ruthless Examiner", desc: "An AI that doesn't hold back. It interrupts, questions your logic, and demands precision.", icon: "😈" },
                            { title: "Real-time Feedback", desc: "Get instant analysis on your tone, confidence, and filler words as you speak.", icon: "📊" },
                            { title: "Detailed Reports", desc: "Receive a comprehensive performance summary with actionable improvements.", icon: "📝" },
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 group">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; 2024 Ruthless Viva. Built for students who want to win.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
