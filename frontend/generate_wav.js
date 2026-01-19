const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const duration = 0.5;
const frequency = 440.0;
const numSamples = Math.floor(sampleRate * duration);
const bytesPerSample = 2;
const numChannels = 1;
const blockAlign = numChannels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataSize = numSamples * blockAlign;
const fileSize = 36 + dataSize;

const buffer = Buffer.alloc(44 + dataSize);

// RIFF chunk
buffer.write('RIFF', 0);
buffer.writeUInt32LE(fileSize, 4);
buffer.write('WAVE', 8);

// fmt chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(8 * bytesPerSample, 34);

// data chunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Data
for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t);
    const val = Math.max(-32768, Math.min(32767, sample * 32767));
    buffer.writeInt16LE(val, 44 + i * bytesPerSample);
}

fs.writeFileSync(path.join('public', 'sounds', 'test.wav'), buffer);
console.log('test.wav created successfully');
