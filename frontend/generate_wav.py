import wave
import struct
import math

# Audio parameters
sample_rate = 44100
duration = 0.5  # seconds
frequency = 440.0  # Hz

# Generate simple sine wave
n_samples = int(sample_rate * duration)
data = []
for i in range(n_samples):
    value = int(32767.0 * math.sin(2.0 * math.pi * frequency * i / sample_rate))
    data.append(value)

# Write to WAV file
try:
    with wave.open('public/sounds/test.wav', 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
        wav_file.setframerate(sample_rate)
        for value in data:
            wav_file.writeframes(struct.pack('h', value))
    print("test.wav created successfully")
except Exception as e:
    print(f"Error creating wav: {e}")
