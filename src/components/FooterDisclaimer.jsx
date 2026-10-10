import React, { useState } from 'react';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import DisclaimerModal from './DisclaimerModal';

export default function FooterDisclaimer({ onOpenDisclaimer }) {
  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => {
    if (onOpenDisclaimer) {
      onOpenDisclaimer();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <footer style={{
        marginTop: '40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(11, 14, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '20px 16px',
        borderRadius: '16px',
        direction: 'rtl',
        fontFamily: 'Cairo, Tajawal, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
            <ShieldAlert size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>
              <strong style={{ color: '#f59e0b' }}>إخلاء مسؤولية قاطعة:</strong> المنصة أداة برمجية تعليمية وتحليلية بحتة وليست وسيطاً مالياً ولا تقدم نصائح استثمارية ملزمة، والمسؤولية الكاملة تقع على عاتق المستخدم وحده.
            </p>
          </div>

          <button
            onClick={handleOpen}
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#f59e0b',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>قراءة النص الكامل وإخلاء المسؤولية 📋</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </footer>

      {showModal && (
        <DisclaimerModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAccept={() => setShowModal(false)}
        />
      )}
    </>
  );
}
