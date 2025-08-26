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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    try {
      const form = new FormData();
      for (const f of files) form.append("files", f);

      const res = await fetch("/api/v1/file", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Upload failed");
      }

      const json = await res.json();
      const ids = (json?.data || []).map((f: any) => f._id);
      onUpload(ids); // <- returns real file IDs to ChatArea
      e.target.value = ""; // reset input
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

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
