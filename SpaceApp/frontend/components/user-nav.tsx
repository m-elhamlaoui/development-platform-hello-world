"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Settings, LogOut, User, HelpCircle, Moon, Sun } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function UserNav() {
  const [notifications, setNotifications] = useState(3)
  const [theme, setTheme] = useState("dark")

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have 3 unread notifications",
    })
    setNotifications(0)
  }

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
    toast({
      title: `${theme === "dark" ? "Light" : "Dark"} Mode`,
      description: `Switched to ${theme === "dark" ? "light" : "dark"} mode`,
      duration: 1500,
    })
  }

  const handleProfileClick = () => {
    toast({
      title: "Profile",
      description: "Navigating to profile page",
    })
  }

  const handleSettingsClick = () => {
    toast({
      title: "Settings",
      description: "Opening settings panel",
    })
  }

  const handleHelpClick = () => {
    toast({
      title: "Help & Support",
      description: "Opening help documentation",
    })
  }

  const handleLogoutClick = () => {
    toast({
      title: "Logging Out",
      description: "You have been logged out successfully",
    })
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              className="relative w-8 h-8 rounded-full flex items-center justify-center bg-[#1a2234] text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNotificationClick}
            >
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <motion.span
                  className="absolute top-0 right-0 h-3 w-3 rounded-full bg-[#ef4444] flex items-center justify-center text-[10px] text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {notifications}
                </motion.span>
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a2234] text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleThemeToggle}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>

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
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-gray-400">john.doe@example.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1e2a41]" />
            <DropdownMenuItem className="cursor-pointer hover:bg-[#1a2234]" onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#1a2234]" onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#1a2234]" onClick={handleHelpClick}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
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
