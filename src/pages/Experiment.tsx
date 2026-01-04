import React, { useState } from 'react';
import { AsgardeoSPAClient } from '@asgardeo/auth-react';
import { HttpRequestConfig } from '@asgardeo/auth-spa';
import { AxiosResponse } from 'axios';

export const HttpRequestExample: React.FC = () => {
  const [response, setResponse] = useState<
    AxiosResponse<unknown, unknown> | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const makeRequest = async () => {
    const auth = AsgardeoSPAClient.getInstance();

    if (!auth) {
      setError('Authentication client not initialized');
      return;
    }

    const requestConfig: HttpRequestConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/scim+json',
      },
      method: 'GET' as const,
      url: 'http://localhost:5173/api/v1/gebruikers/zelf',
    };

    setLoading(true);
    setError(null);

    try {
      auth.refreshAccessToken()
        .then((response: unknown) => {
          console.log(`response`, response);
        })
        .catch((error: unknown) => {
          console.error(error);
        });

      const result = await auth.httpRequest(requestConfig);
      setResponse(result);
      console.log(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>HTTP Request Test</h2>
      <button onClick={makeRequest} disabled={loading}>
        {loading ? 'Loading...' : 'Make Request'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: '10px' }}>
          <strong>Response:</strong>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              marginTop: '5px',
            }}
          >
            {JSON.stringify(response, null, 2) as string}
          </pre>
        </div>
      )}
    </div>
  );
};
