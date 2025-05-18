"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Cookies from "js-cookie"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function UserNav() {
  const router = useRouter()
  const { user } = useAuth()

  const handleLogoutClick = () => {
    Cookies.remove("token")
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    })
    router.push("/login")
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="relative h-8 w-8 rounded-full bg-[#1a2234] border border-[#1e2a41] overflow-hidden"
                  whileHover={{ scale: 1.05, borderColor: "#3b82f6" }}
                >
                  <img src="/placeholder.svg?height=32&width=32" alt="User" className="h-full w-full object-cover" />
                </motion.button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>User menu</TooltipContent>
          </Tooltip>

          <DropdownMenuContent className="w-56 bg-[#131c2e] border-[#1e2a41]" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-gray-400">{user?.email || "No email"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1e2a41]" />
            <DropdownMenuItem
              className="cursor-pointer hover:bg-[#1a2234] text-red-400 hover:text-red-300"
              onClick={handleLogoutClick}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  )
}
