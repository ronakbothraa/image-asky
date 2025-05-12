"use client";
import { FileUploadDropzone } from "@/components/Dropfiles";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateContent } from "@/api/gemini";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, ChevronDown, Check } from "lucide-react"; // Added ChevronDown and Check

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [llmResponse, setLlmResponse] = useState<string>("");

  // State for AI Model Dropdown
  const aiModels = ["Gemini Pro", "GPT-4o", "Claude 3 Opus", "Llama 3"]; // Example AI models
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>(aiModels[0]); // Default model

  const responseContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (llmResponse && responseContainerRef.current) {
      responseContainerRef.current.scrollTop =
        responseContainerRef.current.scrollHeight;
    }
  }, [llmResponse]);

  async function handleSubmit() {
    setIsLoading(true);
    // For now, selectedModel is not used in generateContent, as per requirements
    console.log("Selected AI Model (mock):", selectedModel);
    try {
      const response = await generateContent(prompt, files);
      setLlmResponse(response as string);
    } catch (error) {
      console.error("Error generating content:", error);
      setLlmResponse(
        "An error occurred while generating content. Please try again."
      );
    }
    setIsLoading(false);
  }

  return (
    <div className="relative ">
      <main className="container h-[calc(100vh-6rem)] overflow-y-scroll overflow-x-hidden mx-auto py-10 pb-40">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="space-y-2 text-center"></div>
          <FileUploadDropzone
            onFilesAdded={(files) => {
              console.log("Files added:", files);
              setFiles(files);
            }}
            maxFiles={5}
            maxSize={5 * 1024 * 1024} // Assuming maxSize is in bytes (5MB)
          />
        </div>

        <div className="h2"></div>

        {isLoading && !llmResponse && (
          <div className="mt-6 p-4 border">
            <p>
              Blinking icon...
            </p>
          </div>
        )}
        {llmResponse && (
          <div
            ref={responseContainerRef}
            className="mt-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lgspace-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Response:
            </h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200 break-words">
              {llmResponse}
            </pre>
          </div>
        )}
        
      </main>

      {/* Fixed "Ask a question" component */}
      <div className="absolute inset-x-0 bottom-0 z-50 rounded-lg bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm" // Smaller button size
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5" // Adjusted padding for smaller size
                >
                  {selectedModel}
                  <ChevronDown
                    className={`h-3 w-3 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                {isDropdownOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 py-1">
                    {aiModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => {
                          setSelectedModel(model);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                      >
                        <span>{model}</span>
                        {selectedModel === model && (
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="relative w-full">
              <Textarea
                placeholder="Ask Anything..."
                onChange={(e) => setPrompt(e.target.value)}
                rows={1}
                className="w-full resize-none appearance-none block p-3 pr-36 sm:pr-40 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 dark:focus:ring-offset-green-800 dark:focus:ring-green-600 dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <div className="cursor-pointer absolute bottom-2.5 right-2.5">
                <Button
                  disabled={isLoading || (files.length === 0 && !prompt.trim())}
                  onClick={handleSubmit}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="ml-2">Start Chat</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
