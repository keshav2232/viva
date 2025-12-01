import { AnalysisResult } from '../types';

const FILLER_WORDS = [
    "um", "uh", "like", "you know", "actually", "basically",
    "matlab", "toh", "haan na", "i mean", "sort of"
];

export const analyzeSpeech = (text: string): AnalysisResult => {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    let fillerCount = 0;
    const detectedFillers: Record<string, number> = {};

    words.forEach(word => {
        // Simple matching, could be improved with regex for phrases
        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        if (FILLER_WORDS.includes(cleanWord)) {
            fillerCount++;
            detectedFillers[cleanWord] = (detectedFillers[cleanWord] || 0) + 1;
        }
    });

    // Also check for multi-word fillers like "you know"
    const textLower = text.toLowerCase();
    ["you know", "i mean", "sort of"].forEach(phrase => {
        const regex = new RegExp(phrase, 'g');
        const matches = textLower.match(regex);
        if (matches) {
            const count = matches.length;
            // Adjust count because individual words might have been counted
            // This is a rough approximation for v1
            fillerCount += count;
            detectedFillers[phrase] = (detectedFillers[phrase] || 0) + count;
        }
    });

    return {
        fillerCount,
        totalWords,
        byWord: detectedFillers
    };
};
