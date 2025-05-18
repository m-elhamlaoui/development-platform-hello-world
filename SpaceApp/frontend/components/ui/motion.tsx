"use client"

import { motion, HTMLMotionProps } from "framer-motion"

// Define types for motion components with proper HTML attributes
export type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export type MotionButtonProps = HTMLMotionProps<"button"> & {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Create the motion components with proper typing
export const MotionDiv = motion.div as React.FC<MotionDivProps>
export const MotionButton = motion.button as React.FC<MotionButtonProps> 