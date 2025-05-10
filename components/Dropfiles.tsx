"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Upload, X, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
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
  className?: string
  disabled?: boolean
}

export function FileUploadDropzone({
  onFilesAdded,
  maxFiles = 5,
  maxSize = 10, // 10MB
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

  const isValidFileType = (file: File): boolean => {
    // Accept only PDF and image files
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    return validTypes.includes(file.type)
  }

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return

    const newFiles: File[] = []
    const invalidFiles: string[] = []

    Array.from(fileList).forEach((file) => {
      // Check file type
      if (!isValidFileType(file)) {
        invalidFiles.push(file.name)
        return
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error( "File too large", {
          description: `${file.name} exceeds the maximum size of ${maxSize}MB.`
        })
        return
      }

      newFiles.push(file)
    })

    // Show error for invalid file types
    if (invalidFiles.length > 0) {
      toast.error("Invalid file type",{
        description: `${invalidFiles.join(", ")} ${invalidFiles.length === 1 ? "is" : "are"} not a PDF or image file.`
      })
    }

    // Check max files
    if (files.length + newFiles.length > maxFiles) {
      toast.error("Too many files", {
        description: `You can only upload a maximum of ${maxFiles} files.`
      })
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
    if (onFilesAdded && newFiles.length > 0) {
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

        toast.success("Upload complete", {
          description: "Your file has been successfully uploaded.",
        })
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
    } else {
      return <FileText className="h-6 w-6 text-muted-foreground" />
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload
            className={cn("h-10 w-10 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")}
          />
          <h3 className="mt-2 text-lg font-semibold">Drag & drop files here</h3>
          <p className="mt-1 text-sm text-muted-foreground">or click to browse files</p>
          <p className="mt-2 text-xs text-muted-foreground">
            PDF and images only, max {maxFiles} files, up to {maxSize}MB each
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
            accept=".pdf,image/*"
            onChange={handleFileInputChange}
            className="sr-only"
            disabled={disabled}
            aria-label="File upload"
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
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / 1024 / 1024).toFixed(2)}MB •
                        {file.file.type.startsWith("image/") ? " Image" : " PDF"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeFile(file.id)}
                    disabled={disabled || file.progress < 100}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{file.progress < 100 ? "Uploading..." : "Complete"}</span>
                    <span>{file.progress}%</span>
                  </div>
                  <Progress value={file.progress} className="h-1" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
