"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('user_role')
    if (!token) { router.push('/login'); return }
    if (role === 'superadmin') router.push('/superadmin/dashboard')
    else if (role === 'customer') router.push('/portal/dashboard')
    else router.push('/dashboard')
  }, [])
  return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>
}
