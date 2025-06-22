import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Server, Keypair, Account, TransactionBuilder, Operation, Asset, Networks } from '@stellar/stellar-sdk'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  type: 'send' | 'receive'
  amount: string
  from?: string
  to?: string
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
}

interface WalletContextType {
  balance: string
  isLoading: boolean
  transactions: Transaction[]
  publicKey: string | null
  sendPayment: (destination: string, amount: string) => Promise<boolean>
  refreshBalance: () => Promise<void>
  generateTipLink: () => string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [balance, setBalance] = useState('0.00')
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [keypair, setKeypair] = useState<Keypair | null>(null)

  // Initialize wallet when user logs in
  useEffect(() => {
    if (user) {
      initializeWallet()
    } else {
      setBalance('0.00')
      setTransactions([])
      setPublicKey(null)
      setKeypair(null)
    }
  }, [user])

  const initializeWallet = async () => {
    try {
      // In a real app, this would derive from passkey or secure storage
      // For demo purposes, we'll generate or retrieve a keypair
      let storedKeypair = localStorage.getItem(`stellarpass_keypair_${user?.id}`)
      let walletKeypair: Keypair
      
      if (storedKeypair) {
        walletKeypair = Keypair.fromSecret(storedKeypair)
      } else {
        walletKeypair = Keypair.random()
        localStorage.setItem(`stellarpass_keypair_${user?.id}`, walletKeypair.secret())
      }
      
      setKeypair(walletKeypair)
      setPublicKey(walletKeypair.publicKey())
      
      // Set demo balance
      setBalance('12.35')
      
      // Set demo transactions
      setTransactions([
        {
          id: '1',
          type: 'receive',
          amount: '5.00',
          from: 'GAKFZ...NPT',
          timestamp: new Date(Date.now() - 3600000),
          status: 'completed'
        },
        {
          id: '2',
          type: 'send',
          amount: '2.50',
          to: 'GBCDE...XYZ',
          timestamp: new Date(Date.now() - 7200000),
          status: 'completed'
        },
        {
          id: '3',
          type: 'receive',
          amount: '10.00',
          from: 'GFGHI...ABC',
          timestamp: new Date(Date.now() - 86400000),
          status: 'completed'
        }
      ])
    } catch (error) {
      console.error('Failed to initialize wallet:', error)
      toast.error('Failed to initialize wallet')
    }
  }

  const refreshBalance = async () => {
    if (!publicKey) return
    
    try {
      setIsLoading(true)
      // In a real app, this would fetch from Stellar network
      // For demo, we'll simulate a network call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate updated balance
      const currentBalance = parseFloat(balance)
      const newBalance = (currentBalance + Math.random() * 0.1 - 0.05).toFixed(2)
      setBalance(newBalance)
      
      toast.success('Balance updated')
    } catch (error) {
      console.error('Failed to refresh balance:', error)
      toast.error('Failed to refresh balance')
    } finally {
      setIsLoading(false)
    }
  }

  const sendPayment = async (destination: string, amount: string): Promise<boolean> => {
    if (!keypair || !publicKey) {
      toast.error('Wallet not initialized')
      return false
    }

    try {
      setIsLoading(true)
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update balance
      const currentBalance = parseFloat(balance)
      const sendAmount = parseFloat(amount)
      if (currentBalance < sendAmount) {
        toast.error('Insufficient balance')
        return false
      }
      
      const newBalance = (currentBalance - sendAmount).toFixed(2)
      setBalance(newBalance)
      
      // Add transaction to history
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'send',
        amount,
        to: destination,
        timestamp: new Date(),
        status: 'completed'
      }
      
      setTransactions(prev => [newTransaction, ...prev])
      toast.success(`Successfully sent ${amount} XLM`)
      return true
    } catch (error) {
      console.error('Failed to send payment:', error)
      toast.error('Payment failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const generateTipLink = (): string => {
    if (!user) return ''
    return `stellarpass.io/tip/${user.username}`
  }

  const value: WalletContextType = {
    balance,
    isLoading,
    transactions,
    publicKey,
    sendPayment,
    refreshBalance,
    generateTipLink,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
} 