import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getChatCompletion = async (messages: { role: string, content: string }[]) => {
    if (process.env.USE_MOCK_AI === 'true') {
        console.log(" [MOCK] Generating chat completion...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
        return "This is a mock response from Gemini. I am simulating a viva session. Please continue your answer.";
    }

    try {
        const systemMessage = messages.find(m => m.role === 'system');
        const historyMessages = messages.filter(m => m.role !== 'system');

        // Gemini Flash Latest
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: systemMessage ? systemMessage.content : undefined
        });

        // If there's no history, just generate content
        if (historyMessages.length === 0) {
            const result = await model.generateContent(systemMessage ? systemMessage.content : "Hello");
            return result.response.text();
        }

        const chat = model.startChat({
            history: historyMessages.slice(0, -1).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })),
        });

        const lastMessage = historyMessages[historyMessages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        return result.response.text();
    } catch (error: any) {
        const fs = require('fs');
        fs.appendFileSync('error.log', `Chat Error: ${error.message}\nResponse: ${JSON.stringify(error)}\n`);
        console.error("Error in getChatCompletion:", error);
        throw error;
    }
};

export const processAudio = async (audioBuffer: Buffer): Promise<{ transcription: string, tone: string }> => {
    if (process.env.USE_MOCK_AI === 'true') {
        console.log(" [MOCK] Processing audio...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            transcription: "This is a mock transcription of the user's audio answer.",
            tone: "neutral"
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const audioBase64 = audioBuffer.toString('base64');

        const prompt = `
            Listen to this audio clip of a student answering a viva question.
            1. Transcribe the speech exactly.
            2. Analyze the speaker's tone (e.g., confident, nervous, hesitant, neutral, enthusiastic).
            
            Return the result as a valid JSON object with keys: "transcription" and "tone".
            Do not include markdown formatting or backticks.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "audio/webm", // Assuming webm from frontend recording
                    data: audioBase64
                }
            }
        ]);

        const text = result.response.text();
        // Clean up potential markdown
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error: any) {
        const fs = require('fs');
        fs.writeFileSync('error.log', `Error: ${error.message}\nResponse: ${JSON.stringify(error)}\n`);
        console.error("Error in processAudio:", error.message);
        if (error.response) {
            console.error("Error response:", await error.response.text());
        }
        // Fallback if JSON parse fails or other error
        return {
            transcription: "Error processing audio.",
            tone: "unknown"
        };
    }
};
