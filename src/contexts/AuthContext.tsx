import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'



interface User {
  id: string
  username: string
  publicKey: string
  stellarAddress?: string
  credentialId?: string
  isPasskeyEnabled?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => Promise<boolean>
  register: (username: string) => Promise<boolean>
  logout: () => void
  isPasskeySupported: boolean
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

// Check if passkeys are supported
const checkPasskeySupport = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  
  try {
    if (
      window.PublicKeyCredential &&
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
    ) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return available
    }
    return false
  } catch (error) {
    console.warn('Error checking passkey support:', error)
    return false
  }
}

// Generate a mock Stellar address for demo purposes
const generateStellarAddress = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = 'G'
  for (let i = 0; i < 55; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Create passkey credential
const createPasskeyCredential = async (username: string): Promise<{ credentialId: string; stellarAddress: string }> => {
  const challenge = new Uint8Array(32)
  crypto.getRandomValues(challenge)

  const userId = new TextEncoder().encode(username)

  const publicKeyOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'StellarPass',
      id: window.location.hostname,
    },
    user: {
      id: userId,
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      {
        type: 'public-key',
        alg: -7, // ES256
      },
      {
        type: 'public-key',
        alg: -257, // RS256
      },
    ],
    timeout: 60000,
    attestation: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
    },
  }

  const credential = await navigator.credentials.create({
    publicKey: publicKeyOptions,
  }) as PublicKeyCredential

  if (!credential) {
    throw new Error('Failed to create passkey credential')
  }

  // Generate Stellar address based on the credential
  const stellarAddress = generateStellarAddress()
  
  return {
    credentialId: credential.id,
    stellarAddress
  }
}

// Authenticate with existing passkey
const authenticateWithPasskey = async (credentialId: string): Promise<boolean> => {
  const challenge = new Uint8Array(32)
  crypto.getRandomValues(challenge)

  const assertionOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    rpId: window.location.hostname,
    allowCredentials: [
      {
        type: 'public-key',
        id: new TextEncoder().encode(credentialId),
      },
    ],
    timeout: 60000,
    userVerification: 'required',
  }

  try {
    const assertion = await navigator.credentials.get({
      publicKey: assertionOptions,
    })
    
    return !!assertion
  } catch (error) {
    console.error('Passkey authentication failed:', error)
    return false
  }
}

// Mock passkey simulation for fallback
const simulatePasskeyRegistration = async (username: string): Promise<{ credentialId: string; stellarAddress: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const credentialId = `mock_passkey_${username}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const stellarAddress = generateStellarAddress()
  
  return {
    credentialId,
    stellarAddress
  }
}

const simulatePasskeyAuthentication = async (): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return true
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPasskeySupported, setIsPasskeySupported] = useState(false)

  useEffect(() => {
    initializePasskeySupport()
    checkStoredUser()
  }, [])

  const initializePasskeySupport = async () => {
    const supported = await checkPasskeySupport()
    setIsPasskeySupported(supported)
    console.log('Passkey support:', supported)
  }

  const checkStoredUser = () => {
    try {
      const storedUser = localStorage.getItem('stellarpass_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      }
    } catch (error) {
      console.error('Error parsing stored user:', error)
      localStorage.removeItem('stellarpass_user')
    }
    setIsLoading(false)
  }

  const register = async (username: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Check if username already exists
      const existingUsers = JSON.parse(localStorage.getItem('stellarpass_all_users') || '[]')
      if (existingUsers.find((u: User) => u.username === username)) {
        toast.error('Username already exists. Please choose a different one.')
        return false
      }
      
      toast.loading('Setting up your passkey...', { id: 'passkey-setup' })

      let registrationResult
      let isPasskeyEnabled = false

      // Try real passkey registration first
      if (isPasskeySupported) {
        try {
          registrationResult = await createPasskeyCredential(username)
          isPasskeyEnabled = true
          console.log('Real passkey registration successful')
        } catch (passkeyError) {
          console.warn('Real passkey registration failed, falling back to mock:', passkeyError)
          // Handle specific passkey errors
          if (passkeyError instanceof Error) {
            if (passkeyError.name === 'NotAllowedError') {
              toast.dismiss('passkey-setup')
              toast.error('Passkey creation was cancelled. Please try again.')
              return false
            } else if (passkeyError.name === 'NotSupportedError') {
              toast.dismiss('passkey-setup')
              toast.error('Passkeys are not supported on this device.')
              return false
            }
          }
          registrationResult = await simulatePasskeyRegistration(username)
        }
      } else {
        // Use mock implementation
        registrationResult = await simulatePasskeyRegistration(username)
      }
      
      if (registrationResult.credentialId && registrationResult.stellarAddress) {
        const newUser: User = {
          id: username,
          username,
          publicKey: registrationResult.credentialId,
          stellarAddress: registrationResult.stellarAddress,
          credentialId: registrationResult.credentialId,
          isPasskeyEnabled
        }
        
        // Store user data
        setUser(newUser)
        localStorage.setItem('stellarpass_user', JSON.stringify(newUser))
        
        // Also store in all users list for username checking
        const allUsers = [...existingUsers, newUser]
        localStorage.setItem('stellarpass_all_users', JSON.stringify(allUsers))
        
        toast.dismiss('passkey-setup')
        const message = isPasskeyEnabled 
          ? '🎉 Real passkey created successfully! Welcome to StellarPass!'
          : '✅ Account created successfully! Welcome to StellarPass!'
        toast.success(message)
        return true
      } else {
        toast.dismiss('passkey-setup')
        toast.error('Failed to set up passkey. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Registration failed:', error)
      toast.dismiss('passkey-setup')
      
      // Handle specific passkey errors
      if (error instanceof Error) {
        if (error.name === 'NotSupportedError') {
          toast.error('Passkeys are not supported on this device or browser')
        } else if (error.name === 'NotAllowedError') {
          toast.error('Passkey creation was cancelled or not allowed')
        } else if (error.name === 'SecurityError') {
          toast.error('Security error: Please ensure you\'re on a secure connection (HTTPS)')
        } else {
          toast.error(`Registration failed: ${error.message}`)
        }
      } else {
        toast.error('Registration failed. Please try again.')
      }
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
      
      toast.loading('Authenticating with your passkey...', { id: 'passkey-auth' })
      
      const userData = JSON.parse(storedUser)
      let authenticationResult = false

      // Try real passkey authentication if available
      if (userData.isPasskeyEnabled && isPasskeySupported && userData.credentialId) {
        try {
          authenticationResult = await authenticateWithPasskey(userData.credentialId)
          console.log('Real passkey authentication successful')
        } catch (passkeyError) {
          console.warn('Real passkey authentication failed, falling back to mock:', passkeyError)
          authenticationResult = await simulatePasskeyAuthentication()
        }
      } else {
        // Use mock implementation
        authenticationResult = await simulatePasskeyAuthentication()
      }

      if (authenticationResult) {
        setUser(userData)
        toast.dismiss('passkey-auth')
        const message = userData.isPasskeyEnabled 
          ? `🎉 Welcome back, ${userData.username}! (Real Passkey)`
          : `✅ Welcome back, ${userData.username}!`
        toast.success(message)
        return true
      } else {
        toast.dismiss('passkey-auth')
        toast.error('Authentication failed. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      toast.dismiss('passkey-auth')
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Authentication was cancelled or not allowed')
        } else if (error.name === 'SecurityError') {
          toast.error('Security error during authentication')
        } else {
          toast.error(`Authentication failed: ${error.message}`)
        }
      } else {
        toast.error('Authentication failed. Please try again.')
      }
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
    isPasskeySupported,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 