# StellarPass - React Frontend

A beautiful React frontend for StellarPass, your gateway to seamless micro-payments on the Stellar network.

## Features

- 🔐 **Passkey Authentication** - No seed phrases, no passwords, just Face ID/Touch ID
- 💰 **Real-time Balance** - View your XLM balance with live updates
- ⚡ **Instant Payments** - Send XLM to any Stellar address in seconds
- 📱 **QR Code Generation** - Easy receiving with scannable QR codes
- 🎁 **Tip Links** - Create personalized tip links for social media
- 🎨 **Modern UI** - Beautiful, mobile-first design with smooth animations
- 🚀 **Consumer-Ready** - Web2-level user experience on Web3 infrastructure

## Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Stellar SDK** for blockchain integration
- **SimpleWebAuthn** for Passkey authentication
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stellarpass-react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### First Time Setup

1. Visit the app and click "Create Account"
2. Choose a username
3. Set up your Passkey using Face ID/Touch ID
4. Your wallet is automatically created and ready to use!

### Key Features

#### Dashboard
- View your XLM balance and recent transactions
- Quick access to send, receive, and tip link features
- Real-time balance updates

#### Send Payments
- Enter recipient address or StellarPass username
- Set amount with quick buttons or custom input
- Authenticate with Passkey to confirm transaction

#### Receive Payments
- Generate QR codes for easy receiving
- Share your Stellar address
- Request specific amounts with optional memos

#### Tip Links
- Create personalized tip links (e.g., stellarpass.io/tip/yourusername)
- Share on social media, blogs, or websites
- Receive tips from anyone without them needing an account

## Demo Features

This is a demo version with simulated features:

- **Simulated Passkey Authentication** - Works on all devices for demo purposes
- **Mock Stellar Network** - Transactions are simulated for demonstration
- **Demo Balance & Transactions** - Pre-loaded with example data
- **Local Storage** - Account data persists in browser storage

## Architecture

### Components Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts for state management
├── pages/              # Main page components
├── App.tsx             # Main app with routing
├── main.tsx           # React entry point
└── index.css          # Global styles
```

### Key Contexts

- **AuthContext** - Manages user authentication and Passkey integration
- **WalletContext** - Handles Stellar wallet operations and balance management

## Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update colors in the `stellar` and `primary` color palettes
- Customize animations and transitions

### Features
- Add real Stellar network integration in `WalletContext`
- Implement server-side Passkey verification
- Add additional payment methods or currencies

## Browser Support

- **Modern Browsers** - Chrome 67+, Firefox 60+, Safari 14+
- **Passkey Support** - Requires WebAuthn-compatible browser
- **Mobile Optimized** - Responsive design for all screen sizes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Stellar Development Foundation** for the amazing blockchain infrastructure
- **WebAuthn Community** for passwordless authentication standards
- **React Team** for the incredible developer experience 