"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Signup submitted:", { name, email, password })
      toast({
        title: "Account Created",
        description: "Welcome to Orbital Satellite Tracker!",
      })
      setIsLoading(false)
      // In a real app, you would handle registration here
    }, 1500)
  }

  return (
    <div className="auth-container">
      <div className="flex justify-between items-center p-6">
        <Link href="/" className="flex items-center">
          <motion.div
            className="w-8 h-8 bg-white rounded mr-2 flex items-center justify-center"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-4 h-4 bg-[#0f1520]"></div>
          </motion.div>
          <span className="font-bold text-xl text-white">Orbital</span>
        </Link>
        <Link href="/login">
          <Button className="bg-[#3b82f6] hover:bg-blue-600 rounded-full">Sign in</Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white fancy-title">Join Orbital</h1>
            <p className="mt-3 text-gray-300">Create an account to track your satellites.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6 auth-form">
            <div className="space-y-4">
              <div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Full name"
                  className="auth-input rounded-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  className="auth-input rounded-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Password"
                  className="auth-input rounded-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full fancy-button rounded-full py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-center text-sm text-gray-400">
              By signing up, you agree to our{" "}
              <Link href="#" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
