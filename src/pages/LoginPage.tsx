import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Fingerprint, Stars, Zap, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = () => {
  const { user, login, register, isLoading, isPasskeySupported } = useAuth()
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [username, setUsername] = useState('')

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async () => {
    await login()
  }

  const handleRegister = async () => {
    if (!username.trim()) return
    const success = await register(username)
    if (success) {
      setIsRegisterMode(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stellar-50 via-primary-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-stellar-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Stars className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            StellarPass
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600"
          >
            Your gateway to seamless micro-payments
          </motion.p>
          
          {isPasskeySupported && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium mt-2"
            >
              ✨ Real Passkey Support Enabled
            </motion.div>
          )}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-stellar-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-stellar-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Instant</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Secure</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-xl flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">No Keys</p>
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card space-y-6"
        >
          {!isRegisterMode ? (
            <>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600 text-sm">Sign in with your Passkey</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={isLoading}
                className="button-primary w-full flex items-center justify-center space-x-3"
              >
                <Fingerprint className="w-5 h-5" />
                <span>{isLoading ? 'Authenticating...' : 'Sign in with Passkey'}</span>
              </motion.button>
              
              <div className="text-center">
                <button
                  onClick={() => setIsRegisterMode(true)}
                  className="text-stellar-600 hover:text-stellar-700 text-sm font-medium"
                >
                  Don't have an account? Create one
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-600 text-sm">Choose a username and set up your Passkey</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-field"
                  required
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
                disabled={isLoading || !username.trim()}
                className="button-primary w-full flex items-center justify-center space-x-3"
              >
                <Fingerprint className="w-5 h-5" />
                <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              </motion.button>
              
              <div className="text-center">
                <button
                  onClick={() => setIsRegisterMode(false)}
                  className="text-stellar-600 hover:text-stellar-700 text-sm font-medium"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          Powered by Stellar Network
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage 