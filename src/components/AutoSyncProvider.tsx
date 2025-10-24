import React, { createContext, useContext, useState } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { AlertCircle, CheckCircle2, Wifi, WifiOff } from 'lucide-react';

interface AutoSyncContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  syncIntervalMinutes: number;
  setSyncIntervalMinutes: (minutes: number) => void;
  forceSync: () => Promise<void>;
  forceKeepAlive: () => Promise<void>;
  status: {
    lastSyncTime: Date | null;
    lastKeepAliveTime: Date | null;
    isSyncing: boolean;
    error: string | null;
    successCount: number;
  };
}

const AutoSyncContext = createContext<AutoSyncContextType | undefined>(undefined);

export function useAutoSyncContext() {
  const context = useContext(AutoSyncContext);
  if (!context) {
    throw new Error('useAutoSyncContext must be used within AutoSyncProvider');
  }
  return context;
}

interface AutoSyncProviderProps {
  children: React.ReactNode;
}

/**
 * Provider que gestiona la sincronización automática y keep-alive global
 * 
 * Incluye:
 * - Auto-sincronización de videos cada 30 minutos
 * - Keep-alive cada 5 minutos para evitar que Supabase se pause
 * - Indicador visual del estado de sincronización
 */
export function AutoSyncProvider({ children }: AutoSyncProviderProps) {
  // Configuración por defecto: 
  // - Sincronizar cada 30 minutos
  // - Keep-alive cada 5 minutos
  const [isEnabled, setIsEnabled] = useState(true);
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState(30);
  const keepAliveIntervalMinutes = 5; // Fijo en 5 minutos

  const { status, forceSync, forceKeepAlive } = useAutoSync({
    enabled: isEnabled,
    intervalMinutes: syncIntervalMinutes,
    keepAliveIntervalMinutes
  });

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  const getTimeSince = (date: Date | null) => {
    if (!date) return 'never';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <AutoSyncContext.Provider
      value={{
        isEnabled,
        setIsEnabled,
        syncIntervalMinutes,
        setSyncIntervalMinutes,
        forceSync,
        forceKeepAlive,
        status
      }}
    >
      {children}

      {/* Indicador de estado flotante (solo visible para admins) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">Auto-Sync Status</span>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`px-2 py-1 text-xs rounded ${
                isEnabled 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {isEnabled && (
            <>
              {/* Estado de Keep-Alive */}
              <div className="flex items-center gap-2 mb-2">
                {status.lastKeepAliveTime ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <div className="text-xs">
                  <div className="text-gray-600">Keep-alive</div>
                  <div className="text-gray-500 text-[10px]">
                    {getTimeSince(status.lastKeepAliveTime)}
                  </div>
                </div>
              </div>

              {/* Estado de Sincronización */}
              <div className="flex items-center gap-2 mb-2">
                {status.isSyncing ? (
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                ) : status.error ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                <div className="text-xs">
                  <div className="text-gray-600">
                    {status.isSyncing ? 'Syncing...' : 'Last sync'}
                  </div>
                  <div className="text-gray-500 text-[10px]">
                    {getTimeSince(status.lastSyncTime)}
                  </div>
                </div>
              </div>

              {/* Contador de éxitos */}
              {status.successCount > 0 && (
                <div className="text-xs text-gray-500 mb-2">
                  ✓ {status.successCount} successful syncs
                </div>
              )}

              {/* Error (si existe) */}
              {status.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded mb-2">
                  {status.error}
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={forceSync}
                  disabled={status.isSyncing}
                  className="flex-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Sync Now
                </button>
                <button
                  onClick={forceKeepAlive}
                  className="flex-1 text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                >
                  Ping DB
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AutoSyncContext.Provider>
  );
}
