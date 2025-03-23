import { NextRequest, NextResponse } from "next/server"
import OpenAI from 'openai'

type FormData = {
  faceShape: string
  hairType: string
  hairLength: string
  lifestyle: string
  preferences: string
}

export async function POST(req: NextRequest) {
  try {
    const { formData } = await req.json()
    
    if (!formData) {
      return NextResponse.json(
        { error: "Missing form data" },
        { status: 400 }
      )
    }
    
    const { faceShape, hairType, hairLength, lifestyle, preferences } = formData as FormData
    
    // Create a prompt based on the form data
    const prompt = `
      Based on the following information about a client at Kandy Saloon, provide a detailed hairstyle recommendation:
      
      Face Shape: ${faceShape}
      Hair Type: ${hairType}
      Current Hair Length: ${hairLength}
      Lifestyle: ${lifestyle}
      Additional Preferences: ${preferences || "None specified"}
      
      Please provide:
      1. 2-3 specific hairstyle recommendations with names and descriptions
      2. Why these styles would be flattering for their face shape and hair type
      3. Maintenance tips and styling advice
      4. Product recommendations that would work well with the suggested styles
      
      Format your response with clear sections and be specific about the hairstyle recommendations. Keep your response focused only on hairstyle recommendations.
    `
    
    // Set up OpenAI client with OpenRouter configuration
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.DEEPSEEK_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "https://kandysaloon.vercel.app", 
        "X-Title": "Kandy Saloon",
      },
    });
    
    // Call OpenRouter API using the OpenAI client
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [
        {
          role: "system",
          content: "You are a professional hairstylist at Kandy Saloon with years of experience. You specialize in recommending the perfect hairstyles based on face shape, hair type, lifestyle, and personal preferences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    return NextResponse.json({ content: completion.choices[0].message.content })
    
  } catch (error) {
    console.error("Error in hairstyle AI endpoint:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
