/* 
// TEMPORALMENTE DESHABILITADO POR ERRORES DE BUILD
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
  // Todo el código original comentado temporalmente...
}
*/

// Componente placeholder temporal
import React from 'react';
import { AlertCircle, QrCode } from 'lucide-react';

interface ReownBCHLoginProps {
  onLoginSuccess?: (address: string) => void;
}

export function ReownBCHLogin({ onLoginSuccess }: ReownBCHLoginProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <QrCode className="h-8 w-8 text-gray-400" />
        </div>

        <h3 className="text-lg font-medium text-gray-900">
          QR Code Login Temporarily Unavailable
        </h3>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <div className="text-left">
              <p className="text-yellow-800 text-sm font-medium">Under Development</p>
              <p className="text-yellow-700 text-sm">
                Please use the Manual Signing method for now.
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 max-w-sm mx-auto">
          We're working on improving the QR code authentication experience.
        </p>
      </div>
    </div>
  );
}
