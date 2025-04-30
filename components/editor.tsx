"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Quote, LinkIcon, ImageIcon } from "lucide-react"
import { motion } from "framer-motion"

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Editor({ value, onChange, placeholder }: EditorProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setShowToolbar(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const insertFormat = (format: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    let replacement = ""

    switch (format) {
      case "bold":
        replacement = `**${selectedText || "bold text"}**`
        break
      case "italic":
        replacement = `*${selectedText || "italic text"}*`
        break
      case "list":
        replacement = `\n- ${selectedText || "List item"}\n- Another item\n`
        break
      case "ordered-list":
        replacement = `\n1. ${selectedText || "List item"}\n2. Another item\n`
        break
      case "quote":
        replacement = `\n> ${selectedText || "Quoted text"}\n`
        break
      case "link":
        replacement = `[${selectedText || "Link text"}](https://example.com)`
        break
      case "image":
        replacement = `![${selectedText || "Image alt text"}](https://example.com/image.jpg)`
        break
      default:
        return
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end)
    onChange(newValue)

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + replacement.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Write your content here..."}
        className="min-h-[300px] resize-y font-mono"
        onFocus={() => setShowToolbar(true)}
      />

      {showToolbar && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-2 left-2 right-2 bg-background border rounded-md shadow-md p-2 flex flex-wrap gap-1"
        >
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("bold")} title="Bold">
            <Bold className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("italic")} title="Italic">
            <Italic className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("list")} title="Bullet List">
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormat("ordered-list")}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("quote")} title="Quote">
            <Quote className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("link")} title="Link">
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("image")} title="Image">
            <ImageIcon className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
