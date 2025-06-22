import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QrCode, ArrowLeft, Copy, Share2, DollarSign } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useWallet } from '../contexts/WalletContext'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const ReceivePage = () => {
  const navigate = useNavigate()
  const { publicKey } = useWallet()
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')

  const generateQRData = () => {
    if (!publicKey) return ''
    
    let qrData = `stellar:${publicKey}`
    const params = []
    
    if (amount) {
      params.push(`amount=${amount}`)
    }
    if (memo) {
      params.push(`memo=${encodeURIComponent(memo)}`)
    }
    
    if (params.length > 0) {
      qrData += `?${params.join('&')}`
    }
    
    return qrData
  }

  const handleCopy = async () => {
    if (!publicKey) return
    
    try {
      await navigator.clipboard.writeText(publicKey)
      toast.success('Address copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const handleShare = async () => {
    const qrData = generateQRData()
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Send me XLM on StellarPass',
          text: `Send me XLM using this address: ${publicKey}`,
          url: qrData,
        })
      } else {
        await navigator.clipboard.writeText(qrData)
        toast.success('Payment link copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to share')
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Receive Payment</h1>
          <p className="text-gray-600">Share your address to receive XLM</p>
        </div>
      </div>

      {/* Request Amount (Optional) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">Request Specific Amount (Optional)</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Amount (XLM)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Memo (Optional)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Payment for..."
            maxLength={28}
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">
            {memo.length}/28 characters
          </p>
        </div>
      </motion.div>

      {/* QR Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card text-center"
      >
        <div className="w-64 h-64 mx-auto mb-6 p-4 bg-white rounded-2xl shadow-inner">
          {publicKey ? (
            <QRCodeSVG
              value={generateQRData()}
              size={224}
              level="M"
              includeMargin={true}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Your Stellar Address</p>
            <div className="bg-gray-50 rounded-xl p-3 text-sm font-mono break-all">
              {publicKey || 'Loading...'}
            </div>
          </div>

          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              className="button-secondary flex-1 flex items-center justify-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Address</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="button-primary flex-1 flex items-center justify-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Receive</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-stellar-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-stellar-600">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Share your QR code</p>
              <p className="text-xs text-gray-600">Let others scan it with any camera app</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-stellar-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-stellar-600">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Or copy your address</p>
              <p className="text-xs text-gray-600">Share it via text, email, or social media</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-stellar-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-stellar-600">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Receive instantly</p>
              <p className="text-xs text-gray-600">Payments arrive in seconds on Stellar</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Share Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Share</h3>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">💬</div>
            <p className="text-sm font-medium text-gray-900">Text Message</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📧</div>
            <p className="text-sm font-medium text-gray-900">Email</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🔗</div>
            <p className="text-sm font-medium text-gray-900">Social Media</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm font-medium text-gray-900">Print QR</p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default ReceivePage 