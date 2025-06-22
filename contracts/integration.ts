/**
 * StellarPass Smart Contract Integration
 * TypeScript utilities for connecting the React frontend to the deployed Soroban contract
 */

import { 
  SorobanRpc, 
  TransactionBuilder, 
  Networks, 
  BASE_FEE,
  Account,
  Asset,
  Keypair,
  Contract,
  Address,
  nativeToScVal,
  scValToNative
} from '@stellar/stellar-sdk';

// Contract configuration (update after deployment)
export const CONTRACT_CONFIG = {
  // Replace with your deployed contract ID
  contractId: 'YOUR_DEPLOYED_CONTRACT_ID_HERE',
  networkPassphrase: Networks.TESTNET,
  rpcUrl: 'https://soroban-testnet.stellar.org:443',
  network: 'testnet' as const
};

// Initialize Soroban RPC client
const server = new SorobanRpc.Server(CONTRACT_CONFIG.rpcUrl);

/**
 * Contract interaction utilities
 */
export class StellarPassContract {
  private contractId: string;
  private server: SorobanRpc.Server;
  private contract: Contract;

  constructor(contractId: string = CONTRACT_CONFIG.contractId) {
    this.contractId = contractId;
    this.server = server;
    this.contract = new Contract(contractId);
  }

  /**
   * Register a new user with passkey authentication
   */
  async registerUser(params: {
    username: string;
    stellarAddress: string;
    passkeyId: string;
    sourceKeypair: Keypair;
  }) {
    const { username, stellarAddress, passkeyId, sourceKeypair } = params;

    try {
      // Build contract invocation
      const sourceAccount = await this.server.getAccount(sourceKeypair.publicKey());
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
      })
        .addOperation(
          this.contract.call(
            'register_user',
            nativeToScVal(username, { type: 'string' }),
            nativeToScVal(stellarAddress, { type: 'address' }),
            nativeToScVal(passkeyId, { type: 'string' })
          )
        )
        .setTimeout(30)
        .build();

      // Sign and submit transaction
      transaction.sign(sourceKeypair);
      const response = await this.server.sendTransaction(transaction);
      
