import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  const header = Buffer.alloc(44);
  const dataLength = pcmBuffer.length;
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Split long text into speakable segments for native Khmer TTS
function splitKhmerText(text: string, maxChunkLength = 150): string[] {
  const sentences = text.split(/([៕\n.?!]+)/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const part of sentences) {
    if (!part) continue;
    if ((currentChunk + part).length <= maxChunkLength) {
      currentChunk += part;
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      if (part.length > maxChunkLength) {
        // Break by spaces or punctuation if a single sentence is huge
        const words = part.split(/\s+/);
        let sub = "";
        for (const w of words) {
          if ((sub + " " + w).length <= maxChunkLength) {
            sub += (sub ? " " : "") + w;
          } else {
            if (sub.trim()) chunks.push(sub.trim());
            sub = w;
          }
        }
        if (sub.trim()) currentChunk = sub.trim();
        else currentChunk = "";
      } else {
        currentChunk = part;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxChunkLength)];
}

async function fetchKhmerNativeTTS(text: string): Promise<Buffer> {
  const chunks = splitKhmerText(text);
  const audioBuffers: Buffer[] = [];

  for (const chunk of chunks) {
    const encoded = encodeURIComponent(chunk);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=km&client=tw-ob&q=${encoded}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!res.ok) {
      throw new Error(`Native voice service responded with HTTP status ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    audioBuffers.push(Buffer.from(arrayBuf));
  }

  return Buffer.concat(audioBuffers);
}

async function applyKhmerVoiceModulation(
  inputBuffer: Buffer,
  voice: string,
  speed: string = "normal"
): Promise<{ buffer: Buffer; durationSeconds: number }> {
  const tmpId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const inputPath = path.join(os.tmpdir(), `in_${tmpId}.mp3`);
  const outputPath = path.join(os.tmpdir(), `out_${tmpId}.mp3`);

  await fs.promises.writeFile(inputPath, inputBuffer);

  try {
    const filters: string[] = [];
    const normVoice = (voice || "").toLowerCase();

    // Voice profile customization
    if (normVoice === "dara" || normVoice === "male" || normVoice === "puck") {
      // Dara: Authentic, warm Khmer Male voice (lower pitch ~18%, formant preserved, rich body)
      filters.push("rubberband=pitch=0.82:formant=preserved");
      filters.push("equalizer=f=220:width_type=h:width=120:g=3.5");
      filters.push("equalizer=f=3200:width_type=h:width=800:g=-1.5");
    } else if (normVoice === "piseth" || normVoice === "charon" || normVoice === "fenrir") {
      // Piseth: Deep, resonant broadcast & news male voice (lower pitch ~24%, deep low-end)
      filters.push("rubberband=pitch=0.76:formant=preserved");
      filters.push("equalizer=f=160:width_type=h:width=100:g=4.5");
      filters.push("equalizer=f=2800:width_type=h:width=700:g=-2");
    } else if (normVoice === "sophea") {
      // Sophea: Eloquent, clear broadcast & storytelling female voice
      filters.push("rubberband=pitch=1.04:formant=preserved");
      filters.push("equalizer=f=3500:width_type=h:width=1000:g=2");
    } else {
      // Bopha (standard natural female): crisp, sweet, standard Khmer vocal curve
      filters.push("equalizer=f=3000:width_type=h:width=1000:g=1");
    }

    // Speaking speed adjustments
    if (speed === "slow") {
      filters.push("atempo=0.85");
    } else if (speed === "fast") {
      filters.push("atempo=1.2");
    }

    const filterStr = filters.join(",");
    await execFileAsync("ffmpeg", ["-y", "-i", inputPath, "-af", filterStr, outputPath]);

    const resultBuffer = await fs.promises.readFile(outputPath);

    // Precise duration extraction via ffprobe
    let durationSeconds = 3;
    try {
      const probeRes = await execFileAsync("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        outputPath,
      ]);
      const parsed = parseFloat(probeRes.stdout.trim());
      if (!isNaN(parsed) && parsed > 0) {
        durationSeconds = Number(parsed.toFixed(2));
      }
    } catch {
      durationSeconds = Math.max(1, Math.round(resultBuffer.length / 8000));
    }

    return { buffer: resultBuffer, durationSeconds };
  } catch (err) {
    console.warn("Audio modulation fallback to raw buffer:", err);
    return {
      buffer: inputBuffer,
      durationSeconds: Math.max(1, Math.round(inputBuffer.length / 8000)),
    };
  } finally {
    try {
      await fs.promises.unlink(inputPath);
    } catch {}
    try {
      await fs.promises.unlink(outputPath);
    } catch {}
  }
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      hasKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Voice Preview API
  app.get("/api/voice-preview", (req, res) => {
    const voice = ((req.query.voice as string) || "bopha").toLowerCase();
    const filePath = path.join(__dirname, "public", "previews", `${voice}.mp3`);
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "audio/mpeg");
      res.sendFile(filePath);
    } else {
      const fallbackPath = path.join(__dirname, "public", "previews", "bopha.mp3");
      if (fs.existsSync(fallbackPath)) {
        res.setHeader("Content-Type", "audio/mpeg");
        res.sendFile(fallbackPath);
      } else {
        res.status(404).json({ error: "Preview not found" });
      }
    }
  });

  // Text-to-Speech API
  app.post("/api/tts", async (req, res) => {
    try {
      const {
        text,
        engine = "native", // 'native' | 'gemini'
        voice = "bopha",
        tone = "natural",
        speed = "normal",
      } = req.body;

      if (!text || typeof text !== "string" || !text.trim()) {
        res.status(400).json({ error: "Please enter text in Khmer language." });
        return;
      }

      const trimmedText = text.trim();
      const isMale = ["dara", "piseth", "puck", "charon", "fenrir"].includes((voice || "").toLowerCase());

      // If user selected Gemini Studio AI Engine
      if (engine === "gemini") {
        try {
          const ai = getAI();
          let toneDirective = "clearly";
          if (tone === "cheerful") toneDirective = "cheerfully";
          else if (tone === "calm") toneDirective = "calmly";
          else if (tone === "formal") toneDirective = "formally";
          else if (tone === "storytelling") toneDirective = "warmly";

          // Valid prebuilt voices
          const validVoices = ["Kore", "Zephyr", "Puck", "Charon", "Fenrir"];
          const selectedVoice = validVoices.includes(voice) ? voice : (isMale ? "Puck" : "Kore");

          const prompt = `Say in Khmer ${toneDirective}: ${trimmedText}`;

          const geminiRes = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: selectedVoice },
                },
              },
            },
          });

          const part = geminiRes.candidates?.[0]?.content?.parts?.[0];
          const base64Data = part?.inlineData?.data;

          if (base64Data) {
            const rawPcm = Buffer.from(base64Data, "base64");
            const wavBuffer = pcmToWav(rawPcm, 24000, 1, 16);
            const wavBase64 = wavBuffer.toString("base64");
            const durationSeconds = Number((rawPcm.length / (24000 * 2)).toFixed(2));

            res.json({
              success: true,
              audioUrl: `data:audio/wav;base64,${wavBase64}`,
              format: "wav",
              mimeType: "audio/wav",
              engine: "gemini",
              voice: selectedVoice,
              gender: isMale ? "male" : "female",
              tone,
              durationSeconds,
            });
            return;
          }
        } catch (geminiError: any) {
          console.warn("Gemini TTS warning / quota exceeded, switching to Khmer Native Voice:", geminiError?.message);
          // Seamless fallback to corresponding Native Khmer voice (preserving gender!)
          const fallbackVoice = isMale ? "dara" : "bopha";
          const rawMp3 = await fetchKhmerNativeTTS(trimmedText);
          const { buffer: modulatedMp3, durationSeconds } = await applyKhmerVoiceModulation(rawMp3, fallbackVoice, speed);
          const mp3Base64 = modulatedMp3.toString("base64");

          res.json({
            success: true,
            audioUrl: `data:audio/mp3;base64,${mp3Base64}`,
            format: "mp3",
            mimeType: "audio/mpeg",
            engine: "native",
            fallbackUsed: true,
            fallbackReason: "Switched to high-definition Native Khmer Voice due to Gemini API rate limit.",
            voice: fallbackVoice === "dara" ? "Dara (Male)" : "Bopha (Female)",
            gender: isMale ? "male" : "female",
            tone,
            durationSeconds,
          });
          return;
        }
      }

      // Default: Khmer Native Voice Engine with authentic gender profiles (Bopha / Dara / Sophea / Piseth)
      const rawMp3 = await fetchKhmerNativeTTS(trimmedText);
      const { buffer: modulatedMp3, durationSeconds } = await applyKhmerVoiceModulation(rawMp3, voice, speed);
      const mp3Base64 = modulatedMp3.toString("base64");

      res.json({
        success: true,
        audioUrl: `data:audio/mp3;base64,${mp3Base64}`,
        format: "mp3",
        mimeType: "audio/mpeg",
        engine: "native",
        voice: voice,
        gender: isMale ? "male" : "female",
        tone,
        durationSeconds,
      });
    } catch (err: any) {
      console.error("TTS processing error:", err);
      res.status(500).json({
        error: err?.message || "Failed to generate Khmer speech audio.",
      });
    }
  });

  // Khmer Romanization and Translation Analysis
  app.post("/api/analyze-khmer", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        res.status(400).json({ error: "Please provide Khmer text." });
        return;
      }

      const ai = getAI();
      const prompt = `Analyze this Khmer text: "${text.trim()}".
Return a JSON object with:
- "romanization": Latin phonetic pronunciation guide for how to read and speak this Khmer text
- "englishTranslation": Natural English translation of the text
- "words": Array of key Khmer words/terms breakdown, each with { "khmer": string, "romanization": string, "meaning": string }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        success: true,
        ...parsed,
      });
    } catch (err: any) {
      console.error("Analysis error:", err);
      res.status(500).json({
        error: err?.message || "Failed to analyze text.",
      });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
