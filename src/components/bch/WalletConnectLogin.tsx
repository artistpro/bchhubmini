import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Wallet, CheckCircle, AlertCircle, QrCode, Smartphone } from 'lucide-react';
import { SignClient } from '@walletconnect/sign-client';
import { WALLETCONNECT_CONFIG, BCH_CHAIN_CONFIG } from '@/config/walletconnect';

interface WalletConnectLoginProps {
  onLoginSuccess?: (address: string) => void;
}

export function WalletConnectLogin({ onLoginSuccess }: WalletConnectLoginProps) {
  const { signInWithBCH } = useAuth();
  const [client, setClient] = useState<SignClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrUri, setQrUri] = useState('');
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Inicializar WalletConnect
  useEffect(() => {
    initializeWalletConnect();
  }, []);

  const initializeWalletConnect = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      const signClient = await SignClient.init({
        projectId: WALLETCONNECT_CONFIG.projectId,
        metadata: WALLETCONNECT_CONFIG.metadata,
        relayUrl: WALLETCONNECT_CONFIG.relayUrl
      });

      setClient(signClient);

      // Escuchar eventos de conexión
      signClient.on('session_proposal', handleSessionProposal);
      signClient.on('session_event', handleSessionEvent);
      signClient.on('session_update', handleSessionUpdate);
      signClient.on('session_delete', handleSessionDelete);

    } catch (err: any) {
      console.error('Failed to initialize WalletConnect:', err);
      setError('Failed to initialize wallet connection');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSessionProposal = async (proposal: any) => {
    try {
      console.log('Session proposal received:', proposal);
      // Aquí manejarías la propuesta de sesión
    } catch (err) {
      console.error('Error handling session proposal:', err);
    }
  };

  const handleSessionEvent = (event: any) => {
    console.log('Session event:', event);
  };

  const handleSessionUpdate = (update: any) => {
    console.log('Session update:', update);
  };

  const handleSessionDelete = () => {
    console.log('Session deleted');
    setConnectedAddress(null);
    setQrUri('');
  };

  const connectWallet = async () => {
    if (!client) {
      setError('WalletConnect not initialized');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const { uri, approval } = await client.connect({
        requiredNamespaces: {
          bch: {
            methods: ['personal_sign'],
            chains: [BCH_CHAIN_CONFIG.chainId],
            events: ['accountsChanged', 'chainChanged']
          }
        }
      });

      if (uri) {
        setQrUri(uri);
        console.log('QR URI generated:', uri);
      }

      // Esperar aprobación
      const session = await approval();
      console.log('Session approved:', session);

      // Obtener dirección de la sesión
      const accounts = session.namespaces.bch?.accounts || [];
      if (accounts.length > 0) {
        const address = accounts[0].split(':')[2]; // Extraer dirección del formato chain:network:address
        await handleSuccessfulConnection(address);
      }

    } catch (err: any) {
      console.error('Connection failed:', err);
      setError('Failed to connect wallet: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSuccessfulConnection = async (address: string) => {
    try {
      // Generar mensaje para firmar
      const message = `Login to BCH Content Hub - ${Date.now()}`;
      
      // Por ahora simulamos la firma exitosa
      // En el futuro aquí pedirías la firma real via WalletConnect
      const mockSignature = 'walletconnect-signature-' + Date.now();

      // Usar el sistema de auth
      await signInWithBCH(address, mockSignature, message);
      
      setConnectedAddress(address);
      onLoginSuccess?.(address);

    } catch (err: any) {
      setError('Authentication failed: ' + err.message);
    }
  };

  const disconnect = async () => {
    if (client && connectedAddress) {
      try {
        const sessions = client.session.getAll();
        if (sessions.length > 0) {
          await client.disconnect({
            topic: sessions[0].topic,
            reason: {
              code: 6000,
              message: 'User disconnected'
            }
          });
        }
      } catch (err) {
        console.error('Disconnect error:', err);
      }
    }
    
    setConnectedAddress(null);
    setQrUri('');
  };

  const generateQRCode = (uri: string) => {
    // Simple QR code using a service (en producción usarías una librería dedicada)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
    return qrUrl;
  };

  if (isInitializing) {
    return (
      <div className="text-center space-y-4">
        <LoadingSpinner className="mx-auto" />
        <p className="text-gray-600">Initializing wallet connection...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!connectedAddress && !qrUri && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-orange-600" />
          </div>

          <h3 className="text-lg font-medium text-gray-900">
            Connect with QR Code
          </h3>

          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            Scan the QR code with your Bitcoin Cash wallet to authenticate securely.
          </p>

          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
          >
            {isConnecting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Generating QR Code...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-5 w-5" />
                Generate QR Code
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Compatible wallets:</p>
            <p>• Zapit • Electron Cash • CashTab</p>
          </div>
        </div>
      )}

      {qrUri && !connectedAddress && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8 text-blue-600" />
          </div>

          <h3 className="text-lg font-medium text-gray-900">
            Scan QR Code
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Open your BCH wallet and scan this QR code to connect
          </p>

          <div className="flex justify-center">
            <img 
              src={generateQRCode(qrUri)} 
              alt="WalletConnect QR Code"
              className="w-48 h-48 border rounded-lg"
            />
          </div>

          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-xs font-mono break-all text-gray-600">
              {qrUri.substring(0, 50)}...
            </p>
          </div>

          <Button
            onClick={() => {
              setQrUri('');
              setIsConnecting(false);
            }}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      )}

      {connectedAddress && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h3 className="text-lg font-medium text-gray-900">
            Wallet Connected!
          </h3>

          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800 mb-2">Connected Address:</p>
            <p className="text-xs font-mono bg-white p-2 rounded border break-all">
              {connectedAddress}
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => onLoginSuccess?.(connectedAddress)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              Continue to App
            </Button>

            <Button
              onClick={disconnect}
              variant="outline"
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
