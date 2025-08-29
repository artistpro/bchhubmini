import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Wallet, CheckCircle, AlertCircle, QrCode, Smartphone, RefreshCw } from 'lucide-react';

interface BCHQRLoginProps {
  onLoginSuccess?: (address: string) => void;
}

export function BCHQRLogin({ onLoginSuccess }: BCHQRLoginProps) {
  const { signInWithBCH } = useAuth();
  const [qrData, setQrData] = useState<string>('');
  const [loginData, setLoginData] = useState<{
    message: string;
    timestamp: number;
    sessionId: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos

  // Countdown timer
  useEffect(() => {
    if (isWaiting && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsWaiting(false);
      setError('QR code expired. Please generate a new one.');
    }
  }, [isWaiting, timeLeft]);

  // Simulación de autenticación para testing
  useEffect(() => {
    if (isWaiting && loginData) {
      const timer = setTimeout(() => {
        simulateWalletResponse(loginData.sessionId);
      }, 10000); // 10 segundos para testing
      
      return () => clearTimeout(timer);
    }
  }, [isWaiting, loginData]);

  const generateQR = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const sessionId = `session_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      const message = `Login to BCH Content Hub - ${timestamp}`;

      // Crear URI personalizado para BCH wallets
      const qrData = `bitcoincash:?action=login&message=${encodeURIComponent(message)}&session=${sessionId}&app=bchhub`;

      setQrData(qrData);
      setLoginData({ message, timestamp, sessionId });
      setIsWaiting(true);
      setTimeLeft(300); // Reset timer

    } catch (err: any) {
      setError('Failed to generate QR code: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateWalletResponse = async (sessionId: string) => {
    // Simular respuesta de wallet para testing
    const mockAddress = 'bitcoincash:qp63uahgrxged4z5jswyt5dn5v3lzsem6cy4spdc2h';
    const mockSignature = `mock_signature_${sessionId}_${Date.now()}`;
    
    try {
      await handleWalletResponse(mockAddress, mockSignature);
    } catch (err) {
      console.error('Simulated wallet response failed:', err);
    }
  };

  const handleWalletResponse = async (address: string, signature: string) => {
    if (!loginData) return;

    try {
      setIsWaiting(false);
      
      // Usar el sistema de auth real
      await signInWithBCH(address, signature, loginData.message);
      
      setConnectedAddress(address);
      onLoginSuccess?.(address);

    } catch (err: any) {
      setError('Authentication failed: ' + err.message);
      setIsWaiting(false);
    }
  };

  const reset = () => {
    setQrData('');
    setLoginData(null);
    setIsWaiting(false);
    setConnectedAddress(null);
    setError(null);
    setTimeLeft(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generar URL del QR usando servicio externo
  const getQRImageUrl = (data: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
  };

  if (connectedAddress) {
    return (
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
            onClick={reset}
            variant="outline"
            className="w-full"
          >
            Disconnect
          </Button>
        </div>
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

      {!qrData && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-orange-600" />
          </div>

          <h3 className="text-lg font-medium text-gray-900">
            Connect with QR Code
          </h3>

          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            Generate a QR code to authenticate securely with your Bitcoin Cash wallet.
          </p>

          <Button
            onClick={generateQR}
            disabled={isGenerating}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
          >
            {isGenerating ? (
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
            <p>• Zapit • Electron Cash • CashTab • Paytaca</p>
          </div>
        </div>
      )}

      {qrData && isWaiting && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8 text-blue-600" />
          </div>

          <h3 className="text-lg font-medium text-gray-900">
            Scan with Your BCH Wallet
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Open your BCH wallet and scan this QR code to authenticate
          </p>

          <div className="flex justify-center mb-4">
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
              <img 
                src={getQRImageUrl(qrData)} 
                alt="BCH Authentication QR Code"
                className="w-72 h-72"
                crossOrigin="anonymous"
              />
            </div>
          </div>

          <div className="bg-gray-50 border rounded-md p-3 mb-4">
            <p className="text-xs font-mono break-all text-gray-600">
              {qrData}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Time remaining:</span>
              <span className="text-lg font-mono text-blue-900">{formatTime(timeLeft)}</span>
            </div>
            <p className="text-xs text-blue-700">
              QR code expires in {formatTime(timeLeft)} for security
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>For testing:</strong> This QR will automatically authenticate after 10 seconds
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={generateQR}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              New QR
            </Button>

            <Button
              onClick={reset}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
