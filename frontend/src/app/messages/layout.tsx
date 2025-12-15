import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Users, Calendar, FileText, User, Settings } from 'lucide-react'

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-20 bg-green-700 flex flex-col items-center py-4 space-y-6">
        <Link href="/dashboard">
          <div className="text-white p-3 rounded-lg hover:bg-green-600 cursor-pointer">
            <User className="w-6 h-6" />
          </div>
        </Link>
        <Link href="/patients">
          <div className="text-white p-3 rounded-lg hover:bg-green-600 cursor-pointer">
            <Users className="w-6 h-6" />
          </div>
        </Link>
        <Link href="/calendar">
          <div className="text-white p-3 rounded-lg hover:bg-green-600 cursor-pointer">
            <Calendar className="w-6 h-6" />
          </div>
        </Link>
        <Link href="/diets">
          <div className="text-white p-3 rounded-lg hover:bg-green-600 cursor-pointer">
            <FileText className="w-6 h-6" />
          </div>
        </Link>
        <Link href="/messages">
          <div className="bg-white text-green-700 p-3 rounded-lg cursor-pointer">
            <MessageCircle className="w-6 h-6" />
          </div>
        </Link>
        <Link href="/settings">
          <div className="text-white p-3 rounded-lg hover:bg-green-600 cursor-pointer">
            <Settings className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center px-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">NutriXpertPro</h1>
        </header>

        {/* Messages Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}