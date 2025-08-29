import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Wallet, CheckCircle, AlertCircle, QrCode, Smartphone } from 'lucide-react';
import { createAppKit } from '@reown/appkit';
import { REOWN_CONFIG, BCH_NETWORK } from '@/config/reown';

interface ReownBCHLoginProps {
  onLoginSuccess?: (address: string) => void;
}

export function ReownBCHLogin({ onLoginSuccess }: ReownBCHLoginProps) {
  const { signInWithBCH } = useAuth();
  const [appKit, setAppKit] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrUri, setQrUri] = useState<string>('');

  // Inicializar Reown AppKit
  useEffect(() => {
    initializeReown();
  }, []);

  const initializeReown = async () => {
    try {
      setError(null);

      // Crear AppKit instance
      const modal = createAppKit({
        projectId: REOWN_CONFIG.projectId,
        metadata: REOWN_CONFIG.metadata,
        features: {
          analytics: false, // Deshabilitar analytics para evitar conflictos
        },
        themeMode: 'light',
        themeVariables: {
          '--w3m-accent': '#f39c12'
        }
      });

      setAppKit(modal);

      // Escuchar eventos de conexión
      modal.subscribeEvents((event: any) => {
        console.log('Reown event:', event);
        
        if (event.type === 'CONNECT_SUCCESS') {
          handleConnectionSuccess(event.address);
        } else if (event.type === 'DISCONNECT') {
          handleDisconnection();
        }
      });

    } catch (err: any) {
      console.error('Failed to initialize Reown:', err);
      setError('Failed to initialize wallet connection');
    }
  };

  const handleConnectionSuccess = async (address: string) => {
    try {
      setConnectedAddress(address);
      setIsConnected(true);
      setIsConnecting(false);

      // Generar mensaje para autenticación
      const timestamp = Date.now();
      const message = `Login to BCH Content Hub - ${timestamp}`;
      
      // Simular firma para testing (en producción pedirías firma real)
      const mockSignature = `reown_signature_${timestamp}`;

      // Usar el sistema de auth
      await signInWithBCH(address, mockSignature, message);
      
      onLoginSuccess?.(address);

    } catch (err: any) {
      setError('Authentication failed: ' + err.message);
      setIsConnecting(false);
    }
  };

  const handleDisconnection = () => {
    setIsConnected(false);
    setConnectedAddress(null);
    setQrUri('');
  };

  const connectWallet = async () => {
    if (!appKit) {
      setError('Reown not initialized');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Abrir modal de conexión
      appKit.open();

    } catch (err: any) {
      console.error('Connection failed:', err);
      setError('Failed to connect wallet: ' + err.message);
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (appKit && isConnected) {
      try {
        await appKit.disconnect();
      } catch (err) {
        console.error('Disconnect error:', err);
      }
    }
    handleDisconnection();
  };

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

      {!isConnected && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-orange-600" />
          </div>

          <h3 className="text-lg font-medium text-gray-900">
            Connect with Reown (WalletConnect v2)
          </h3>

          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            Scan the QR code or use deep link to connect your Bitcoin Cash wallet securely.
          </p>

          <Button
            onClick={connectWallet}
            disabled={isConnecting || !appKit}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
          >
            {isConnecting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-5 w-5" />
                Open Wallet Connection
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Compatible wallets:</p>
            <p>• Paytaca • Zapit • CashTab • Electron Cash</p>
            <p>• Any wallet supporting WalletConnect v2</p>
          </div>

          {!appKit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800 text-sm">
                Initializing Reown AppKit...
              </p>
            </div>
          )}
        </div>
      )}

      {isConnected && connectedAddress && (
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
