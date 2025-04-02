'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface DataConnection {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  lastSynced?: string;
  dataSources: string[];
}

export default function DataPage() {
  const { user } = useUser();
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch('/api/data/connections');
        if (!response.ok) {
          throw new Error('Failed to fetch data connections');
        }
        const data = await response.json();
        
        const processedData = data.map((conn: any) => ({
          ...conn,
          dataSources: Array.isArray(conn.dataSources) 
            ? conn.dataSources.map((source: any) => 
                typeof source === 'string' ? source : source.name || JSON.stringify(source)
              )
            : []
        }));
        
        setConnections(processedData);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load data connections');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const handleConnectionAction = async (connectionId: string, action: 'connect' | 'disconnect' | 'refresh') => {
    try {
      const response = await fetch(`/api/data/connections/${connectionId}/${action}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} connection`);
      }
      
      const updatedResponse = await fetch('/api/data/connections');
      if (!updatedResponse.ok) {
        throw new Error('Failed to fetch updated connections');
      }
      const updatedData = await updatedResponse.json();
      
      const processedData = updatedData.map((conn: any) => ({
        ...conn,
        dataSources: Array.isArray(conn.dataSources) 
          ? conn.dataSources.map((source: any) => 
              typeof source === 'string' ? source : source.name || JSON.stringify(source)
            )
          : []
      }));
      
      setConnections(processedData);
    } catch (error) {
      console.error('Error:', error);
      setError(`Failed to ${action} connection`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Data Connections</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your data sources and connections
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{connection.name}</h3>
                <p className="text-sm text-gray-500">{connection.provider}</p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  connection.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : connection.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {connection.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Data Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {connection.dataSources.map((source, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              {connection.lastSynced && (
                <div>
                  <p className="text-sm text-gray-500">
                    Last synced: {new Date(connection.lastSynced).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                {connection.status === 'active' ? (
                  <>
                    <button
                      onClick={() => handleConnectionAction(connection.id, 'refresh')}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => handleConnectionAction(connection.id, 'disconnect')}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnectionAction(connection.id, 'connect')}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 