import { ttsSave } from 'edge-tts/out/index.js';
import fs from 'fs';

async function testTTS() {
    try {
        console.log("Starting TTS test...");
        await ttsSave("Hello, this is a test of the Microsoft Edge TTS system.", './test_output.mp3', {
            voice: 'en-US-ChristopherNeural',
        });
        console.log("TTS generation successful. File created at ./test_output.mp3");

        const stats = fs.statSync('./test_output.mp3');
        console.log(`File size: ${stats.size} bytes`);

    } catch (error) {
        console.error("TTS Test Failed:", error);
    }
}

testTTS();
