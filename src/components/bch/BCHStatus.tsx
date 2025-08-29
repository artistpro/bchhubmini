import React, { useState, useEffect } from 'react';

const BCHStatus: React.FC = () => {
  const [status, setStatus] = useState({
    connected: false,
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    // Por ahora solo mostramos que el componente se carga
    setStatus({
      connected: false,
      loading: false,
      error: null
    });
  }, []);

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold mb-2 text-blue-800">
        🧪 BCH Integration Test
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="text-blue-600">
            {status.loading ? '🔄 Loading...' : '📡 Ready for BCH'}
          </span>
        </div>
        
        <div className="text-sm text-gray-500">
          Component loaded successfully! Next: Add BCH connection.
        </div>
      </div>
    </div>
  );
};

export default BCHStatus;
