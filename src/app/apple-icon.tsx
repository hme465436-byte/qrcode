import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MY KIT TOOL Apple Icon';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Compact Icon Box */}
          <div
            style={{
              background: '#2563eb',
              width: '110px',
              height: '110px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '24px',
              position: 'relative',
              boxShadow: '0 15px 40px -10px rgba(37, 99, 235, 0.4)'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              width: '60px',
              height: '60px',
            }}>
              <div style={{ display: 'flex', gap: 8, height: '26px' }}>
                <div style={{ width: '26px', height: '26px', border: '6px solid rgba(255, 255, 255, 0.6)', borderRadius: '4px' }} />
                <div style={{ width: '26px', height: '26px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, height: '26px' }}>
                 <div style={{ width: '26px', height: '26px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '4px' }} />
                 <div style={{ width: '26px', height: '26px', background: 'white', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
          
          {/* Label Below */}
          <span style={{ 
            fontSize: '18px', 
            fontWeight: 900, 
            color: '#2563eb', 
            letterSpacing: '0px',
            marginTop: '8px',
            textTransform: 'uppercase'
          }}>MY KIT TOOL</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
