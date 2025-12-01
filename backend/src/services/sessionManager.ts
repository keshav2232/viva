import { Session, Message, FillerStats } from '../types';
import { v4 as uuidv4 } from 'uuid';

const sessions: Record<string, Session> = {};

export const createSession = (
    topic: string,
    difficulty: 'easy' | 'moderate' | 'tough',
    persona: 'friendly_teacher' | 'confused_peer' | 'ruthless_examiner',
    notes?: string
): Session => {
    const id = uuidv4();
    const session: Session = {
        id,
        topic,
        difficulty,
        persona,
        notes,
        conversationHistory: [],
        fillerStats: {
            totalWords: 0,
            fillerCount: 0,
            byWord: {}
        },
        startTime: Date.now()
    };
    sessions[id] = session;
    return session;
};

export const getSession = (id: string): Session | undefined => {
    return sessions[id];
};

export const updateSessionHistory = (id: string, message: Message) => {
    const session = sessions[id];
    if (session) {
        session.conversationHistory.push(message);
    }
};

export const updateFillerStats = (id: string, newStats: FillerStats) => {
    const session = sessions[id];
    if (session) {
        session.fillerStats.totalWords += newStats.totalWords;
        session.fillerStats.fillerCount += newStats.fillerCount;

        Object.entries(newStats.byWord).forEach(([word, count]) => {
            session.fillerStats.byWord[word] = (session.fillerStats.byWord[word] || 0) + count;
        });
    }
};

export const endSession = (id: string) => {
    // In a real app, we might archive it to DB. Here we just keep it in memory or delete.
    // Let's keep it for a bit to allow fetching summary, maybe implement cleanup later.
    // For now, do nothing.
};
