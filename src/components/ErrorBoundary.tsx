import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100dvh',
            background: '#0f0a1e',
            color: '#f3f0ff',
            padding: '2rem',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '3rem' }}>💀</span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>
            Quest Failed
          </h2>
          <pre
            style={{
              fontSize: '0.7rem',
              color: '#9d8ec4',
              background: '#1a1333',
              padding: '1rem',
              borderRadius: '0.75rem',
              maxWidth: '100%',
              overflowX: 'auto',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack?.split('\n').slice(0, 6).join('\n')}
          </pre>
          <button
            onClick={() => {
              localStorage.removeItem('questlog-storage');
              window.location.reload();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reset & Respawn
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
