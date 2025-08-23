"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onUpload: (fileIds: string[]) => void
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const fileIds: string[] = []

      for (const file of Array.from(files)) {
        // TODO: Implement actual file upload to Uploadcare/Cloudinary
        // For now, simulate upload
        const mockFileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        fileIds.push(mockFileId)
      }

      onUpload(fileIds)

      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully`,
      })
    } catch (error) {
      console.error("File upload failed:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset input
      event.target.value = ""
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.pdf,.docx,.txt"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />

      <Button size="sm" variant="ghost" disabled={isUploading} className="text-muted-foreground hover:text-foreground">
        {isUploading ? <Upload className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
      </Button>
    </div>
  )
}
