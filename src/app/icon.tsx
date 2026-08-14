import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MY KIT TOOL Official Logo';
export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '128px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Main Icon Box */}
          <div
            style={{
              background: '#2563eb',
              width: '320px',
              height: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '80px',
              position: 'relative',
              boxShadow: '0 40px 100px -20px rgba(37, 99, 235, 0.4)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              width: '180px',
              height: '180px',
            }}>
              <div style={{ display: 'flex', gap: 20, height: '80px' }}>
                <div style={{ width: '80px', height: '80px', border: '22px solid rgba(255, 255, 255, 0.6)', borderRadius: '15px' }} />
                <div style={{ width: '80px', height: '80px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '15px' }} />
              </div>
              <div style={{ display: 'flex', gap: 20, height: '80px' }}>
                 <div style={{ width: '80px', height: '80px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '15px' }} />
                 <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '15px' }} />
              </div>
            </div>
            {/* Glass Effect Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }} />
          </div>
          
          {/* Label Below Icon */}
          <span style={{ 
            fontSize: '90px', 
            fontWeight: 900, 
            color: '#2563eb', 
            letterSpacing: '-5px',
            marginTop: '20px',
            textTransform: 'uppercase'
          }}>MY KIT</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
