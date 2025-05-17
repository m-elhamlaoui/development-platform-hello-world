"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast({
        title: "Login Successful",
        description: "Welcome back to Orbital Satellite Tracker!",
      })
      router.push("/satellites")
    } catch (err) {
      console.error('Login error:', err)
      if (err instanceof Error) {
        if (err.message.includes('Network error')) {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the server. Please check your internet connection.",
            variant: "destructive",
          })
        } else if (err.message.includes('Failed to fetch')) {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the server. Please try again later.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Login Failed",
            description: err.message,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
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
