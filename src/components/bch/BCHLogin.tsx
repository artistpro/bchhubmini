import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Wallet, CheckCircle, AlertCircle, Copy, Key, FileText, QrCode } from 'lucide-react';
import { ReownBCHLogin } from './ReownBCHLogin';

interface BCHLoginProps {
  onLoginSuccess?: (address: string) => void;
}

export function BCHLogin({ onLoginSuccess }: BCHLoginProps) {
  const { signInWithBCH } = useAuth();
  const [step, setStep] = useState<'address' | 'sign' | 'verify' | 'success'>('address');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [loginMode, setLoginMode] = useState<'manual' | 'qr'>('manual');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState('');
  const [isWaitingForWallet, setIsWaitingForWallet] = useState(false);

  // Validar dirección BCH
  const isValidBCHAddress = (addr: string) => {
    const bchRegex = /^(bitcoincash:|bchtest:)?[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}$/;
    const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    return bchRegex.test(addr) || legacyRegex.test(addr);
  };

  const handleAddressSubmit = () => {
    setError(null);

    if (!address.trim()) {
      setError('Please enter your BCH address');
      return;
    }

    if (!isValidBCHAddress(address.trim())) {
      setError('Please enter a valid Bitcoin Cash address');
      return;
    }

    // Generar mensaje único para firmar
    const timestamp = Date.now();
    const loginMessage = `Login to BCH Content Hub - ${timestamp}`;

    setMessage(loginMessage);
    setStep('sign');
  };

  const generateQR = () => {
    setError(null);
    const timestamp = Date.now();
    const sessionId = `session_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    const loginMessage = `Login to BCH Content Hub - ${timestamp}`;

    // Crear URI para BCH wallets
    const qrDataString = `bchhub://auth?action=login&message=${encodeURIComponent(loginMessage)}&session=${sessionId}&timestamp=${timestamp}&domain=${window.location.hostname}`;

    setQrData(qrDataString);
    setMessage(loginMessage);
    setIsWaitingForWallet(true);

    // Simular conexión de wallet después de 30 segundos para testing
    setTimeout(() => {
      simulateQRResponse(sessionId, loginMessage);
    }, 30000);
  };

  const simulateQRResponse = async (sessionId: string, message: string) => {
    const mockAddress = 'bitcoincash:qp63uahgrxged4z5jswyt5dn5v3lzsem6cy4spdc2h';
    const mockSignature = `qr_signature_${sessionId}_${Date.now()}`;

    try {
      await signInWithBCH(mockAddress, mockSignature, message);
      setStep('success');
      setAddress(mockAddress);
      setIsWaitingForWallet(false);

      setTimeout(() => {
        onLoginSuccess?.(mockAddress);
      }, 1500);
    } catch (err: any) {
      setError('QR Authentication failed: ' + err.message);
      setIsWaitingForWallet(false);
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleSignatureSubmit = async () => {
    setError(null);

    if (!signature.trim()) {
      setError('Please enter the signature from your wallet');
      return;
    }

    setIsVerifying(true);

    try {
      // Por ahora, aceptamos cualquier firma para testing
      if (signature.length < 10) {
        throw new Error('Signature appears to be too short');
      }

      // Usar el sistema de auth real
      const result = await signInWithBCH(address, signature, message);

      setStep('success');
      setTimeout(() => {
        onLoginSuccess?.(address);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to verify signature');
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setStep('address');
    setAddress('');
    setMessage('');
    setSignature('');
    setError(null);
    setQrData('');
    setIsWaitingForWallet(false);
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

      {step === 'address' && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-orange-600" />
          </div>

          {/* Mode selector */}
          <div className="mb-4">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setLoginMode('manual')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'manual'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Key className="inline-block w-4 h-4 mr-2" />
                Manual Signing
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('qr')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'qr'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <QrCode className="inline-block w-4 h-4 mr-2" />
                QR Code
              </button>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900">
            {loginMode === 'manual' ? 'Enter Your BCH Address' : 'Generate QR Code'}
          </h3>

          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            {loginMode === 'manual'
              ? 'Enter your Bitcoin Cash address to start the authentication process.'
              : 'Generate a QR code to scan with your BCH wallet for instant authentication.'
            }
          </p>

          {loginMode === 'manual' ? (
            <div className="space-y-4">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="bitcoincash:qp... or legacy address"
                className="w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
              />

              <Button
                onClick={handleAddressSubmit}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
              >
                <Key className="mr-2 h-5 w-5" />
                Continue to Sign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {!qrData ? (
                <Button
                  onClick={generateQR}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Generate QR Code
                </Button>
              ) : (
                <ReownBCHLogin onLoginSuccess={onLoginSuccess} />
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>Supported address formats:</p>
            <p>• CashAddr (bitcoincash:q...)</p>
            <p>• Legacy (1... or 3...)</p>
          </div>
        </div>
      )}

      {step === 'sign' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Sign Message with Your Wallet
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Copy this message and sign it with your BCH wallet (Electron Cash, CashTab, etc.)
            </p>
          </div>

          <div className="bg-gray-50 border rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Message to sign:</span>
              <Button
                onClick={copyMessage}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <p className="font-mono text-sm bg-white p-2 rounded border break-all">
              {message}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-blue-900 mb-2">How to sign:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Electron Cash:</strong> Tools → Sign/Verify Message</li>
              <li>• <strong>CashTab:</strong> Settings → Sign & Verify</li>
              <li>• <strong>Bitcoin.com Wallet:</strong> Tools → Sign Message</li>
            </ul>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Paste signature here:
            </label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Paste the signature from your wallet here..."
              className="w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
              rows={3}
            />

            <div className="flex space-x-3">
              <Button
                onClick={handleSignatureSubmit}
                disabled={isVerifying}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3"
              >
                {isVerifying ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Verify & Login
                  </>
                )}
              </Button>

              <Button
                onClick={reset}
                variant="outline"
                className="px-4"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h3 className="text-lg font-medium text-gray-900">
            Authentication Successful!
          </h3>

          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800 mb-2">Authenticated Address:</p>
            <p className="text-xs font-mono bg-white p-2 rounded border break-all">
              {address}
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Redirecting to dashboard...
          </p>
        </div>
      )}
    </div>
  );
}
