"use client";
import { useState, useEffect, useRef } from 'react';
import { useOSNOVA } from '@/context/OSNOVAContext';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function CheckoutPage() {
  const supabase = createClient();
  const { bag, bagTotal, clearBag } = useOSNOVA();
  const [hasMounted, setHasMounted] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountName: '',
    iban: '',
    swift: '',
    reference: '',
    adminEmail: '',
    instagramHandle: 'OSNOVA_archive' 
  });

  useEffect(() => {
    setHasMounted(true);
    document.body.classList.add('checkout-page-body');

    const fetchVaultConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_config')
          .select('content')
          .eq('section_name', 'vault_config')
          .single();

        if (data && !error) {
          setBankInfo({
            bankName: data.content.bankName || '[ ОЧІКУВАННЯ ПРОТОКОЛУ ]',
            accountName: data.content.accountName || '[ ОЧІКУВАННЯ ПРОТОКОЛУ ]',
            iban: data.content.iban || '[ ОЧІКУВАННЯ ПРОТОКОЛУ ]',
            swift: data.content.swift || '[ ОЧІКУВАННЯ ПРОТОКОЛУ ]',
            adminEmail: data.content.email || 'admin@OSNOVA-archive.com',
            instagramHandle: data.content.instagram || 'OSNOVA_archive',
            reference: `OSNOVA_ARC_${Math.floor(1000 + Math.random() * 9000)}`
          });
        }
      } catch (err) {
        console.error("Помилка доступу до сховища:", err);
      }
    };

    fetchVaultConfig();
    return () => document.body.classList.remove('checkout-page-body');
  }, [supabase]);

  if (!hasMounted) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleConfirm = async () => {
    if (!receiptFile) return;
    
    setIsProcessing(true);

    const itemSummary = bag.map((item: any) => 
      `- ${item.name.toUpperCase()} (${item.selectedSize || "N/A"})`
    ).join('\n');

    const orderSummary = `
НОВИЙ ЗАПИТ АРХІВУ
--------------------
REF: ${bankInfo.reference}
СУМА: ${bagTotal.toLocaleString('uk-UA')} ₴

ТОВАРИ:
${itemSummary}

*Квитанція додана*
    `.trim();

  // (Логіка копіювання залишається без змін)
    try {
      await navigator.clipboard.writeText(orderSummary);
      setOrderComplete(true);
      clearBag();
      alert("ДЕТАЛІ ЗАМОВЛЕННЯ СКОПІЙОВАНО. БУДЬ ЛАСКА, ВСТАВТЕ ЇХ У ПОВІДОМЛЕННЯ (DM).");
    } catch (error) {
      console.error("Помилка буфера обміну:", error);
      setOrderComplete(true);
      clearBag();
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="checkout-container">
        <div className="stagger-in" style={{ textAlign: 'center', marginTop: '10vh', maxWidth: '500px', margin: '10vh auto' }}>
            <h1 className="terminal-header">ШЛЮЗ // ВІДКРИТО</h1>
            
            <div className="bank-details-box" style={{ textAlign: 'left', marginBottom: '40px' }}>
              <p style={{ fontSize: '9px', color: '#555', letterSpacing: '2px', lineHeight: '1.8', marginBottom: '20px' }}>
                ТРАНЗАКЦІЮ ІНІЦІЙОВАНО. ДЕТАЛІ ЗАМОВЛЕННЯ СКОПІЙОВАНІ В БУФЕР ОБМІНУ. НАДІШЛІТЬ ЇХ РАЗОМ ІЗ КВИТАНЦІЄЮ НАШОМУ КОНСЬЄРЖУ.
              </p>
              
              <div style={{ border: '1px solid #222', padding: '20px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '8px', color: '#444', marginBottom: '8px' }}>НОМЕР ЗАМОВЛЕННЯ (REF)</span>
                <span style={{ fontSize: '14px', letterSpacing: '4px', color: '#fff' }}>{bankInfo.reference}</span>
              </div>
            </div>

            <a 
              href={`https://ig.me/m/${bankInfo.instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="confirm-btn" 
              style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}
            >
              ІНІЦІЮВАТИ ПРОТОКОЛ DM
            </a>

            <Link href="/" style={{ display: 'block', marginTop: '40px', fontSize: '8px', color: '#333', textDecoration: 'none', letterSpacing: '2px' }}>
                ПОВЕРНУТИСЯ ДО СХОВИЩА
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container" ref={formRef}>
      <h1 className="terminal-header">ТРАНЗАКЦІЙНИЙ // ТЕРМІНАЛ</h1>

      <div className="checkout-grid">
        <div className="shipping-section stagger-in">
          <span className="section-title">01 // ДОСТАВКА ТА ВЕРИФІКАЦІЯ</span>
          
          <input className="checkout-input" placeholder="ПОВНЕ ІМ'Я" required />
          <input className="checkout-input" placeholder="ЕЛЕКТРОННА ПОШТА" type="email" required />
          <input className="checkout-input" placeholder="АДРЕСА (ВУЛИЦЯ, БУДИНОК)" required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '60px' }}>
            <input className="checkout-input" placeholder="МІСТО" required />
            <input className="checkout-input" placeholder="ПОШТОВИЙ ІНДЕКС" required />
          </div>

          <span className="section-title">02 // ШЛЮЗ ПЕРЕКАЗУ</span>
          <div className="bank-details-box">
            <div className="bank-row"><span>БАНК</span> <span>{bankInfo.bankName}</span></div>
            <div className="bank-row"><span>ОТРИМУВАЧ</span> <span>{bankInfo.accountName}</span></div>
            <div className="bank-row"><span>IBAN / РАХУНОК</span> <span>{bankInfo.iban}</span></div>
            <div className="bank-row"><span>SWIFT / BIC</span> <span>{bankInfo.swift}</span></div>
            <div className="bank-row" style={{ border: 'none', marginTop: '10px' }}>
                <span style={{ color: '#888' }}>ПРИЗНАЧЕННЯ (REF)</span> 
                <span style={{ color: '#fff' }}>{bankInfo.reference}</span>
            </div>
          </div>

          <div className="receipt-upload-container" style={{ marginTop: '60px' }}>
            <span className="section-title" style={{ marginBottom: '15px' }}>03 // ЗАВАНТАЖЕННЯ ПІДТВЕРДЖЕННЯ</span>
            
            <label className="upload-dropzone">
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              <div className="upload-box-inner">
                {previewUrl ? (
                  <img src={previewUrl} alt="Receipt Preview" className="receipt-preview-img" />
                ) : (
                  <div className="upload-placeholder">
                    {receiptFile ? receiptFile.name.toUpperCase() : "[ ОБЕРІТЬ КВИТАНЦІЮ З ПРИСТРОЮ ]"}
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="receipt-section stagger-in" style={{ animationDelay: '0.2s' }}>
          <span className="section-title">ПІДСУМОК</span>
          
          <div className="receipt-box">
            <div className="receipt-items-list">
              {bag.map((item: any) => (
                <div key={item.cartId} className="receipt-row" style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px' }}>{item.name?.toUpperCase()}</span>
                    <span style={{ fontSize: '8px', color: '#555', letterSpacing: '1px' }}>
                      РОЗМІР: {item.selectedSize || "N/A"}
                    </span>
                  </div>
                  <span>{parseFloat(item.price).toLocaleString('uk-UA')} ₴</span>
                </div>
              ))}
            </div>

            <div className="receipt-row" style={{ color: '#444', marginTop: '20px' }}>
              <span>ДОСТАВКА</span>
              <span>БЕЗКОШТОВНО</span>
            </div>

            <div className="total-row-highlight">
              <span>ДО СПЛАТИ</span>
              <span>{bagTotal.toLocaleString('uk-UA')} ₴</span>
            </div>

            <button 
              className="confirm-btn" 
              onClick={handleConfirm}
              disabled={!receiptFile || isProcessing}
              style={{ opacity: !receiptFile || isProcessing ? 0.2 : 1 }}
            >
              {isProcessing ? 'ШИФРУВАННЯ...' : receiptFile ? 'ПІДТВЕРДИТИ ЗАМОВЛЕННЯ' : 'ОЧІКУВАННЯ КВИТАНЦІЇ'}
            </button>
            
            {!receiptFile && (
              <p style={{ fontSize: '8px', color: '#ff3b3b', marginTop: '15px', textAlign: 'center', letterSpacing: '1px' }}>
                * ДЛЯ ІНІЦІАЛІЗАЦІЇ ВІДПРАВЛЕННЯ ПОТРІБНЕ ПІДТВЕРДЖЕННЯ ОПЛАТИ
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Стилі залишаються без змін, оскільки вони відповідають за візуал */
        .checkout-container { max-width: 1200px; margin: 0 auto; padding: 60px 20px; color: #fff; font-family: monospace; }
        .terminal-header { font-size: clamp(24px, 4vw, 40px); font-weight: 300; letter-spacing: -1px; margin-bottom: 60px; text-align: center; }
        .section-title { font-size: 9px; letter-spacing: 4px; color: #444; display: block; margin-bottom: 40px; }
        .checkout-grid { display: grid; grid-template-columns: 1fr; gap: 60px; }
        @media (min-width: 1024px) { .checkout-grid { grid-template-columns: 1fr 400px; } }
        .checkout-input { width: 100%; background: transparent; border: none; border-bottom: 1px solid #1a1a1a; padding: 15px 0; color: #fff; font-size: 11px; letter-spacing: 2px; margin-bottom: 25px; outline: none; text-transform: uppercase; }
        .checkout-input:focus { border-bottom-color: #fff; }
        .bank-details-box { background: #050505; border: 1px solid #111; padding: 25px; }
        .bank-row { display: flex; justify-content: space-between; font-size: 10px; padding: 12px 0; border-bottom: 1px solid #111; letter-spacing: 1px; }
        .receipt-box { background: #050505; border: 1px solid #111; padding: 30px; }
        .receipt-row { display: flex; justify-content: space-between; font-size: 10px; letter-spacing: 1px; }
        .total-row-highlight { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 1px solid #222; font-weight: bold; font-size: 16px; }
        .confirm-btn { width: 100%; margin-top: 30px; padding: 20px; background: #fff; color: #000; border: none; font-size: 11px; font-weight: bold; letter-spacing: 2px; cursor: pointer; text-transform: uppercase; transition: 0.3s; }
        .confirm-btn:hover:not(:disabled) { background: #ccc; }
        .upload-dropzone { display: block; cursor: pointer; border: 1px dashed #222; }
        .upload-box-inner { height: 120px; display: flex; align-items: center; justify-content: center; background: #050505; }
        .upload-placeholder { font-size: 9px; color: #444; letter-spacing: 2px; }
        .receipt-preview-img { height: 100%; width: auto; object-fit: contain; padding: 10px; }
        .stagger-in { animation: fadeIn 0.8s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}