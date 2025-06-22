import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  publicKey: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => Promise<boolean>
  register: (username: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Mock passkey simulation
const simulatePasskeyRegistration = async (username: string): Promise<{ id: string; success: boolean }> => {
  // Simulate some delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Generate a mock credential ID
  const credentialId = `passkey_${username}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return {
    id: credentialId,
    success: true
  }
}

const simulatePasskeyAuthentication = async (): Promise<{ success: boolean }> => {
  // Simulate some delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    success: true
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage on app load
    const storedUser = localStorage.getItem('stellarpass_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('stellarpass_user')
      }
    }
    setIsLoading(false)
  }, [])

  const register = async (username: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Check if username already exists
      const existingUsers = JSON.parse(localStorage.getItem('stellarpass_all_users') || '[]')
      if (existingUsers.find((u: User) => u.username === username)) {
        toast.error('Username already exists. Please choose a different one.')
        return false
      }
      
      // Simulate passkey registration
      toast.loading('Setting up your passkey...', { id: 'passkey-setup' })
      const registration = await simulatePasskeyRegistration(username)
      
      if (registration.success) {
        // Create new user
        const newUser: User = {
          id: username,
          username,
          publicKey: registration.id,
        }
        
        // Store user data
        setUser(newUser)
        localStorage.setItem('stellarpass_user', JSON.stringify(newUser))
        
        // Also store in all users list for username checking
        const allUsers = [...existingUsers, newUser]
        localStorage.setItem('stellarpass_all_users', JSON.stringify(allUsers))
        
        toast.dismiss('passkey-setup')
        toast.success('Account created successfully! Welcome to StellarPass!')
        return true
      } else {
        toast.dismiss('passkey-setup')
        toast.error('Failed to set up passkey. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Registration failed:', error)
      toast.dismiss('passkey-setup')
      toast.error('Registration failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Check if there's a stored user
      const storedUser = localStorage.getItem('stellarpass_user')
      if (!storedUser) {
        toast.error('No account found. Please create an account first.')
        return false
      }
      
      // Simulate passkey authentication
      toast.loading('Authenticating with your passkey...', { id: 'passkey-auth' })
      const authentication = await simulatePasskeyAuthentication()
      
      if (authentication.success) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        toast.dismiss('passkey-auth')
        toast.success(`Welcome back, ${userData.username}!`)
        return true
      } else {
        toast.dismiss('passkey-auth')
        toast.error('Authentication failed. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      toast.dismiss('passkey-auth')
      toast.error('Authentication failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('stellarpass_user')
    toast.success('Logged out successfully')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 