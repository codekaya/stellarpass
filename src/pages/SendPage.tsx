import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, Fingerprint, ArrowLeft, User, DollarSign } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useAuth } from '../contexts/AuthContext'

const SendPage = () => {
  const navigate = useNavigate()
  const { sendPayment, balance, isLoading } = useWallet()
  const { login } = useAuth()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'form' | 'confirm' | 'auth'>('form')

  const handleSend = async () => {
    if (!recipient || !amount) return
    
    setStep('auth')
    
    // Simulate passkey authentication
    const authenticated = await login()
    if (!authenticated) {
      setStep('form')
      return
    }
    
    const success = await sendPayment(recipient, amount)
    if (success) {
      navigate('/')
    } else {
      setStep('form')
    }
  }

  const maxAmount = parseFloat(balance)
  const sendAmount = parseFloat(amount) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Send Payment</h1>
          <p className="text-gray-600">Send XLM to any Stellar address</p>
        </div>
      </div>

      {step === 'form' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Balance Display */}
          <div className="card">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">{balance} XLM</p>
              <p className="text-sm text-gray-500">≈ $15.42 USD</p>
            </div>
          </div>

          {/* Send Form */}
          <div className="card space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Recipient
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Stellar address or username"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a Stellar public key or StellarPass username
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Amount (XLM)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={balance}
                  className="input-field pr-20"
                />
                <button
                  onClick={() => setAmount(balance)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stellar-600 text-sm font-medium hover:text-stellar-700"
                >
                  MAX
                </button>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>≈ ${(sendAmount * 1.25).toFixed(2)} USD</span>
                <span>Fee: 0.00001 XLM</span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {['1', '5', '10', '25'].map((quickAmount) => (
                <motion.button
                  key={quickAmount}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAmount(quickAmount)}
                  className="py-2 px-3 text-sm font-medium text-stellar-600 bg-stellar-50 hover:bg-stellar-100 rounded-lg transition-colors"
                >
                  {quickAmount} XLM
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep('confirm')}
              disabled={!recipient || !amount || sendAmount > maxAmount || sendAmount <= 0}
              className="button-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span>Review Payment</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {step === 'confirm' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-stellar-100 rounded-full flex items-center justify-center">
                <Send className="w-8 h-8 text-stellar-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirm Payment</h2>
              <p className="text-gray-600">Review the details before sending</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">To</span>
                <span className="font-medium text-gray-900">{recipient}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium text-gray-900">{amount} XLM</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Network Fee</span>
                <span className="font-medium text-gray-900">0.00001 XLM</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-stellar-600">{(parseFloat(amount) + 0.00001).toFixed(5)} XLM</span>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('form')}
                className="button-secondary flex-1"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                className="button-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Fingerprint className="w-5 h-5" />
                <span>Authenticate & Send</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {step === 'auth' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div className="card max-w-sm w-full text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-4 bg-stellar-100 rounded-full flex items-center justify-center"
            >
              <Fingerprint className="w-8 h-8 text-stellar-600" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authenticate Payment</h3>
            <p className="text-gray-600 mb-4">Use your biometric authentication to confirm this payment</p>
            {isLoading && (
              <div className="w-8 h-8 mx-auto border-2 border-stellar-600 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SendPage 