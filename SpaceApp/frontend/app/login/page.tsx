"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChromeIcon as GoogleIcon } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Login submitted:", { email, password, rememberMe })
      toast({
        title: "Login Successful",
        description: "Welcome back to Orbital Satellite Tracker!",
      })
      setIsLoading(false)
      // In a real app, you would handle authentication here
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
        <Link href="/signup">
          <Button className="bg-[#3b82f6] hover:bg-blue-600 rounded-full">Sign up</Button>
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
            <h1 className="text-4xl font-bold text-white fancy-title">Welcome to Orbital</h1>
            <p className="mt-3 text-gray-300">The easiest way to keep track of your satellites.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6 auth-form">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full py-6 border-[#1e2a41] bg-[#131c2e] text-white hover:bg-[#1a2234]"
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>

            <div className="auth-divider">
              <span className="auth-divider-text">or</span>
            </div>

            <div className="space-y-4">
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
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  className="auth-input rounded-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="switch">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span className="slider"></span>
                </label>
                <span className="ml-2 block text-sm text-gray-300">Remember me</span>
              </div>
              <div className="text-sm">
                <Link href="#" className="text-[#3b82f6] hover:text-[#60a5fa]">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full fancy-button rounded-full py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
