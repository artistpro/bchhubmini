import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AutoSyncConfig {
  enabled: boolean;
  intervalMinutes: number; // Intervalo de sincronización en minutos
  keepAliveIntervalMinutes: number; // Intervalo de keep-alive en minutos
}

interface SyncStatus {
  lastSyncTime: Date | null;
  lastKeepAliveTime: Date | null;
  isSyncing: boolean;
  error: string | null;
  successCount: number;
}

/**
 * Hook personalizado para auto-sincronización y keep-alive de Supabase
 * 
 * Características:
 * 1. Sincroniza videos automáticamente cada X minutos
 * 2. Mantiene Supabase activo con pings periódicos (evita pausa por inactividad)
 * 3. Maneja errores y reintentos
 */
export function useAutoSync(config: AutoSyncConfig) {
  const [status, setStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    lastKeepAliveTime: null,
    isSyncing: false,
    error: null,
    successCount: 0
  });

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep-alive: Hace un ping simple a Supabase para mantenerlo activo
  const performKeepAlive = async () => {
    try {
      console.log('🏓 Keep-alive ping to Supabase...');
      
      // Hacer una consulta ligera para mantener la conexión activa
      const { error } = await supabase
        .from('youtube_channels')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Keep-alive failed:', error);
        setStatus(prev => ({ 
          ...prev, 
          error: `Keep-alive failed: ${error.message}` 
        }));
      } else {
        console.log('✅ Keep-alive successful');
        setStatus(prev => ({ 
          ...prev, 
          lastKeepAliveTime: new Date(),
          error: null 
        }));
      }
    } catch (err) {
      console.error('Keep-alive error:', err);
      setStatus(prev => ({ 
        ...prev, 
        error: `Keep-alive error: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }));
    }
  };

  // Auto-sync: Sincroniza videos automáticamente
  const performAutoSync = async () => {
    // Evitar múltiples sincronizaciones simultáneas
    if (status.isSyncing) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    try {
      console.log('🔄 Starting auto-sync...');
      
      setStatus(prev => ({ 
        ...prev, 
        isSyncing: true,
        error: null 
      }));

      const { data, error } = await supabase.functions.invoke('youtube-video-sync');

      if (error) {
        throw error;
      }

      console.log('✅ Auto-sync completed:', data);
      
      setStatus(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        isSyncing: false,
        error: null,
        successCount: prev.successCount + 1
      }));

    } catch (err) {
      console.error('❌ Auto-sync error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: `Sync failed: ${errorMessage}`
      }));

      // Si Supabase está pausado, intentar reactivarlo
      if (errorMessage.includes('paused') || errorMessage.includes('inactive')) {
        console.log('⚠️ Supabase appears to be paused. Attempting keep-alive...');
        await performKeepAlive();
      }
    }
  };

  // Configurar intervalos cuando el componente se monta
  useEffect(() => {
    if (!config.enabled) {
      console.log('Auto-sync disabled');
      return;
    }

    console.log('🚀 Auto-sync enabled', {
      syncInterval: `${config.intervalMinutes} minutes`,
      keepAliveInterval: `${config.keepAliveIntervalMinutes} minutes`
    });

    // Ejecutar keep-alive inmediatamente al montar
    performKeepAlive();

    // Configurar keep-alive periódico
    keepAliveIntervalRef.current = setInterval(() => {
      performKeepAlive();
    }, config.keepAliveIntervalMinutes * 60 * 1000);

    // Ejecutar primera sincronización después de 1 minuto
    setTimeout(() => {
      performAutoSync();
    }, 60 * 1000);

    // Configurar sincronización periódica
    syncIntervalRef.current = setInterval(() => {
      performAutoSync();
    }, config.intervalMinutes * 60 * 1000);

    // Cleanup al desmontar
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
    };
  }, [config.enabled, config.intervalMinutes, config.keepAliveIntervalMinutes]);

  // Función para forzar sincronización manual
  const forceSync = async () => {
    await performAutoSync();
  };

  // Función para forzar keep-alive manual
  const forceKeepAlive = async () => {
    await performKeepAlive();
  };

  return {
    status,
    forceSync,
    forceKeepAlive
  };
}
