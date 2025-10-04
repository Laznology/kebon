import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { url: string; alt?: string; title?: string }) => void;
}

export function ImageUrlDialog({
  open,
  onOpenChange,
  onSubmit,
}: ImageUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [title, setTitle] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showError, setShowError] = useState(false);

  const validateUrl = (value: string) => {
    try {
      new URL(value);
      setIsValid(true);
      setShowError(false);
    } catch {
      setIsValid(false);
      setShowError(value.length > 0);
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    validateUrl(value);
  };

  const handleSubmit = () => {
    if (isValid && url) {
      onSubmit({
        url,
        alt: alt || undefined,
        title: title || undefined,
      });
      // Reset form
      setUrl("");
      setAlt("");
      setTitle("");
      setIsValid(false);
      setShowError(false);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setAlt("");
    setTitle("");
    setIsValid(false);
    setShowError(false);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid && url) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[425px] bg-[rgb(var(--background))] border border-border shadow-2xl"
        overlayClassName="bg-transparent"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Add Image from URL
          </DialogTitle>
          <DialogDescription>
            Enter the URL of the image you want to embed in your document.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              Image URL *
            </Label>
            <Input
              id="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "text-sm",
                showError && "border-red-500 focus:border-red-500",
              )}
              autoFocus
            />
            {showError && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                Please enter a valid URL
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="alt" className="text-sm font-medium">
              Alt Text
            </Label>
            <Input
              id="alt"
              placeholder="Description of the image"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title (Optional)
            </Label>
            <Input
              id="title"
              placeholder="Image title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid || !url}
            onClick={handleSubmit}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Add Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
