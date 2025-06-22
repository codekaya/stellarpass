import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Space, message, Alert } from 'antd';
import { KeyOutlined, WalletOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PasskeyWalletProps {
  onWalletConnected: (address: string) => void;
  onWalletDisconnected: () => void;
}

const PasskeyWallet: React.FC<PasskeyWalletProps> = ({
  onWalletConnected,
  onWalletDisconnected,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Stellar Brand Colors
  const stellarColors = {
    gold: '#FDDA24',
    black: '#0F0F0F',
    white: '#F6F7F8',
  };

  useEffect(() => {
    // Check if Passkeys are supported
    const checkPasskeySupport = async () => {
      if (
        window.PublicKeyCredential &&
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
      ) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
      }
    };

    checkPasskeySupport();
  }, []);

  const generateStellarAddress = (): string => {
    // Generate a mock Stellar address for demo purposes
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = 'G';
    for (let i = 0; i < 55; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createPasskey = async () => {
    if (!isSupported) {
      message.error('Passkeys not supported on this device');
      return;
    }

    setLoading(true);
    try {
      // Create a simple passkey credential
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'Stellar P2P Transfer',
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16),
          name: 'user@example.com',
          displayName: 'Stellar User',
        },
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7, // ES256
          },
        ],
        timeout: 60000,
        attestation: 'direct',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      });

      if (credential) {
        // Generate a mock Stellar address
        const stellarAddress = generateStellarAddress();
        setAddress(stellarAddress);
        setIsConnected(true);
        onWalletConnected(stellarAddress);
        message.success('Passkey wallet created and connected!');
      }
    } catch (error) {
      console.error('Passkey creation failed:', error);
      message.error('Failed to create Passkey wallet');
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithPasskey = async () => {
    if (!isSupported) {
      message.error('Passkeys not supported on this device');
      return;
    }

    setLoading(true);
    try {
      // Simulate passkey authentication
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertionOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        timeout: 60000,
        userVerification: 'required',
      };

      // For demo purposes, we'll simulate successful authentication
      // In a real implementation, you would use navigator.credentials.get()
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate a mock Stellar address
      const stellarAddress = generateStellarAddress();
      setAddress(stellarAddress);
      setIsConnected(true);
      onWalletConnected(stellarAddress);
      message.success('Authenticated with Passkey!');
    } catch (error) {
      console.error('Passkey authentication failed:', error);
      message.error('Failed to authenticate with Passkey');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    onWalletDisconnected();
    message.info('Wallet disconnected');
  };

  if (!isSupported) {
    return (
      <Card style={{ background: stellarColors.white, marginBottom: 24 }}>
        <Alert
          message="Passkeys Not Supported"
          description="Your browser or device doesn't support Passkeys. Please use a modern browser with biometric authentication support."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Title
          level={4}
          style={{ fontFamily: "'Anton', sans-serif", textTransform: 'uppercase', margin: 0 }}
        >
          <KeyOutlined style={{ marginRight: 8 }} />
          Passkey Wallet
        </Title>
      }
      style={{ background: stellarColors.white, marginBottom: 24 }}
    >
      {!isConnected ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text style={{ fontFamily: "'Lora', serif" }}>
            Connect securely using biometric authentication (fingerprint, face ID, or device PIN).
          </Text>
          <Space>
            <Button
              type="primary"
              size="large"
              icon={<WalletOutlined />}
              onClick={createPasskey}
              loading={loading}
              style={{
                background: stellarColors.black,
                color: stellarColors.gold,
                border: 'none',
                height: 50,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {loading ? 'Creating...' : 'Create New Passkey'}
            </Button>
            <Button
              size="large"
              icon={<KeyOutlined />}
              onClick={authenticateWithPasskey}
              loading={loading}
              style={{
                background: stellarColors.gold,
                color: stellarColors.black,
                border: 'none',
                height: 50,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {loading ? 'Authenticating...' : 'Use Existing Passkey'}
            </Button>
          </Space>
        </Space>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="Connected with Passkey"
            description={`Stellar Address: ${address?.substring(0, 12)}...${address?.substring(
              -8,
            )}`}
            type="success"
            showIcon
          />
          <Space>
            <Button
              onClick={disconnectWallet}
              style={{
                background: stellarColors.gold,
                color: stellarColors.black,
                border: 'none',
                fontWeight: 600,
              }}
            >
              Disconnect
            </Button>
          </Space>
        </Space>
      )}
    </Card>
  );
};

export default PasskeyWallet;