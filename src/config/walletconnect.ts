export const WALLETCONNECT_CONFIG = {
  projectId: '9857f5aa1afbbcb193c7abc909dc823a',
  metadata: {
    name: 'BCH Content Hub',
    description: 'Bitcoin Cash content platform with wallet authentication',
    url: 'http://localhost:5173',
    icons: ['https://walletconnect.com/walletconnect-logo.png']
  },
  relayUrl: 'wss://relay.walletconnect.com'
};

// Bitcoin Cash chain configuration
export const BCH_CHAIN_CONFIG = {
  chainId: 'bch:bitcoincash',
  name: 'Bitcoin Cash',
  rpc: ['https://rest.kingbch.com'],
  slip44: 145,
  testnet: false
};

export const BCH_TESTNET_CONFIG = {
  chainId: 'bch:bchtest',
  name: 'Bitcoin Cash Testnet',
  rpc: ['https://rest.kingbch.com'],
  slip44: 1,
  testnet: true
};
