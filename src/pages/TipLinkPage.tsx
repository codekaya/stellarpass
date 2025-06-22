import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Link as LinkIcon, ArrowLeft, Copy, Share2, ExternalLink, Heart, Coffee, Zap } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useWallet } from '../contexts/WalletContext'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const TipLinkPage = () => {
  const navigate = useNavigate()
  const { username } = useParams<{ username: string }>()
  const { generateTipLink, sendPayment } = useWallet()
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')

  const isPublicTipPage = !!username
  const tipLink = generateTipLink()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tipLink)
      toast.success('Tip link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Tip ${user?.username || 'me'} on StellarPass`,
          text: `Send me a tip using StellarPass!`,
          url: tipLink,
        })
      } else {
        await handleCopy()
      }
    } catch (error) {
      toast.error('Failed to share')
    }
  }

  const handleTip = async (tipAmount: string) => {
    if (!tipAmount || parseFloat(tipAmount) <= 0) return
    
    const success = await sendPayment(`${username}@stellarpass.io`, tipAmount)
    if (success) {
      toast.success(`Successfully tipped ${tipAmount} XLM!`)
      setAmount('')
      setCustomAmount('')
      setMessage('')
    }
  }

  if (isPublicTipPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stellar-50 via-primary-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Profile Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-stellar-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            >
              {username?.charAt(0).toUpperCase()}
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">@{username}</h1>
            <p className="text-gray-600">Send a tip on StellarPass</p>
          </div>

          {/* Tip Amounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card space-y-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 text-center">Choose Amount</h2>
            
            {/* Quick Tip Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { amount: '1', icon: Coffee, label: 'Coffee' },
                { amount: '5', icon: Heart, label: 'Thanks' },
                { amount: '10', icon: Zap, label: 'Awesome' },
              ].map((tip) => (
                <motion.button
                  key={tip.amount}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAmount(tip.amount)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    amount === tip.amount
                      ? 'border-stellar-500 bg-stellar-50'
                      : 'border-gray-200 hover:border-stellar-300'
                  }`}
                >
                  <tip.icon className="w-6 h-6 mx-auto mb-2 text-stellar-600" />
                  <p className="text-sm font-medium text-gray-900">{tip.amount} XLM</p>
                  <p className="text-xs text-gray-500">{tip.label}</p>
                </motion.button>
              ))}
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Amount (XLM)
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setAmount('')
                }}
                placeholder="Enter amount..."
                step="0.01"
                min="0"
                className="input-field"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something nice..."
                rows={3}
                maxLength={140}
                className="input-field resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/140 characters
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTip(amount || customAmount)}
              disabled={!(amount || customAmount) || parseFloat(amount || customAmount) <= 0}
              className="button-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="w-5 h-5" />
              <span>Send Tip</span>
            </motion.button>
          </motion.div>

          {/* Powered by */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Powered by <span className="font-semibold text-stellar-600">StellarPass</span>
            </p>
          </div>
        </motion.div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Tip Link</h1>
          <p className="text-gray-600">Share your personalized tip link</p>
        </div>
      </div>

      {/* Tip Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center space-y-6"
      >
        <div className="w-48 h-48 mx-auto p-4 bg-white rounded-2xl shadow-inner">
          <QRCodeSVG
            value={tipLink}
            size={176}
            level="M"
            includeMargin={true}
            className="w-full h-full"
          />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Your Tip Link</p>
            <div className="bg-gray-50 rounded-xl p-3 text-sm font-mono break-all">
              {tipLink}
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
              <span>Copy Link</span>
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

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open(tipLink, '_blank')}
            className="flex items-center space-x-2 text-stellar-600 hover:text-stellar-700"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">Open in new tab</span>
          </motion.button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-stellar-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">@{user?.username}</h3>
            <p className="text-sm text-gray-600 mb-4">Send a tip on StellarPass</p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-3 bg-white rounded-lg border">
                <Coffee className="w-5 h-5 mx-auto mb-1 text-stellar-600" />
                <p className="text-xs font-medium">1 XLM</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <Heart className="w-5 h-5 mx-auto mb-1 text-stellar-600" />
                <p className="text-xs font-medium">5 XLM</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <Zap className="w-5 h-5 mx-auto mb-1 text-stellar-600" />
                <p className="text-xs font-medium">10 XLM</p>
              </div>
            </div>
            
            <button className="bg-stellar-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Send Tip
            </button>
          </div>
        </div>
      </motion.div>

      {/* Usage Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Use Your Tip Link</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-stellar-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-stellar-600">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Share your link</p>
              <p className="text-xs text-gray-600">Add it to your social media bio, website, or blog</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-stellar-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-stellar-600">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Receive tips instantly</p>
              <p className="text-xs text-gray-600">Fans can tip you without creating an account</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-stellar-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-stellar-600">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Track your earnings</p>
              <p className="text-xs text-gray-600">All tips appear in your transaction history</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default TipLinkPage 