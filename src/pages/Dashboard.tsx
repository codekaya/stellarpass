import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  Send, 
  QrCode, 
  Link as LinkIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  User,
  Settings,
  Coffee,
  Gift,
  Music,
  Gamepad2,
  Heart,
  Star,
  Zap,
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { balance, transactions, isLoading } = useWallet()
  const { user } = useAuth()
  const [showBalance, setShowBalance] = React.useState(true)

  // Enhanced mock micro payments data
  const microPayments = [
    {
      id: '1',
      type: 'receive' as const,
      amount: '0.50',
      from: 'CoffeeShop',
      description: 'Tip for great service',
      icon: Coffee,
      timestamp: new Date(Date.now() - 300000), // 5 min ago
      status: 'completed' as const,
      category: 'tip'
    },
    {
      id: '2',
      type: 'send' as const,
      amount: '1.25',
      to: 'MusicStream',
      description: 'Premium track unlock',
      icon: Music,
      timestamp: new Date(Date.now() - 900000), // 15 min ago
      status: 'completed' as const,
      category: 'entertainment'
    },
    {
      id: '3',
      type: 'receive' as const,
      amount: '2.00',
      from: 'GameReward',
      description: 'Achievement bonus',
      icon: Gamepad2,
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      status: 'completed' as const,
      category: 'gaming'
    },
    {
      id: '4',
      type: 'send' as const,
      amount: '0.75',
      to: 'ContentCreator',
      description: 'Support for great content',
      icon: Heart,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'completed' as const,
      category: 'support'
    },
    {
      id: '5',
      type: 'receive' as const,
      amount: '5.00',
      from: 'Birthday Gift',
      description: 'Happy birthday from mom!',
      icon: Gift,
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      status: 'completed' as const,
      category: 'gift'
    },
    {
      id: '6',
      type: 'send' as const,
      amount: '0.25',
      to: 'NewsArticle',
      description: 'Micro-payment for article',
      icon: Star,
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      status: 'completed' as const,
      category: 'content'
    }
  ]

  const formatAmount = (amount: string) => {
    return `${amount} XLM`
  }

  const formatTime = (timestamp: Date) => {
    const now = Date.now()
    const diff = now - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      tip: 'bg-amber-100 text-amber-600',
      entertainment: 'bg-purple-100 text-purple-600',
      gaming: 'bg-blue-100 text-blue-600',
      support: 'bg-pink-100 text-pink-600',
      gift: 'bg-green-100 text-green-600',
      content: 'bg-indigo-100 text-indigo-600'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-600'
  }

  const totalSent = microPayments
    .filter(tx => tx.type === 'send')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

  const totalReceived = microPayments
    .filter(tx => tx.type === 'receive')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-stellar-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
              <p className="text-gray-600">Ready for some micro-payments? ⚡</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stellar-500 via-primary-600 to-purple-600 p-6 text-white shadow-2xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20" />
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Balance</p>
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-4xl font-bold"
                >
                  {showBalance ? formatAmount(balance) : '••••••'}
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  {showBalance ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">≈ $15.42 USD</p>
              <div className="flex items-center space-x-1 text-green-300">
                <TrendingUp className="w-3 h-3" />
                <p className="text-xs">+2.3%</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <Link to="/send">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center space-y-2 hover:bg-white/30 transition-colors"
              >
                <Send className="w-6 h-6" />
                <span className="text-sm font-medium">Send</span>
              </motion.button>
            </Link>

            <Link to="/receive">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center space-y-2 hover:bg-white/30 transition-colors"
              >
                <QrCode className="w-6 h-6" />
                <span className="text-sm font-medium">Receive</span>
              </motion.button>
            </Link>

            <Link to="/tip-link">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center space-y-2 hover:bg-white/30 transition-colors"
              >
                <LinkIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Tip Link</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <div className="card text-center p-4 min-h-[120px] flex flex-col justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-green-100 rounded-xl flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">${totalReceived.toFixed(2)}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Received Today</p>
        </div>

        <div className="card text-center p-4 min-h-[120px] flex flex-col justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-red-100 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">${totalSent.toFixed(2)}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Sent Today</p>
        </div>

        <div className="card text-center p-4 min-h-[120px] flex flex-col justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-blue-100 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">{microPayments.length}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Micro Payments</p>
        </div>

        <div className="card text-center p-4 min-h-[120px] flex flex-col justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-purple-100 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">Gold</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Member Status</p>
        </div>
      </motion.div>

      {/* Recent Micro Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Micro Payments</h2>
            <p className="text-sm text-gray-600">Your latest small transactions</p>
          </div>
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
          >
            <Clock className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>

        <div className="space-y-3">
          {microPayments.map((tx, index) => {
            const IconComponent = tx.icon
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${getCategoryColor(tx.category)}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <p className="font-semibold text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-500">
                      {tx.type === 'send' ? `To ${tx.to}` : `From ${tx.from}`}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-400">{formatTime(tx.timestamp)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    tx.type === 'send' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {tx.type === 'send' ? '-' : '+'}{formatAmount(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{tx.category}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-6 text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-stellar-600 hover:text-stellar-700 font-medium px-6 py-2 rounded-lg hover:bg-stellar-50 transition-colors"
          >
            View all transactions
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard 