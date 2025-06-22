# StellarPass Smart Contract

A comprehensive Soroban smart contract for the StellarPass micro-payments platform on Stellar.

## 🌟 Features

### Core Functionality
- **User Registration**: Register users with passkey authentication
- **Micro-Payments**: Send and receive small payments with minimal fees
- **Tip Links**: Create personalized tip links for content creators
- **Payment History**: Track all transactions with detailed metadata
- **Statistics**: Real-time analytics for users and platform

### Smart Contract Capabilities
- **Passkey Integration**: Store passkey credentials securely on-chain
- **Multi-Token Support**: Support for XLM and other Stellar assets
- **Payment Categories**: Categorize payments (tips, rewards, gifts, etc.)
- **User Statistics**: Track total sent/received amounts per user
- **Tip Link Management**: Enable/disable tip links dynamically

## 📋 Contract Structure

### Data Types

#### User
```rust
pub struct User {
    pub username: String,
    pub stellar_address: Address,
    pub passkey_id: String,
    pub created_at: u64,
    pub total_sent: i128,
    pub total_received: i128,
}
```

#### Payment
```rust
pub struct Payment {
    pub id: u64,
    pub from: Address,
    pub to: Address,
    pub amount: i128,
    pub token: Address,
    pub memo: String,
    pub timestamp: u64,
    pub payment_type: PaymentType,
}
```

#### TipLink
```rust
pub struct TipLink {
    pub username: String,
    pub owner: Address,
    pub total_tips: i128,
    pub tip_count: u64,
    pub active: bool,
}
```

### Payment Types
- `Transfer`: Standard peer-to-peer payments
- `Tip`: Tips sent via tip links
- `Reward`: Achievement or performance rewards
- `Gift`: Personal gifts between users

## 🔧 Contract Methods

### Administrative
- `initialize(admin: Address)` - Initialize contract with admin
- `get_stats()` - Get platform statistics

### User Management
- `register_user(username, address, passkey_id)` - Register new user
- `get_user(username)` - Get user information

### Payments
- `send_payment(from, to, amount, token, memo, type)` - Send payment
- `get_user_payments(address, limit)` - Get user's payment history

### Tip Links
- `send_tip(from, username, amount, token, message)` - Send tip via tip link
- `get_tip_link(username)` - Get tip link information
- `toggle_tip_link(username, owner)` - Enable/disable tip link

## 🚀 Deployment

### Prerequisites
- Rust 1.84+ (for latest Soroban features)
- Soroban CLI
- Stellar testnet account with XLM

### Installation

