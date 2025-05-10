"use server";

import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateContent(prompt: string, files: File[]) {
  const contentParts = await Promise.all(
    files.map(async (file) => {
      const fileBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(fileBuffer).toString("base64");
      return {
        inlineData: {
          name: file.name,
          mimeType: file.type,
          data: base64,
        },
      };
    })
  );

  const content = [...contentParts, { text: prompt }];

  console.log(content);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: content
  });

  return response.text;
}
