import { useState } from 'react';
import ExifReader from 'exifreader';
import './App.css';

interface MetadataTableProps {
  metadata: Record<string, unknown>;
}

function MetadataTable({ metadata }: MetadataTableProps) {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const TRUNCATE_LENGTH = 120;

  if (!metadata) return null;

  function hasStringProp(obj: unknown, prop: string): obj is { [key: string]: string } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      prop in obj &&
      typeof (obj as Record<string, unknown>)[prop] === 'string'
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '4px', borderBottom: '1px solid #ccc' }}>Property</th>
          <th style={{ textAlign: 'left', padding: '4px', borderBottom: '1px solid #ccc' }}>Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(metadata).map(([key, value]) => {
          let displayValue: string = '';
          if (hasStringProp(value, 'description')) {
            displayValue = value.description;
          } else if (hasStringProp(value, 'value')) {
            displayValue = value.value;
          } else if (typeof value === 'string') {
            displayValue = value;
          } else if (typeof value === 'number' || typeof value === 'boolean') {
            displayValue = String(value);
          } else {
            try {
              displayValue = JSON.stringify(value);
            } catch {
              displayValue = String(value);
            }
          }
          const isLong = displayValue.length > TRUNCATE_LENGTH;
          const isExpanded = expanded[key];
          const shownValue = isLong && !isExpanded ? displayValue.slice(0, TRUNCATE_LENGTH) + '…' : displayValue;
          return (
            <tr key={key}>
              <td style={{ verticalAlign: 'top', padding: '4px', fontWeight: 500 }}>{key}</td>
              <td style={{ verticalAlign: 'top', padding: '4px', wordBreak: 'break-all' }}>
                {shownValue}
                {isLong && (
                  <button
                    style={{ marginLeft: 8, fontSize: '0.9em', padding: '2px 8px' }}
                    onClick={() => {
                      setExpanded(e => ({ ...e, [key]: !e[key] }));
                    }}
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function App() {
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setMetadata(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const tags = await ExifReader.load(arrayBuffer) as Record<string, unknown>;
      setMetadata(tags);
    } catch (err: unknown) {
      let message = 'Failed to read metadata.';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        message += ' ' + (err as { message: string }).message;
      } else if (typeof err === 'string') {
        message += ' ' + err;
      }
      setError(message);
    }
  };

  return (
    <>
      <div className="container">
        <h1>Image Metadata Extractor</h1>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {error && <div className="error">{error}</div>}
        {metadata && (
          <div className="metadata">
            <h2>Extracted Metadata</h2>
            <MetadataTable metadata={metadata} />
          </div>
        )}
      </div>
      <a
        href="https://github.com/anoble2020/exifreader-spa"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 1000,
          background: '#fff',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          border: '1px solid #eaeaea',
          transition: 'box-shadow 0.2s',
        }}
        aria-label="View on GitHub"
      >
        <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </a>
    </>
  );
}

export default App;
