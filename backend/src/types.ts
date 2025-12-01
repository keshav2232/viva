export interface Session {
    id: string;
    topic: string;
    difficulty: 'easy' | 'moderate' | 'tough';
    persona: 'friendly_teacher' | 'confused_peer' | 'ruthless_examiner';
    notes?: string;
    conversationHistory: Message[];
    fillerStats: FillerStats;
    startTime: number;
}

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface FillerStats {
    totalWords: number;
    fillerCount: number;
    byWord: Record<string, number>;
}

export interface AnalysisResult {
    fillerCount: number;
    totalWords: number;
    byWord: Record<string, number>;
}
