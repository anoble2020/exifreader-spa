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
  );
}

export default App;
