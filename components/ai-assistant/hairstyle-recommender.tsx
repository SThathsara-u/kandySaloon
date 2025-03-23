"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Loader2 } from "lucide-react"

type FormData = {
  faceShape: string
  hairType: string
  hairLength: string
  lifestyle: string
  preferences: string
}

type Stage = "questions" | "results"

export default function HairstyleRecommender() {
  const [stage, setStage] = useState<Stage>("questions")
  const [isLoading, setIsLoading] = useState(false)
  const [recommendation, setRecommendation] = useState("")
  
  const [formData, setFormData] = useState<FormData>({
    faceShape: "",
    hairType: "",
    hairLength: "",
    lifestyle: "",
    preferences: ""
  })
  
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/ai/hairstyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData })
      })
      
      if (!response.ok) {
        throw new Error("Failed to get recommendation")
      }
      
      const data = await response.json()
      setRecommendation(data.content)
      setStage("results")
    } catch (error) {
      console.error("Error:", error)
      setRecommendation("I'm sorry, I encountered an error generating your recommendation. Please try again later.")
      setStage("results")
    } finally {
      setIsLoading(false)
    }
  }
  
  const resetForm = () => {
    setFormData({
      faceShape: "",
      hairType: "",
      hairLength: "",
      lifestyle: "",
      preferences: ""
    })
    setRecommendation("")
    setStage("questions")
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hairstyle Recommendation</CardTitle>
        <CardDescription>
          Answer a few questions to get personalized hairstyle suggestions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stage === "questions" ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-3">
              <Label htmlFor="faceShape">What is your face shape?</Label>
              <Select 
                value={formData.faceShape} 
                onValueChange={(value) => handleChange("faceShape", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select face shape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oval">Oval</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="heart">Heart</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                  <SelectItem value="rectangular">Rectangular</SelectItem>
                  <SelectItem value="not-sure">Not Sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="hairType">What is your hair type?</Label>
              <RadioGroup 
                value={formData.hairType}
                onValueChange={(value) => handleChange("hairType", value)}
                className="grid grid-cols-2 gap-2"
                required
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="straight" id="straight" />
                  <Label htmlFor="straight">Straight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wavy" id="wavy" />
                  <Label htmlFor="wavy">Wavy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="curly" id="curly" />
                  <Label htmlFor="curly">Curly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="coily" id="coily" />
                  <Label htmlFor="coily">Coily/Kinky</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="hairLength">Current hair length</Label>
              <Select 
                value={formData.hairLength} 
                onValueChange={(value) => handleChange("hairLength", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hair length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-short">Very Short (Buzz cut)</SelectItem>
                  <SelectItem value="short">Short (Above ears)</SelectItem>
                  <SelectItem value="medium">Medium (Chin to shoulder)</SelectItem>
                  <SelectItem value="long">Long (Below shoulders)</SelectItem>
                  <SelectItem value="very-long">Very Long (Mid-back or longer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="lifestyle">How would you describe your lifestyle?</Label>
              <Select 
                value={formData.lifestyle} 
                onValueChange={(value) => handleChange("lifestyle", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lifestyle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-active">Very active/athletic</SelectItem>
                  <SelectItem value="busy">Busy professional with little styling time</SelectItem>
                  <SelectItem value="balanced">Balanced, with some time for styling</SelectItem>
                  <SelectItem value="relaxed">Relaxed, with plenty of styling time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="preferences">Additional preferences or concerns</Label>
              <Textarea 
                placeholder="E.g., I want something low-maintenance, I'm looking to hide thinning hair, I want to look younger, etc."
                value={formData.preferences}
                onChange={(e) => handleChange("preferences", e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting recommendations...
                </>
              ) : (
                <>
                  Get Hairstyle Recommendations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4 prose max-w-none dark:prose-invert">
                <h3 className="text-xl font-semibold">Your Personalized Hairstyle Recommendation</h3>
                <div dangerouslySetInnerHTML={{ __html: recommendation.replace(/\n/g, '<br />') }} />
              </div>
            </ScrollArea>
            <Button onClick={resetForm} className="w-full">
              Get Another Recommendation
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
