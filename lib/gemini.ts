import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const media = path.join(__dirname, "..", "third_party");

export async function main() {

  const image = await ai.files.upload({
    file: path.join(media, "image.jpg"),
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      createUserContent([
        "Tell me about this instrument",
        createPartFromUri(image.uri!, image.mimeType!),
      ]),
    ],
  });

  console.log(response.text);
}
main();