1. **Install Rust** (if not already installed):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup update
   ```

2. **Install Soroban CLI**:
   ```bash
   cargo install --locked soroban-cli
   ```

3. **Add WebAssembly target**:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

### Deploy to Testnet

1. **Make deployment script executable**:
   ```bash
   chmod +x deploy.sh
   ```

2. **Run deployment**:
   ```bash
   ./deploy.sh
   ```

The script will:
- Configure Soroban for testnet
- Generate a deployer identity
- Fund the account via friendbot
- Build and deploy the contract
- Initialize the contract
- Save deployment info to `deployment.json`

### Manual Deployment

If you prefer manual deployment:

1. **Configure network**:
   ```bash
   soroban network add testnet \
     --rpc-url https://soroban-testnet.stellar.org:443 \
     --network-passphrase "Test SDF Network ; September 2015"
   ```

2. **Generate identity**:
   ```bash
   soroban keys generate --network testnet stellarpass-deployer
   ```

3. **Fund account**:
   ```bash
   curl -X POST "https://friendbot.stellar.org/?addr=$(soroban keys address stellarpass-deployer)"
   ```

4. **Build contract**:
   ```bash
   soroban contract build
   ```

5. **Deploy**:
   ```bash
   soroban contract deploy \
     --wasm target/wasm32-unknown-unknown/release/stellarpass_contract.wasm \
     --source stellarpass-deployer \
     --network testnet
   ```

6. **Initialize**:
   ```bash
   soroban contract invoke \
     --id <CONTRACT_ID> \
     --source stellarpass-deployer \
     --network testnet \
     -- \
     initialize \
     --admin $(soroban keys address stellarpass-deployer)
   ```

## 🧪 Testing

Run the test suite:
```bash
cargo test
```

### Test Coverage
- User registration and validation
- Payment processing
- Tip link functionality
- Error handling
- Authorization checks

## 🔗 Integration with Frontend

After deployment, update your frontend configuration:

```typescript
// In your React app
const CONTRACT_CONFIG = {
  contractId: "YOUR_DEPLOYED_CONTRACT_ID",
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org:443"
}
```

### Usage Examples

#### Register User
```typescript
const result = await contract.register_user({
  username: "alice",
  stellar_address: userAddress,
  passkey_id: passkeyCredentialId
})
```

#### Send Payment
```typescript
const paymentId = await contract.send_payment({
  from: senderAddress,
  to: recipientAddress,
  amount: BigInt(1000000), // 1 XLM (7 decimal places)
  token: nativeTokenAddress,
  memo: "Coffee tip",
  payment_type: { tag: "Tip" }
})
```

#### Send Tip
```typescript
const tipId = await contract.send_tip({
  from: tipperAddress,
  username: "creator123",
  amount: BigInt(500000), // 0.5 XLM
  token: nativeTokenAddress,
  message: "Great content!"
})
```

## 📊 Contract Analytics

The contract provides built-in analytics:

- **Total Users**: Number of registered users
- **Total Payments**: Number of processed payments
- **Total Volume**: Total payment volume across all tokens
- **User Statistics**: Individual user sending/receiving totals
- **Tip Link Performance**: Tips received per creator

## 🔒 Security Features

- **Authorization**: All sensitive operations require proper authentication
- **Input Validation**: Comprehensive validation of all inputs
- **Overflow Protection**: Safe arithmetic operations
- **Access Control**: Admin-only functions protected
- **Passkey Verification**: Integration with WebAuthn standards

## 🛠 Development

### Project Structure
```
contracts/
├── src/
│   └── lib.rs          # Main contract implementation
├── Cargo.toml          # Rust dependencies
├── deploy.sh           # Deployment script
└── README.md           # This file
```

### Building for Production
```bash
cargo build --target wasm32-unknown-unknown --release
```

### Optimizing Contract Size
The contract is configured for minimal size:
- Optimized for `z` level
- LTO enabled
- Debug symbols stripped
- Panic handling optimized

## 🌐 Network Configuration

### Testnet
- **RPC URL**: https://soroban-testnet.stellar.org:443
- **Network Passphrase**: "Test SDF Network ; September 2015"
- **Friendbot**: https://friendbot.stellar.org/

### Mainnet (Future)
- **RPC URL**: https://soroban-mainnet.stellar.org:443
- **Network Passphrase**: "Public Global Stellar Network ; September 2015"

## 📈 Performance Considerations

- **Gas Optimization**: Contract methods optimized for minimal instruction count
- **Storage Efficiency**: Data structures designed for minimal storage usage
- **Batch Operations**: Support for efficient bulk operations
- **Pagination**: Large data sets can be retrieved in chunks

## 🔄 Upgrade Path

The contract is designed to be upgradeable:
1. Deploy new contract version
2. Migrate data if necessary
3. Update frontend configuration
4. Deprecate old contract

## 📞 Support

For deployment issues or questions:
1. Check Soroban CLI documentation
2. Verify Rust toolchain version
3. Ensure testnet connectivity
4. Review contract logs for errors

## 🎯 Future Enhancements

- **Multi-signature support** for enterprise accounts
- **Recurring payments** for subscriptions
- **Cross-chain bridges** for other networks
- **Advanced analytics** and reporting
- **Governance features** for community management

---

**Ready to deploy your StellarPass smart contract to Stellar testnet! 🚀** 