"use client";
import { FileUploadDropzone } from "@/components/Dropfiles";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateContent } from "@/api/gemini";
import { useState } from "react";
import { set } from "date-fns";
import { MessageSquare } from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit() {
    setIsLoading(true);
    console.log(await generateContent(prompt, files));
    setIsLoading(false);
  }

  return (
    <main className="container mx-auto py-10">
      <div className="mx-auto max-w-2xl space-y-6 flex flex-col">
        <div className="space-y-2 text-center"></div>

        <FileUploadDropzone
          onFilesAdded={(files) => {
            console.log("Files added:", files);
            setFiles(files);
          }}
          maxFiles={5}
          maxSize={5}
        />
        <div className="space-y-4 rounded-lg border p-4">
          <h2 className="text-xl font-semibold">
            Ask a question about your files
          </h2>
          <Textarea
            placeholder="Ask Anything..."
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="cursor-pointer flex justify-end">
            <Button
              disabled={isLoading || (files.length === 0 && !prompt.trim())}
              onClick={handleSubmit}
            >
              <MessageSquare className="h-4 w-4" />
              Start Chat
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
