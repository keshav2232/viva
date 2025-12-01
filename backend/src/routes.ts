import { Router } from 'express';
import multer from 'multer';
import { createSession, getSession, updateSessionHistory, updateFillerStats, endSession } from './services/sessionManager';
import { getChatCompletion, processAudio } from './services/gemini';
import { analyzeSpeech } from './services/analyzer';
import { Message } from './types';

export const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper to generate system prompt based on persona
const getSystemPrompt = (persona: string, topic: string, notes?: string) => {
    let basePrompt = `You are a ${persona} conducting a viva/interview on the topic: "${topic}". `;

    if (notes) {
        basePrompt += `The student has provided these notes: "${notes}". Use them to ask relevant questions. `;
    }

    if (persona === 'friendly_teacher') {
        basePrompt += `Tone: Warm, encouraging. If the student is stuck, give hints. Explain briefly if they are wrong. Start with an easy question.`;
    } else if (persona === 'confused_peer') {
        basePrompt += `Tone: Casual, slightly clueless. Ask "I didn't understand" questions. Ask for examples. Say things like "Can you make it simpler?".`;
    } else if (persona === 'ruthless_examiner') {
        basePrompt += `Tone: Cold, professional, strict. Interrupt if the answer is vague. Say "You're not being precise" or "Start again". Ask deep, technical questions. If they use too many filler words, point it out.`;
    }

    basePrompt += ` Keep your responses concise (under 2-3 sentences) as this is a spoken conversation.`;
    return basePrompt;
};

router.post('/session/start', async (req, res) => {
    try {
        const { topic, difficulty, persona, notes } = req.body;
        if (!topic || !difficulty || !persona) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const session = createSession(topic, difficulty, persona, notes);

        // Generate first question
        const systemPrompt = getSystemPrompt(persona, topic, notes);
        const messages: Message[] = [
            { role: 'system', content: systemPrompt, timestamp: Date.now() },
            { role: 'user', content: "I am ready for the viva. Please ask the first question.", timestamp: Date.now() }
        ];

        const firstQuestion = await getChatCompletion(messages as any);

        if (!firstQuestion) throw new Error("Failed to generate question");

        updateSessionHistory(session.id, { role: 'system', content: systemPrompt, timestamp: Date.now() });
        updateSessionHistory(session.id, { role: 'user', content: "I am ready for the viva. Please ask the first question.", timestamp: Date.now() });
        updateSessionHistory(session.id, { role: 'assistant', content: firstQuestion, timestamp: Date.now() });

        res.json({
            sessionId: session.id,
            firstQuestion,
        });

    } catch (error) {
        console.error("Error starting session:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
});

router.post('/session/answer', upload.single('audio'), async (req, res) => {
    try {
        console.log("Received answer request");
        const { sessionId } = req.body;
        const audioFile = req.file;

        console.log("Session ID:", sessionId);
        console.log("Audio file present:", !!audioFile);

        if (!sessionId || !audioFile) {
            console.error("Missing session ID or audio file");
            return res.status(400).json({ error: "Missing session ID or audio file" });
        }

        const session = getSession(sessionId);
        if (!session) {
            console.error("Session not found:", sessionId);
            return res.status(404).json({ error: "Session not found" });
        }

        // 1. Process Audio (Transcribe + Tone)
        console.log("Processing audio...");
        console.log("Audio Buffer Size:", audioFile.buffer.length);
        const { transcription, tone } = await processAudio(audioFile.buffer);
        console.log("Transcription:", transcription);
        console.log("Tone:", tone);

        // 2. Analyze Fluency (Text-based)
        const analysis = analyzeSpeech(transcription);
        updateFillerStats(sessionId, analysis);
        updateSessionHistory(sessionId, { role: 'user', content: transcription, timestamp: Date.now() });

        // 3. Generate Response
        let systemInstruction = `(System Note: The student's tone was "${tone}". React to this tone if appropriate.)`;

        if (session.persona === 'ruthless_examiner' && analysis.fillerCount > 2) {
            systemInstruction += ` (System Note: The student used ${analysis.fillerCount} filler words. Scold them for it.)`;
        }

        const messages = session.conversationHistory.map(m => ({ role: m.role, content: m.content }));
        if (systemInstruction) {
            messages.push({ role: 'system', content: systemInstruction } as any);
        }

        console.log("Generating response...");
        const responseText = await getChatCompletion(messages as any);
        console.log("Response generated:", responseText);

        if (!responseText) throw new Error("Failed to generate response");

        updateSessionHistory(sessionId, { role: 'assistant', content: responseText, timestamp: Date.now() });

        res.json({
            transcribedAnswer: transcription,
            examinerMessage: responseText,
            analysis,
            tone
        });

    } catch (error) {
        console.error("Error processing answer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/session/finish', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        // Generate Summary
        const summaryPrompt = `
            The viva session is over. Here is the conversation history:
            ${JSON.stringify(session.conversationHistory)}
            
            Based on this, generate a JSON summary with the following fields:
            - overallScore (0-10)
            - conceptScore (0-10)
            - clarityScore (0-10)
            - confidenceScore (0-10)
            - fillerControlScore (0-10)
            - strengths (array of strings)
            - improvements (array of strings)
            
            Return ONLY the JSON.
        `;

        const summaryJson = await getChatCompletion([
            { role: 'system', content: "You are a grading system. Output only valid JSON." },
            { role: 'user', content: summaryPrompt }
        ] as any);

        let summaryData;
        try {
            // clean up potential markdown code blocks
            const cleanJson = summaryJson?.replace(/```json/g, '').replace(/```/g, '').trim();
            summaryData = JSON.parse(cleanJson || "{}");
        } catch (e) {
            console.error("Failed to parse summary JSON", e);
            summaryData = { error: "Failed to generate structured summary" };
        }

        res.json({
            summary: summaryData,
            fillerStats: session.fillerStats
        });

        endSession(sessionId);

    } catch (error) {
        console.error("Error finishing session:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

import * as googleTTS from 'google-tts-api';

router.post('/tts', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "Missing text" });
        }

        // Get audio URL
        const url = googleTTS.getAudioUrl(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        // Fetch the audio data
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const audioBase64 = buffer.toString('base64');

        res.json({ audio: audioBase64 });

    } catch (error) {
        console.error("Error generating TTS:", error);
        res.status(500).json({ error: "Failed to generate speech" });
    }
});

import { saveUser, getAllUsers } from './services/userManager';

router.post('/login', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required" });
        }
        const user = await saveUser(name, email);
        res.json({ user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Failed to login" });
    }
});

router.get('/admin/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json({ users });
    } catch (error) {
        console.error("Admin error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
