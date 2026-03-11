"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useVelos } from '@/context/VelosContext';
import { createClient } from '@/lib/supabase';

export default function ProductPage() {
  const { prodId } = useParams(); 
  const router = useRouter();
  const { addToBag } = useVelos();
  const supabase = createClient(); 
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', prodId)
          .single();

        if (error) throw error;

        if (data) {
          setProduct(data);
          const sizeString = data.specifications?.size || "";
          const sizeArray = sizeString.split(',').map((s: string) => s.trim()).filter(Boolean);
          if (sizeArray.length > 0) setSelectedSize(sizeArray[0]);
        }
      } catch (error) {
        console.error("Supabase fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (prodId) fetchProduct();
  }, [prodId, supabase]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="sku" style={{ letterSpacing: '5px', color: '#000' }}>SYNCHRONIZING...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="sku" style={{ color: '#000' }}>404 // PRODUCT NOT FOUND</p>
      </div>
    );
  }

  const mediaItems = [product.image_url, ...(product.media || [])].filter(Boolean);
  
  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video');
  };

  const nextImage = () => setActiveIndex((prev) => (prev + 1) % mediaItems.length);

  const availableSizes = product.specifications?.size 
    ? product.specifications.size.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="pd-root">
      <style jsx>{`
        .pd-root { 
          display: flex; 
          height: 100vh; 
          background: #fff; 
          color: #000; 
          overflow: hidden;
          padding-top: 80px; /* Offset for the global header */
        }
        
        .pd-visual { 
          flex: 1; 
          position: relative; 
          background: #f9f9f9; 
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: w-resize;
        }

        .pd-gallery-container {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pd-gallery-item { 
          position: absolute;
          top: 60px;
          left: 60px;
          right: 60px;
          bottom: 60px;
          display: flex; 
          align-items: center; 
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.6s ease, visibility 0.6s;
        }

        .pd-gallery-item.active {
          opacity: 1;
          visibility: visible;
        }

        .pd-gallery-item img, .pd-gallery-item video {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
        }
        
        .gallery-controls {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 20px;
          z-index: 10;
        }

        .control-dot {
          width: 40px;
          height: 2px;
          background: #000;
          opacity: 0.1;
          cursor: pointer;
          transition: 0.3s;
        }

        .control-dot.active { opacity: 1; }

        .pd-sidebar { 
          width: 500px; 
          height: 100%; 
          border-left: 1px solid #eee;
          overflow-y: auto;
          background: #fff;
        }

        .pd-sticky-wrap { 
          padding: 60px 50px 120px 50px; /* Increased top padding to clear header */
          display: flex; 
          flex-direction: column; 
          gap: 40px; 
        }
        
        .pd-back-link { 
          background: none; 
          border: none; 
          font-weight: 900; 
          font-size: 10px; 
          letter-spacing: 2px; 
          text-align: left; 
          opacity: 0.4; 
          transition: 0.3s; 
          margin-bottom: -20px; 
          cursor: pointer;
          width: fit-content;
        }
        .pd-back-link:hover { opacity: 1; transform: translateX(-5px); }

        .pd-top h1 { font-size: 38px; font-weight: 900; letter-spacing: -1.5px; margin: 20px 0; line-height: 1.1; text-transform: uppercase; }
        .pd-sku { font-size: 10px; color: #aaa; font-weight: 800; letter-spacing: 1.5px; }
        .pd-price { font-size: 18px; font-weight: 500; }

        .pd-cta-block { display: flex; flex-direction: column; gap: 10px; }
        .pd-add-btn { width: 100%; background: #000; color: #fff; border: 1px solid #000; padding: 20px; font-weight: 900; font-size: 11px; letter-spacing: 3px; cursor: pointer; transition: 0.3s; }
        .pd-add-btn:hover { background: #fff; color: #000; }
        
        .size-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 1px; background: #eee; border: 1px solid #eee; }
        .size-btn { background: #fff; border: none; padding: 15px; font-size: 11px; font-weight: 800; cursor: pointer; }
        .size-btn.active { background: #000; color: #fff; }

        @media (max-width: 1024px) {
          .pd-root { flex-direction: column; height: auto; overflow: visible; padding-top: 60px; }
          .pd-visual { height: 60vh; width: 100%; }
          .pd-gallery-container { padding: 30px; }
          .pd-sidebar { width: 100%; height: auto; }
          .pd-sticky-wrap { padding: 40px 30px; }
        }
      `}</style>

      <div className="pd-visual" onClick={nextImage}>
        <div className="pd-gallery-container">
          {mediaItems.map((url, idx) => (
            <div 
              key={idx} 
              className={`pd-gallery-item ${activeIndex === idx ? 'active' : ''}`}
            >
              {isVideo(url) ? (
                <video src={url} autoPlay muted loop playsInline />
              ) : (
                <img src={url} alt={`${product.name}`} />
              )}
            </div>
          ))}
        </div>

        {mediaItems.length > 1 && (
          <div className="gallery-controls">
            {mediaItems.map((_, idx) => (
              <div 
                key={idx} 
                className={`control-dot ${activeIndex === idx ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="pd-sidebar">
        <div className="pd-sticky-wrap">
          <button className="pd-back-link" onClick={() => router.back()}>{"←"} BACK TO ARCHIVE</button>
          
          <div className="pd-top">
            <span className="pd-sku">SKU: {product.sku}</span>
            <h1>{product.name}</h1>
            <p className="pd-price">{product.currency}{product.price}</p>
          </div>

          {availableSizes.length > 0 && (
            <div className="size-block">
              <span className="size-selection-label" style={{fontSize: '9px', fontWeight: 900, color: '#bbb', letterSpacing: '1.5px', marginBottom: '10px', display: 'block'}}>DIMENSIONS</span>
              <div className="size-grid">
                {availableSizes.map((s: string) => (
                  <button 
                    key={s}
                    className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="pd-cta-block">
            <button 
              className="pd-add-btn" 
              onClick={() => addToBag({ ...product, media: product.image_url, selectedSize })}
            >
              ADD TO ARCHIVE
            </button>
            <button 
              style={{
                width: '100%', background: '#fff', color: '#000', border: '1px solid #000', padding: '20px', fontWeight: 900, fontSize: '11px', letterSpacing: '3px', cursor: 'pointer'
              }}
              onClick={() => {
                addToBag({ ...product, media: product.image_url, selectedSize });
                router.push('/checkout');
              }}
            >
              BUY IT NOW
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#eee', border: '1px solid #eee' }}>
            <div className="info-cell" style={{ background: '#fff', padding: '25px' }}>
              <span style={{ fontSize: '9px', fontWeight: 900, color: '#bbb', letterSpacing: '1.5px', display: 'block' }}>AVAILABILITY</span>
              <span style={{ fontSize: '11px', fontWeight: 800 }}>{product.availability || "IN STOCK"}</span>
            </div>
            <div className="info-cell" style={{ background: '#fff', padding: '25px' }}>
              <span style={{ fontSize: '9px', fontWeight: 900, color: '#bbb', letterSpacing: '1.5px', display: 'block' }}>SHIPPING</span>
              <span style={{ fontSize: '11px', fontWeight: 800 }}>{product.shipping_info || "2-4 DAYS"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}