import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WalletProvider } from './contexts/WalletContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import SendPage from './pages/SendPage'
import ReceivePage from './pages/ReceivePage'
import TipLinkPage from './pages/TipLinkPage'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <div className="min-h-screen bg-gradient-to-br from-stellar-50 via-primary-50 to-purple-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/send" element={
              <ProtectedRoute>
                <Layout>
                  <SendPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/receive" element={
              <ProtectedRoute>
                <Layout>
                  <ReceivePage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tip-link" element={
              <ProtectedRoute>
                <Layout>
                  <TipLinkPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tip/:username" element={<TipLinkPage />} />
          </Routes>
        </div>
      </WalletProvider>
    </AuthProvider>
  )
}

export default App 