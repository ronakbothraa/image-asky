"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Upload, X, FileText, ImageIcon, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type FileWithPreview = {
  file: File
  id: string
  preview?: string
  progress: number
}

interface FileUploadDropzoneProps {
  onFilesAdded?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  accept?: string
  className?: string
  disabled?: boolean
}

export function FileUploadDropzone({
  onFilesAdded,
  maxFiles = 5,
  maxSize = 10, // 10MB
  accept = "*",
  className,
  disabled = false,
}: FileUploadDropzoneProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return

    const newFiles: File[] = []

    Array.from(fileList).forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is ${maxSize}MB.`)
        return
      }

      // Check file type if accept is specified
      if (accept !== "*" && !file.type.match(accept.replace(/\*/g, ".*"))) {
        alert(`File ${file.name} is not an accepted file type.`)
        return
      }

      newFiles.push(file)
    })

    // Check max files
    if (files.length + newFiles.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`)
      return
    }

    // Add files with preview
    const filesWithPreviews: FileWithPreview[] = newFiles.map((file) => {
      const id = Math.random().toString(36).substring(2, 9)
      const fileWithPreview: FileWithPreview = {
        file,
        id,
        progress: 0,
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => {
          setFiles((prevFiles) => prevFiles.map((f) => (f.id === id ? { ...f, preview: reader.result as string } : f)))
        }
        reader.readAsDataURL(file)
      }

      return fileWithPreview
    })

    setFiles((prev) => [...prev, ...filesWithPreviews])

    // Simulate upload progress
    filesWithPreviews.forEach((fileWithPreview) => {
      simulateUploadProgress(fileWithPreview.id)
    })

    // Call the callback with the new files
    if (onFilesAdded) {
      onFilesAdded(newFiles)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return

    processFiles(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    processFiles(e.target.files)
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const simulateUploadProgress = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }

      setFiles((prevFiles) => prevFiles.map((f) => (f.id === fileId ? { ...f, progress } : f)))
    }, 300)
  }

  const removeFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6 text-muted-foreground" />
    } else if (file.type.includes("pdf")) {
      return <FileText className="h-6 w-6 text-muted-foreground" />
    } else {
      return <File className="h-6 w-6 text-muted-foreground" />
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">Drag & drop files here</h3>
          <p className="mt-1 text-sm text-muted-foreground">or click to browse files</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Max {maxFiles} files, up to {maxSize}MB each
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileInputChange}
            className="sr-only"
            disabled={disabled}
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.id} className="relative rounded-md border p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {file.preview ? (
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        <img
                          src={file.preview || "/placeholder.svg"}
                          alt={file.file.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      getFileIcon(file.file)
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.file.size / 1024 / 1024).toFixed(2)}MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeFile(file.id)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
                <Progress value={file.progress} className="mt-2 h-1" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
