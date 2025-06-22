import React from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, AlertCircle, Key, Wallet } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const PasskeyStatus = () => {
  const { user, isPasskeySupported } = useAuth()

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <span>Passkey Security</span>
              {user.isPasskeyEnabled ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {user.isPasskeyEnabled ? (
                <span className="text-sm text-green-700 font-medium">
                  🎉 Real Passkey Active
                </span>
              ) : (
                <span className="text-sm text-amber-700">
                  {isPasskeySupported ? '⚡ Demo Mode' : '❌ Not Supported'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user.stellarAddress && (
            <div className="text-right">
              <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                <Wallet className="w-3 h-3" />
                <span>Stellar Address</span>
              </div>
              <p className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                {user.stellarAddress.slice(0, 6)}...{user.stellarAddress.slice(-6)}
              </p>
            </div>
          )}

          {user.credentialId && (
            <div className="text-right">
              <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                <Key className="w-3 h-3" />
                <span>Credential ID</span>
              </div>
              <p className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                {user.credentialId.slice(0, 8)}...
              </p>
            </div>
          )}
        </div>
      </div>

      {user.isPasskeyEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">
              You're using real biometric authentication with WebAuthn! Your account is secured with Face ID, Touch ID, or device PIN.
            </p>
          </div>
        </motion.div>
      )}

      {!user.isPasskeyEnabled && isPasskeySupported && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Your device supports passkeys, but you're in demo mode. Create a new account to enable real passkey authentication.
            </p>
          </div>
        </motion.div>
      )}

      {!isPasskeySupported && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Passkeys are not supported on this device or browser. Using secure demo mode instead.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default PasskeyStatus 