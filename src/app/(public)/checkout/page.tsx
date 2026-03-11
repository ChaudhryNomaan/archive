"use client";
import { useState, useEffect, useRef } from 'react';
import { useVelos } from '@/context/VelosContext';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function CheckoutPage() {
  const supabase = createClient();
  const { bag, bagTotal, clearBag } = useVelos();
  const [hasMounted, setHasMounted] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Dynamic Bank Details State
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountName: '',
    iban: '',
    swift: '',
    reference: '',
    adminEmail: '',
    instagramHandle: 'velos_archive' // Default fallback
  });

  useEffect(() => {
    setHasMounted(true);
    document.body.classList.add('checkout-page-body');

    // Fetch Vault Configuration from Supabase
    const fetchVaultConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_config')
          .select('content')
          .eq('section_name', 'vault_config')
          .single();

        if (data && !error) {
          setBankInfo({
            bankName: data.content.bankName || '[ AWAITING_PROTOCOL ]',
            accountName: data.content.accountName || '[ AWAITING_PROTOCOL ]',
            iban: data.content.iban || '[ AWAITING_PROTOCOL ]',
            swift: data.content.swift || '[ AWAITING_PROTOCOL ]',
            adminEmail: data.content.email || 'admin@velos-archive.com',
            instagramHandle: data.content.instagram || 'velos_archive',
            reference: `VELOS_ARC_${Math.floor(1000 + Math.random() * 9000)}`
          });
        }
      } catch (err) {
        console.error("Vault Access Error:", err);
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
    if (!receiptFile || !formRef.current) return;
    
    setIsProcessing(true);

    const inputs = formRef.current.querySelectorAll('input');
    const customerData: any = {};
    inputs.forEach(input => {
        if(input.placeholder) customerData[input.placeholder.toLowerCase()] = input.value;
    });

    const formData = new FormData();
    formData.append('file', receiptFile);
    formData.append('orderData', JSON.stringify({
      adminEmail: bankInfo.adminEmail,
      items: bag.map((item: any) => ({
        name: item.name,
        price: item.price,
        size: item.selectedSize || "N/A",
        sku: item.sku || "NO-SKU"
      })),
      total: bagTotal,
      customer: {
        name: customerData['full name'],
        email: customerData['email address'],
        address: customerData['street address'],
        city: customerData['city'],
        postal: customerData['postal code']
      },
      paymentReference: bankInfo.reference
    }));

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setOrderComplete(true);
        clearBag();
      } else {
        const errData = await res.json();
        alert(`TRANSACTION ERROR // ${errData.error || 'PLEASE TRY AGAIN'}`);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("NETWORK ERROR // CHECK CONNECTION");
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="checkout-container">
        <div className="stagger-in" style={{ textAlign: 'center', marginTop: '10vh', maxWidth: '500px', margin: '10vh auto' }}>
            <h1 className="terminal-header">GATEWAY // OPEN</h1>
            
            <div className="bank-details-box" style={{ textAlign: 'left', marginBottom: '40px' }}>
              <p style={{ fontSize: '9px', color: '#555', letterSpacing: '2px', lineHeight: '1.8', marginBottom: '20px' }}>
                TRANSACTION INITIALIZED. TO COMPLETE ARCHIVE ACQUISITION, SEND YOUR UNIQUE REFERENCE TO OUR CONCIERGE VIA INSTAGRAM DM.
              </p>
              
              <div style={{ border: '1px solid #222', padding: '20px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '8px', color: '#444', marginBottom: '8px' }}>ORDER REFERENCE</span>
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
              INITIALIZE DM PROTOCOL
            </a>

            <Link href="/" style={{ display: 'block', marginTop: '40px', fontSize: '8px', color: '#333', textDecoration: 'none', letterSpacing: '2px' }}>
                RETURN TO VAULT
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container" ref={formRef}>
      <h1 className="terminal-header">TRANSACTION // TERMINAL</h1>

      <div className="checkout-grid">
        <div className="shipping-section stagger-in">
          <span className="section-title">01 // SHIPPING & VERIFICATION</span>
          
          <input className="checkout-input" placeholder="FULL NAME" required />
          <input className="checkout-input" placeholder="EMAIL ADDRESS" type="email" required />
          <input className="checkout-input" placeholder="STREET ADDRESS" required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '60px' }}>
            <input className="checkout-input" placeholder="CITY" required />
            <input className="checkout-input" placeholder="POSTAL CODE" required />
          </div>

          <span className="section-title">02 // TRANSFER GATEWAY</span>
          <div className="bank-details-box">
            <div className="bank-row"><span>BANK NAME</span> <span>{bankInfo.bankName}</span></div>
            <div className="bank-row"><span>ACCOUNT NAME</span> <span>{bankInfo.accountName}</span></div>
            <div className="bank-row"><span>IBAN / ACCOUNT</span> <span>{bankInfo.iban}</span></div>
            <div className="bank-row"><span>SWIFT / BIC</span> <span>{bankInfo.swift}</span></div>
            <div className="bank-row" style={{ border: 'none', marginTop: '10px' }}>
                <span style={{ color: '#888' }}>REFERENCE</span> 
                <span style={{ color: '#fff' }}>{bankInfo.reference}</span>
            </div>
          </div>

          <div className="receipt-upload-container" style={{ marginTop: '60px' }}>
            <span className="section-title" style={{ marginBottom: '15px' }}>03 // UPLOAD PROOF</span>
            
            <label className="upload-dropzone">
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              <div className="upload-box-inner">
                {previewUrl ? (
                  <img src={previewUrl} alt="Receipt Preview" className="receipt-preview-img" />
                ) : (
                  <div className="upload-placeholder">
                    {receiptFile ? receiptFile.name.toUpperCase() : "[ SELECT RECEIPT FROM DEVICE ]"}
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="receipt-section stagger-in" style={{ animationDelay: '0.2s' }}>
          <span className="section-title">SUMMARY</span>
          
          <div className="receipt-box">
            <div className="receipt-items-list">
              {bag.map((item: any) => (
                <div key={item.cartId} className="receipt-row" style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px' }}>{item.name?.toUpperCase()}</span>
                    <span style={{ fontSize: '8px', color: '#555', letterSpacing: '1px' }}>
                      SIZE: {item.selectedSize || "N/A"}
                    </span>
                  </div>
                  <span>€{parseFloat(item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="receipt-row" style={{ color: '#444', marginTop: '20px' }}>
              <span>SHIPPING</span>
              <span>COMPLIMENTARY</span>
            </div>

            <div className="total-row-highlight">
              <span>TOTAL PAYABLE</span>
              <span>€{bagTotal.toFixed(2)}</span>
            </div>

            <button 
              className="confirm-btn" 
              onClick={handleConfirm}
              disabled={!receiptFile || isProcessing}
              style={{ opacity: !receiptFile || isProcessing ? 0.2 : 1 }}
            >
              {isProcessing ? 'ENCRYPTING...' : receiptFile ? 'CONFIRM ORDER' : 'AWAITING RECEIPT'}
            </button>
            
            {!receiptFile && (
              <p style={{ fontSize: '8px', color: '#ff3b3b', marginTop: '15px', textAlign: 'center', letterSpacing: '1px' }}>
                * PAYMENT PROOF REQUIRED TO INITIALIZE SHIPMENT
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
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