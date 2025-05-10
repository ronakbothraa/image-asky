"use client"
import { FileUploadDropzone } from "@/components/Dropfiles"

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">File Upload Example</h1>
          <p className="text-muted-foreground">Drag and drop files to upload or click to browse</p>
        </div>

        <FileUploadDropzone
          onFilesAdded={(files) => {
            console.log("Files added:", files)
            // Here you would typically upload the files to your server
          }}
          accept="image/*,.pdf"
          maxFiles={5}
          maxSize={5}
        />
      </div>
    </main>
  )
}