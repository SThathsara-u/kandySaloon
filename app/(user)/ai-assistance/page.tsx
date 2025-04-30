"use client"
//create ai assistance
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles, Scissors, Info, AlertCircle, HelpCircle, Brain, Zap } from "lucide-react"
import HairSkinAssistant from "@/components/ai-assistant/hair-skin-assistant"
import HairstyleRecommender from "@/components/ai-assistant/hairstyle-recommender"

export default function AiAssistant() {
  const [activeTab, setActiveTab] = useState("hair-skin")
  
  return (
    <div className="min-h-screen bg-background py-10 mt-10">
      <div className="w-full mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
          <motion.h1 
            className="text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Zap className="inline-block mr-2 h-8 w-8" />
            Kandy Salon Intelligence
          </motion.h1>
          <motion.div 
            className="text-center mb-8 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
          >
            Your AI-powered beauty and styling companion
            <Brain className="inline-block ml-2 h-5 w-5 animate-pulse" />
          </motion.div>        
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">Welcome to our AI Assistant</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              Experience the future of beauty with our advanced AI technology for personalized hair care and style recommendations. Choose between two powerful features:
              <ul className="mt-2 ml-4 list-disc">
                <li><span className="font-semibold">Hair & Skin Solutions:</span> Get personalized advice for hair and skin care based on your specific concerns and goals.</li>
                <li><span className="font-semibold">Hairstyle Recommendations:</span> Discover perfect hairstyles tailored to your face shape, hair type, and personal style preferences.</li>
              </ul>
              Simply select a tab above to begin your personalized beauty journey.
            </AlertDescription>
          </Alert>
        </motion.div>

        <Tabs 
          defaultValue="hair-skin" 
          className="w-full max-w-6xl mx-auto"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2 w-full mb-8 bg-card">
            <TabsTrigger value="hair-skin" className="flextext-white data-[state=active]:text-white items-center data-[state=active]:bg-primary">
              <Sparkles className="h-4 w-4" />
              <span>Hair & Skin Solutions</span>
            </TabsTrigger>
            <TabsTrigger value="hairstyle" className="flex  data-[state=active]:text-white items-center data-[state=active]:bg-primary">
              <Scissors className="h-4 w-4" />
              <span>Hairstyle Recommendations</span>
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-lg shadow-lg shadow-purple-200/50 dark:shadow-purple-900/50 p-6 backdrop-blur-sm"
            >
              <TabsContent value="hair-skin" className="mt-0">
                <HairSkinAssistant />
              </TabsContent>
              <TabsContent value="hairstyle" className="mt-0">
                <HairstyleRecommender />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}
