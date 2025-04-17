"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  quote: string;
  author: string;
  role: string;
  initials: string;
  delay?: number;
}

export function TestimonialCard({
  quote,
  author,
  role,
  initials,
  className,
  delay = 0,
  ...props
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={cn("p-6 bg-muted rounded-2xl", className)}
      {...props}
    >
      <p className="text-lg mb-4">{quote}</p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
          <span className="text-primary font-semibold">{initials}</span>
        </div>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  );
} 