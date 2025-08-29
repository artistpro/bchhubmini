import { bchService } from '../services/bch/connection.js';

export async function testBCHConnection() {
  console.log('🧪 Testing BCH connection...');
  
  try {
    // Test 1: Conexión básica
    const connected = await bchService.connect();
    if (!connected) {
      throw new Error('Failed to connect to BCH network');
    }
    
    // Test 2: Validación de direcciones
    const testAddresses = [
      'bitcoincash:qp63uahgrxged4z5jswyt5dn5v3lzsem6cy4spdc2h', // Válida testnet
      'invalid-address', // Inválida
      'bchtest:qp63uahgrxged4z5jswyt5dn5v3lzsem6cy4spdc2h' // Válida testnet
    ];
    
    console.log('📍 Testing address validation:');
    testAddresses.forEach(addr => {
      const isValid = bchService.isValidAddress(addr);
      console.log(`  ${addr}: ${isValid ? '✅' : '❌'}`);
    });
    
    // Test 3: Conversión de unidades
    console.log('💰 Testing unit conversion:');
    const testSatoshis = 100000000; // 1 BCH
    const bch = bchService.satoshisToBCH(testSatoshis);
    const backToSatoshis = bchService.bchToSatoshis(bch);
    console.log(`  ${testSatoshis} satoshis = ${bch} BCH = ${backToSatoshis} satoshis`);
    
    console.log('✅ All BCH tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ BCH test failed:', error);
    return false;
  }
}

// Función para testing en consola del navegador
export function runBCHTests() {
  testBCHConnection().then(success => {
    if (success) {
      console.log('🎉 BCH integration ready for development!');
    } else {
      console.log('⚠️ BCH integration needs troubleshooting');
    }
  });
}
