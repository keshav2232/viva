import * as googleTTS from 'google-tts-api';
import fs from 'fs';

async function testGoogleTTS() {
    try {
        console.log("Starting Google TTS test...");

        const text = "Hello, this is a test of the Google TTS system.";

        // Get audio URL
        const url = googleTTS.getAudioUrl(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        console.log("Generated URL:", url);

        // Fetch the audio data
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync('./test_google.mp3', buffer);
        console.log("TTS generation successful. File created at ./test_google.mp3");

        const stats = fs.statSync('./test_google.mp3');
        console.log(`File size: ${stats.size} bytes`);

    } catch (error) {
        console.error("Google TTS Test Failed:", error);
    }
}

testGoogleTTS();
