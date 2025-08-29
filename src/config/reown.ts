export const REOWN_CONFIG = {
  projectId: '9857f5aa1afbbcb193c7abc909dc823a',
  metadata: {
    name: 'BCH Content Hub',
    description: 'Bitcoin Cash content platform with wallet authentication',
    url: 'http://localhost:5173',
    icons: ['https://walletconnect.com/walletconnect-logo.png']
  }
};

// Bitcoin Cash network configuration
export const BCH_NETWORK = {
  chainId: 'bch:bitcoincash',
  name: 'Bitcoin Cash',
  currency: 'BCH',
  explorerUrl: 'https://blockchair.com/bitcoin-cash',
  rpcUrl: 'https://rest.kingbch.com/v2/'
};

export const BCH_TESTNET = {
  chainId: 'bch:bchtest', 
  name: 'Bitcoin Cash Testnet',
  currency: 'tBCH',
  explorerUrl: 'https://tbch.blockchair.com',
  rpcUrl: 'https://rest.kingbch.com/v2/'
};
