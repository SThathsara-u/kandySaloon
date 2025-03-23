"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, SendIcon, User } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function HairSkinAssistant() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your hair and skin care assistant. Describe any hair or skin concerns you have, and I'll provide personalized solutions. For example, you can ask about dry skin, hair loss, dandruff, acne, etc."
    }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    // Add user message
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/ai/hair-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })
      
      if (!response.ok) {
        throw new Error("Failed to get response")
      }
      
      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "I'm sorry, I encountered an error. Please try again later." }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hair & Skin Care Solutions</CardTitle>
        <CardDescription>
          Ask questions about hair or skin problems and get personalized advice
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-8 w-8">
                    {message.role === "assistant" ? (
                      <AvatarImage src="/salon-logo.png" alt="AI" />
                    ) : null}
                    <AvatarFallback>
                      {message.role === "assistant" ? "AI" : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.role === "assistant" 
                      ? "bg-secondary text-secondary-foreground" 
                      : "bg-primary text-primary-foreground"
                  }`}>
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/salon-logo.png" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Textarea
            placeholder="Describe your hair or skin concern..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="resize-none flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
