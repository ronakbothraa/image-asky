"use client"
import { FileUploadDropzone } from "@/components/Dropfiles"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"


export default function Home() {

  const [ prompt, setPrompt ] = useState<string>("")
  
  async function handleSubmit() {
    console.log("Prompt submitted:", prompt)
  }

  return (
    <main className="container mx-auto py-10">
      <div className="mx-auto max-w-2xl space-y-6 flex flex-col">
        <div className="space-y-2 text-center">
        </div>

        <FileUploadDropzone
          onFilesAdded={(files) => {
            console.log("Files added:", files)
          }}
          maxFiles={5}
          maxSize={5}
        />
        <Textarea placeholder="Ask Anything..." onChange={(e) => setPrompt(e.target.value)}/>
        <Button onClick={handleSubmit} className="cursor-pointer ml-auto max-w-[100px]">submit</Button>
      </div>
    </main>
  )
}