      return response;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Send a micro-payment between users
   */
  async sendPayment(params: {
    from: string;
    to: string;
    amount: bigint;
    token: string;
    memo: string;
    paymentType: 'Transfer' | 'Tip' | 'Reward' | 'Gift';
    sourceKeypair: Keypair;
  }) {
    const { from, to, amount, token, memo, paymentType, sourceKeypair } = params;

    try {
      const sourceAccount = await this.server.getAccount(sourceKeypair.publicKey());
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
      })
        .addOperation(
          this.contract.call(
            'send_payment',
            nativeToScVal(from, { type: 'address' }),
            nativeToScVal(to, { type: 'address' }),
            nativeToScVal(amount, { type: 'i128' }),
            nativeToScVal(token, { type: 'address' }),
            nativeToScVal(memo, { type: 'string' }),
            nativeToScVal(paymentType, { type: 'symbol' })
          )
        )
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);
      const response = await this.server.sendTransaction(transaction);
      
      return response;
    } catch (error) {
      console.error('Error sending payment:', error);
      throw error;
    }
  }

  /**
   * Send a tip using tip link
   */
  async sendTip(params: {
    from: string;
    username: string;
    amount: bigint;
    token: string;
    message: string;
    sourceKeypair: Keypair;
  }) {
    const { from, username, amount, token, message, sourceKeypair } = params;

    try {
      const sourceAccount = await this.server.getAccount(sourceKeypair.publicKey());
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
      })
        .addOperation(
          this.contract.call(
            'send_tip',
            nativeToScVal(from, { type: 'address' }),
            nativeToScVal(username, { type: 'string' }),
            nativeToScVal(amount, { type: 'i128' }),
            nativeToScVal(token, { type: 'address' }),
            nativeToScVal(message, { type: 'string' })
          )
        )
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);
      const response = await this.server.sendTransaction(transaction);
      
      return response;
    } catch (error) {
      console.error('Error sending tip:', error);
      throw error;
    }
  }

  /**
   * Get user information
   */
  async getUser(username: string) {
    try {
      const result = await this.server.simulateTransaction(
        new TransactionBuilder(
          new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
          { fee: BASE_FEE, networkPassphrase: CONTRACT_CONFIG.networkPassphrase }
        )
          .addOperation(
            this.contract.call(
              'get_user',
              nativeToScVal(username, { type: 'string' })
            )
          )
          .setTimeout(30)
          .build()
      );

      return result;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Get tip link information
   */
  async getTipLink(username: string) {
    try {
      const result = await this.server.simulateTransaction(
        new TransactionBuilder(
          new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
          { fee: BASE_FEE, networkPassphrase: CONTRACT_CONFIG.networkPassphrase }
        )
          .addOperation(
            this.contract.call(
              'get_tip_link',
              nativeToScVal(username, { type: 'string' })
            )
          )
          .setTimeout(30)
          .build()
      );

      return result;
    } catch (error) {
      console.error('Error getting tip link:', error);
      throw error;
    }
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(userAddress: string, limit: number = 10) {
    try {
      const result = await this.server.simulateTransaction(
        new TransactionBuilder(
          new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
          { fee: BASE_FEE, networkPassphrase: CONTRACT_CONFIG.networkPassphrase }
        )
          .addOperation(
            this.contract.call(
              'get_user_payments',
              nativeToScVal(userAddress, { type: 'address' }),
              nativeToScVal(limit, { type: 'u32' })
            )
          )
          .setTimeout(30)
          .build()
      );

      return result;
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw error;
    }
  }

  /**
   * Get contract statistics
   */
  async getStats() {
    try {
      const result = await this.server.simulateTransaction(
        new TransactionBuilder(
          new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
          { fee: BASE_FEE, networkPassphrase: CONTRACT_CONFIG.networkPassphrase }
        )
          .addOperation(
            this.contract.call('get_stats')
          )
          .setTimeout(30)
          .build()
      );

      return result;
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  /**
   * Toggle tip link active status
   */
  async toggleTipLink(params: {
    username: string;
    ownerKeypair: Keypair;
  }) {
    const { username, ownerKeypair } = params;

    try {
      const sourceAccount = await this.server.getAccount(ownerKeypair.publicKey());
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
      })
        .addOperation(
          this.contract.call(
            'toggle_tip_link',
            nativeToScVal(username, { type: 'string' }),
            nativeToScVal(ownerKeypair.publicKey(), { type: 'address' })
          )
        )
        .setTimeout(30)
        .build();

      transaction.sign(ownerKeypair);
      const response = await this.server.sendTransaction(transaction);
      
      return response;
    } catch (error) {
      console.error('Error toggling tip link:', error);
      throw error;
    }
  }
}

/**
 * Utility functions for working with Stellar amounts
 */
export const StellarUtils = {
  /**
   * Convert XLM amount to stroops (1 XLM = 10^7 stroops)
   */
  xlmToStroops(xlm: number): bigint {
    return BigInt(Math.round(xlm * 10_000_000));
  },

  /**
   * Convert stroops to XLM amount
   */
  stroopsToXlm(stroops: bigint): number {
    return Number(stroops) / 10_000_000;
  },

  /**
   * Format XLM amount for display
   */
  formatXlm(stroops: bigint): string {
    const xlm = this.stroopsToXlm(stroops);
    return `${xlm.toFixed(7)} XLM`;
  },

  /**
   * Get native XLM asset
   */
  getNativeAsset(): Asset {
    return Asset.native();
  },

  /**
   * Create Address from string
   */
  addressFromString(address: string): Address {
    return new Address(address);
  }
};

/**
 * Example usage in React component:
 * 
 * ```typescript
 * import { StellarPassContract, StellarUtils } from './contracts/integration';
 * 
 * const contract = new StellarPassContract();
 * 
 * // Register user
 * await contract.registerUser({
 *   username: 'alice',
 *   stellarAddress: userAddress,
 *   passkeyId: credentialId,
 *   sourceKeypair: userKeypair
 * });
 * 
 * // Send payment
 * await contract.sendPayment({
 *   from: senderAddress,
 *   to: recipientAddress,
 *   amount: StellarUtils.xlmToStroops(0.5), // 0.5 XLM
 *   token: StellarUtils.getNativeAsset().contractAddress(),
 *   memo: 'Coffee tip',
 *   paymentType: 'Tip',
 *   sourceKeypair: senderKeypair
 * });
 * ```
 */

export default StellarPassContract; 