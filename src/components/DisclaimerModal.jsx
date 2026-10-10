import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Scale, X, ArrowLeft, Info, HelpCircle } from 'lucide-react';

export default function DisclaimerModal({ isOpen, onClose, onAccept, isModal = true }) {
  const [agreed, setAgreed] = useState(false);

  if (isModal && !isOpen) return null;

  const handleConfirm = () => {
    if (onAccept) onAccept();
    if (onClose) onClose();
  };

  const content = (
    <div style={{
      background: 'linear-gradient(180deg, #0d121c 0%, #07090e 100%)',
      color: '#e2e8f0',
      borderRadius: '20px',
      border: '1px solid rgba(245, 158, 11, 0.4)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
      padding: '28px',
      maxWidth: '780px',
      width: '100%',
      direction: 'rtl',
      fontFamily: 'Cairo, Tajawal, sans-serif',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#f59e0b',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
              إخلاء مسؤولية قاطعة ورسمية (Disclaimer)
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              شروط وأحكام استخدام المنصة وتحذير المخاطر المالية
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Main Core Highlighted Statement */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(239, 68, 68, 0.08) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '14px',
        padding: '18px 20px',
        marginBottom: '20px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start'
      }}>
        <AlertTriangle size={28} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#fef08a', fontWeight: '700' }}>
          «المنصة أداة برمجية تعليمية وتحليلية بحتة وليست وسيطاً مالياً ولا تقدم نصائح استثمارية ملزمة، والمسؤولية الكاملة عن أي قرارات تداول أو استثمار تقع على عاتق المستخدم وحده.»
        </div>
      </div>

      {/* Structured Legal Terms Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '14px',
        maxHeight: '380px',
        overflowY: 'auto',
        paddingLeft: '6px',
        marginBottom: '22px'
      }}>
        
        {/* Item 1 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          padding: '14px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px' }}>
            <Scale size={18} />
            <span>1. أداة تحليلية وبرمجية (Software Tool Only)</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8', lineHeight: '1.6' }}>
            هذه المنصة عبارة عن نظام برمجي مستقل يقوم بمعالجة البيانات وحساب المؤشرات الفنية والهيكلية (SMC / RSI / MACD). المنصة <strong>ليست شركة وساطة مالية</strong>، ولا تتلقى أموالاً أو وديعة ولا تنفذ أوامر تداول حقيقية باسم المستخدم في أي سوق.
          </p>
        </div>

        {/* Item 2 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          padding: '14px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px' }}>
            <Info size={18} />
            <span>2. عدم تقديم استشارات مالية (No Financial Advice)</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8', lineHeight: '1.6' }}>
            جميع التنبؤات والتحليلات وإشارات الذكاء الاصطناعي الصادرة عن المنصة مخصصة فقط <strong>لأغراض البحث والأغراض التعليمية</strong>. لا تعتبر المحتويات بأي شكل من الأشكال استشارة مالية، أو توصية استثمارية لشراء أو بيع أي سهم، عملة، ذهب، أو أصل مالي.
          </p>
        </div>

        {/* Item 3 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          padding: '14px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px' }}>
            <AlertTriangle size={18} />
            <span>3. تحذير المخاطر العالية (High Risk Warning)</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8', lineHeight: '1.6' }}>
            التداول في البورصة، الذهب، الكريبتو، والأسواق العالمية ينطوي على <strong>مخاطر مالية عالية</strong> قد تؤدي لخسارة كامل رأس المال. الأداء السابق للخوارزميات والنماذج الفنية ليس ضامناً للنتائج المستقبلية.
          </p>
        </div>

        {/* Item 4 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          padding: '14px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px' }}>
            <CheckCircle size={18} />
            <span>4. مسؤولية المستخدم (Full User Responsibility)</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8', lineHeight: '1.6' }}>
            يتحمل المستخدم وحده المسئولية القانونية والمالية الكاملة عن أي قرارات تداول، استثمار، أو دخول صفقات بناءً على قراءته للمنصة، دون أدنى مسؤولية على مطوري المنصة أو مدرائها.
          </p>
        </div>

      </div>

      {/* Confirmation Box & Footer Action */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '700',
          color: '#f8fafc'
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#f59e0b',
              cursor: 'pointer'
            }}
          />
          <span>لقد قرأت وفهمت بنود إخلاء المسؤولية وأوافق على كافة الشروط للمتابعة.</span>
        </label>

        <button
          onClick={handleConfirm}
          disabled={!agreed}
          style={{
            width: '100%',
            background: agreed ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#334155',
            color: agreed ? '#000' : '#94a3b8',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
            fontWeight: '900',
            fontSize: '0.95rem',
            cursor: agreed ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: agreed ? '0 4px 16px rgba(245, 158, 11, 0.35)' : 'none'
          }}
        >
          {agreed ? 'موافقة ومتابعة استخدام المنصة ✅' : 'يرجى تحديد مربع الفهم والموافقة للمتابعة'}
        </button>
      </div>

    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 99999
    }}>
      {content}
    </div>
  );
}
