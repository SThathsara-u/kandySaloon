import { NextRequest, NextResponse } from "next/server"
import OpenAI from 'openai'

type Message = {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      )
    }
    
    // System prompt to guide the AI
    const systemPrompt = {
      role: "system",
      content: `You are a professional hair and skin care specialist at Kandy Saloon.
      
      Your expertise is limited to providing advice on hair care, skin care, and facial treatments.
      
      Guidelines:
      - Only respond to queries related to hair, skin, and facial issues or treatments offered in a salon.
      - If asked about topics unrelated to salon services, politely redirect the conversation.
      - Provide helpful, science-based advice on treating common hair and skin issues.
      - Recommend salon treatments when appropriate but be balanced in your approach.
      - Be friendly, professional, and empathetic in your responses.
      - Keep answers concise and practical.
      
      DO NOT respond to any questions unrelated to salon services or hair/skin health.`
    }
    
    // Set up OpenAI client with OpenRouter configuration
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.DEEPSEEK_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "https://kandysaloon.vercel.app", 
        "X-Title": "Kandy Saloon",
      },
    });
    
    // Prepare messages with system prompt
    const apiMessages = [systemPrompt, ...messages.slice(-10)] // Limit context window
    
    // Call OpenRouter API using the OpenAI client
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1024
    });
    
    return NextResponse.json({ content: completion.choices[0].message.content })
    
  } catch (error) {
    console.error("Error in hair-skin AI endpoint:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
