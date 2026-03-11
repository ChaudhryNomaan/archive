"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVelos } from '@/context/VelosContext';
import Media from './Media';

// 1. Added Interface to define the 'item' type and stop the red line/Vercel errors
interface BagItem {
  cartId: string;
  id: string;
  slug?: string;
  name: string;
  price: number | string;
  sku?: string;
  image?: string;
  image_url?: string;
  media?: string;
  selectedSize?: string;
  basePath?: string;
  fallbackIdx?: number;
}

export default function ShoppingBag() {
  const { bag, isBagOpen, setIsBagOpen, removeFromBag, bagTotal } = useVelos();
  const router = useRouter();

  if (!isBagOpen) return null;

  const currentBag = (bag || []) as BagItem[];

  const handleCheckout = () => {
    setIsBagOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="bag-overlay">
      <style jsx>{`
        .bag-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
        }
        .bag-scrim {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .bag-drawer {
          position: relative;
          width: 100%;
          max-width: 480px;
          background: #fff;
          height: 100%;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #f0f0f0;
          box-shadow: -20px 0 50px rgba(0,0,0,0.05);
        }
        .bag-header {
          padding: 40px 30px;
          border-bottom: 1px solid #f7f7f7;
        }
        .bh-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bh-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 4px;
          color: #000;
          text-transform: uppercase;
        }
        .bag-close-btn {
          background: none;
          border: none;
          color: #999;
          font-size: 10px;
          letter-spacing: 2px;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        .bag-close-btn:hover { color: #000; }
        
        .bag-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 30px;
        }
        .bag-item {
          display: flex;
          gap: 25px;
          padding: 35px 0;
          border-bottom: 1px solid #f9f9f9;
        }
        .bag-item-img {
          width: 110px;
          aspect-ratio: 3/4;
          background: #fcfcfc;
          overflow: hidden;
          flex-shrink: 0;
          cursor: pointer;
          display: block;
        }
        .bag-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .bag-item-details h4 {
          font-size: 14px;
          margin: 4px 0;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: #000;
          text-transform: uppercase;
          cursor: pointer;
        }
        .bag-item-details h4:hover { opacity: 0.6; }
        .sku-label {
          font-size: 8px;
          color: #bbb;
          letter-spacing: 1px;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
        .price-label {
          font-size: 12px;
          margin: 8px 0;
          color: #000;
          font-weight: 500;
        }
        .size-label {
          font-size: 9px;
          color: #999;
          letter-spacing: 1px;
          margin-bottom: 15px;
        }
        .remove-btn {
          background: none;
          border: none;
          color: #d1d1d1;
          font-size: 9px;
          text-align: left;
          padding: 0;
          cursor: pointer;
          letter-spacing: 1.5px;
          transition: color 0.2s;
        }
        .remove-btn:hover { color: #ff4444; }

        .bag-footer {
          padding: 40px 30px;
          border-top: 1px solid #f7f7f7;
          background: #fff;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 35px;
        }
        .total-label {
          font-size: 10px;
          letter-spacing: 3px;
          color: #999;
        }
        .total-amount {
          font-size: 22px;
          font-weight: 300;
          letter-spacing: -1px;
        }
        .checkout-btn-luxury {
          width: 100%;
          padding: 24px;
          background: #000;
          color: #fff;
          border: none;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          cursor: pointer;
          transition: opacity 0.3s;
        }
        .checkout-btn-luxury:hover { opacity: 0.9; }
      `}</style>

      <div className="bag-scrim" onClick={() => setIsBagOpen(false)} />
      
      <div className="bag-drawer">
        <div className="bag-header">
          <div className="bh-inner">
            <span className="bh-title">ARCHIVE SELECTION ({currentBag.length})</span>
            <button className="bag-close-btn" onClick={() => setIsBagOpen(false)}>CLOSE</button>
          </div>
        </div>

        <div className="bag-list">
          {currentBag.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', paddingTop: '100px', opacity: 0.3, fontSize: '10px', letterSpacing: '2px' }}>
              THE ARCHIVE IS EMPTY
            </div>
          ) : (
            currentBag.map((item: BagItem) => {
              const displayPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
              
              // Correct path and slug fallback
              const itemLink = `/product/${item.slug || item.id}`;

              return (
                <div key={item.cartId} className="bag-item">
                  <Link 
                    href={itemLink} 
                    className="bag-item-img"
                    onClick={() => setIsBagOpen(false)}
                  >
                    <Media 
                      item={{ 
                        media: item.media || item.image_url || item.image,
                        basePath: item.basePath, 
                        fallbackIdx: item.fallbackIdx || 0,
                        name: item.name
                      }} 
                    />
                  </Link>

                  <div className="bag-item-details">
                    <span className="sku-label">REF. {item.sku || item.id}</span>
                    
                    <Link href={itemLink} onClick={() => setIsBagOpen(false)}>
                      <h4>{item.name}</h4>
                    </Link>

                    <p className="price-label">£{displayPrice.toFixed(2)}</p>
                    
                    {item.selectedSize && (
                      <p className="size-label">SIZE: {item.selectedSize}</p>
                    )}

                    <button 
                      className="remove-btn" 
                      onClick={() => removeFromBag(item.cartId)}
                    >
                      [ REMOVE FROM ARCHIVE ]
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {currentBag.length > 0 && (
          <div className="bag-footer">
            <div className="total-row">
              <span className="total-label">SUBTOTAL</span>
              <span className="total-amount">£{bagTotal.toFixed(2)}</span>
            </div>
            <button className="checkout-btn-luxury" onClick={handleCheckout}>
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}