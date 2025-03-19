"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";

export function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-t bg-card text-card-foreground"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <span>© {currentYear} Kandy Saloon Admin Portal.</span>
            <span className="px-1">•</span>
            <span>All rights reserved</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/privacy-policy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/admin/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/admin/support"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Support
            </Link>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500" />
            <span>by</span>
            <a 
              href="https://kandysaloon.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center"
            >
              Kandy Team
              <ExternalLink className="ml-0.5 h-3 w-3" />
            </a>
            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary">v1.0.3</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
