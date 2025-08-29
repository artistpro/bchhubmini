import { ElectrumNetworkProvider } from 'cashscript';
import { BCH_CONFIG } from '../../config/bch.js';

export class BCHService {
  constructor() {
    this.provider = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.provider = new ElectrumNetworkProvider(BCH_CONFIG.network);
      this.isConnected = true;
      console.log(`✅ Connected to BCH ${BCH_CONFIG.network}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to BCH network:', error);
      this.isConnected = false;
      return false;
    }
  }

  async getBalance(address) {
    if (!this.provider) {
      const connected = await this.connect();
      if (!connected) return 0;
    }
    
    try {
      const utxos = await this.provider.getUtxos(address);
      const satoshis = utxos.reduce((total, utxo) => total + utxo.satoshis, 0);
      return satoshis / 100000000; // Convertir a BCH
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  async getTransactionHistory(address) {
    if (!this.provider) {
      const connected = await this.connect();
      if (!connected) return [];
    }

    try {
      const history = await this.provider.getHistory(address);
      return history;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  // Función para verificar si una dirección es válida
  isValidAddress(address) {
    try {
      // Validación básica de formato BCH
      return address.startsWith('bitcoincash:') || 
             address.startsWith('bchtest:') ||
             (address.length >= 26 && address.length <= 35);
    } catch (error) {
      return false;
    }
  }

  // Función para convertir satoshis a BCH
  satoshisToBCH(satoshis) {
    return satoshis / 100000000;
  }

  // Función para convertir BCH a satoshis
  bchToSatoshis(bch) {
    return Math.floor(bch * 100000000);
  }
}

// Instancia singleton para usar en toda la app
export const bchService = new BCHService();
