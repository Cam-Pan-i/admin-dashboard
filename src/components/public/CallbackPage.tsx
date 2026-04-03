import React, { useEffect, useState } from 'react';
import '../../public.css';

export const CallbackPage: React.FC = () => {
  const [heading, setHeading] = useState('Synchronizing');
  const [status, setStatus] = useState('Establishing secure link with your Discord identity.');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setHeading('DENIED');
      setStatus('Authorization was revoked. Process terminated.');
      setIsError(true);
      return;
    }

    if (code) {
      setHeading('VALIDATING');
      setStatus('Finalizing secure connection to the central registry...');
      
      const validate = async () => {
        try {
          const redirectUri = window.location.origin + '/callback';
          const response = await fetch(`/api/callback?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`);
          const data = await response.json();
          
          if (data.status === 'success') {
            setHeading('SUCCESS');
            setStatus('Identity verified. Redirecting to terminal...');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            throw new Error(data.message || 'Verification failed');
          }
        } catch (err: any) {
          setHeading('ERROR');
          setStatus(err.message || 'A protocol error occurred during synchronization.');
          setIsError(true);
        }
      };
      
      validate();
      return;
    }

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    if (accessToken) {
      setHeading('PROCESSING');
      setStatus('Analyzing session token for secure entry...');
      setTimeout(() => {
        window.location.href = '/api/callback?access_token=' + encodeURIComponent(accessToken);
      }, 1600);
      return;
    }

    setHeading('EXPIRED');
    setStatus('No active session token found. Please restart authentication.');
    setIsError(true);
  }, []);

  return (
    <div className="public-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', overflow: 'hidden' }}>
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <div className="card" style={{ position: 'relative', zIndex: 10, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '40px', padding: '64px 40px', width: '100%', maxWidth: '400px', textAlign: 'center', backdropFilter: 'blur(24px)', boxShadow: '0 32px 128px rgba(0,0,0,0.6)', animation: 'entry 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="loader-wrap" style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 32px' }}>
          <div className="orbit" style={{ position: 'absolute', inset: 0, border: '2px solid var(--border)', borderRadius: '50%', animation: 'spin 3s linear infinite' }}>
            <div className="orbit-dot" style={{ position: 'absolute', top: '-4px', left: '50%', width: '8px', height: '8px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 16px #fff' }}></div>
          </div>
          <svg className="discord-logo" viewBox="0 0 24 24" fill="currentColor" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', color: '#fff' }}>
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.01.043.02.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.974 0c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.946-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
          </svg>
        </div>

        <h2 className="heading" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '8px', color: isError ? '#ef4444' : 'inherit' }}>{heading}</h2>
        <p className="status" style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.6, fontWeight: 500 }}>{status}</p>

        <div className="footer" style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div className="pulse" style={{ width: '8px', height: '8px', background: isError ? '#ef4444' : '#fff', borderRadius: '50%', boxShadow: isError ? '0 0 12px #ef4444' : '0 0 12px #fff', animation: 'pulse 2s infinite' }}></div>
          Secure Protocol Active
        </div>
      </div>
    </div>
  );
};
