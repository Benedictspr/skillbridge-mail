import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React Error Boundary Caught]', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#07080D',
          color: '#F9FAFB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            backgroundColor: '#0D0E16',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#EF4444' }}>
              Sendaat Mail - Application Recovery
            </h2>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px', lineHeight: '1.6' }}>
              The application encountered a browser cache error. Click below to clear state cache and reload cleanly.
            </p>
            <div style={{
              backgroundColor: '#1E1E2E',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#F87171',
              marginBottom: '20px',
              textAlign: 'left',
              overflowX: 'auto'
            }}>
              {this.state.error?.toString() || 'Unknown error'}
            </div>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '13px',
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reset Cache & Reload Web App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
