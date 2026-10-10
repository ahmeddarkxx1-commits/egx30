import React from 'react';
import { ArrowLeft } from 'lucide-react';
import DisclaimerModal from './DisclaimerModal';

export default function DisclaimerView({ onBack }) {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 12px',
      direction: 'rtl'
    }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            alignSelf: 'flex-start',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#38bdf8',
            padding: '8px 16px',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={16} />
          <span>العودة للرئيسية</span>
        </button>
      )}

      <DisclaimerModal isModal={false} onAccept={onBack} />
    </div>
  );
}
