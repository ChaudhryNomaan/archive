"use client";

import Link from 'next/link';
import React, { useState, useEffect, use, useMemo } from 'react';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

// Мапінг категорій для бази даних залишається незмінним, щоб не зламати логіку запитів
const SUB_CATEGORY_MAP: Record<string, string> = {
  "JEANS": "JEAN",
  "PANTS": "JEAN",
  "TSHIRTS": "T%SHIRT",
  "SHIRTS": "SHIRT",
  "MEN-SHOES": "SHOE",
  "WOMEN-SHOES": "SHOE",
  "SHORTS": "SHORT"
};

export default function CategoryPage({ params }: { params: Promise<{ catId: string }> }) {
  const resolvedParams = use(params);
  const catId = resolvedParams?.catId;  
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const dbCategoryMatch = useMemo(() => {
    if (!catId) return "";
    return decodeURIComponent(catId).toUpperCase();
  }, [catId]);

  useEffect(() => {
    async function fetchCategoryData() {
      if (!dbCategoryMatch) return;
      setLoading(true);
      try {
        const searchTerm = SUB_CATEGORY_MAP[dbCategoryMatch] || dbCategoryMatch;

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('sub_category', `%${searchTerm}%`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Fetch Error:", String(err));
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    }
    fetchCategoryData();
  }, [dbCategoryMatch]);

  // Відображення назви категорії (заміна дефісів на косу риску для дизайну)
  const categoryTitle = decodeURIComponent(catId || "").toUpperCase().replace('-', ' / ');

  return (
    <div className="cat-root min-h-screen">
      <style jsx>{`
        .cat-root {
          padding-top: 80px; 
        }
        .cat-sidebar {
          padding: 40px 20px;
          border-bottom: 1px solid #eee;
        }
        .cat-breadcrumb {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 4px;
          text-transform: uppercase;
        }
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #eee;
          border-bottom: 1px solid #eee;
        }
        .cat-card {
          background: #fff;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          position: relative;
        }
        .cc-media {
          aspect-ratio: 4 / 5;
          width: 100%;
          overflow: hidden;
          background: #f9f9f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cc-media img, .cc-media video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cc-info {
          padding: 20px;
        }
        .sku {
          font-size: 9px;
          color: #aaa;
          font-weight: 800;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 5px;
        }
        h4 {
          font-size: 14px;
          font-weight: 900;
          margin: 0;
          text-transform: uppercase;
        }
        .price-tag {
          font-size: 13px;
          margin-top: 5px;
          font-weight: 700;
        }
        
        /* Sale Specific Styles */
        .price-tag.on-sale { color: #ff0000; }
        .old-price { 
          font-size: 11px; 
          text-decoration: line-through; 
          color: #aaa; 
          margin-left: 8px; 
          font-weight: 400; 
        }
        .sale-label { 
          position: absolute; 
          top: 15px; 
          left: 15px; 
          background: #ff0000; 
          color: #fff; 
          font-size: 8px; 
          font-weight: 900; 
          padding: 4px 10px; 
          letter-spacing: 2px; 
          z-index: 5;
        }

        @media (max-width: 1024px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .cat-grid { grid-template-columns: 1fr; }
          .cat-sidebar { padding: 30px 15px; }
          .cc-info { padding: 15px; }
        }
      `}</style>
      
      <div className="cat-sidebar">
        <span className="cat-breadcrumb stagger-in">{categoryTitle}</span>
      </div>

      <div className="cat-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cat-card animate-pulse">
              <div className="cc-media bg-gray-100" />
              <div className="cc-info">
                <div className="h-2 w-12 bg-gray-100 mb-4" />
                <div className="h-4 w-32 bg-gray-100" />
              </div>
            </div>
          ))
        ) : (
          products.map((product) => {
            const hasMedia = product.image_url && product.image_url.trim() !== "";
            const isVideo = hasMedia && product.image_url.match(/\.(mp4|webm|mov)$/i);
            const isOnSale = product.compare_at_price && Number(product.compare_at_price) > 0;

            return (
              <Link key={product.id} href={`/product/${product.id}`} className="cat-card stagger-in">
                {/* Sale Tag */}
                {isOnSale && <div className="sale-label">SALE</div>}
                
                <div className="cc-media">
                  {!hasMedia ? (
                    <div className="flex items-center justify-center h-full text-[10px] tracking-widest text-gray-300 font-bold uppercase">No_Media</div>
                  ) : isVideo ? (
                    <video src={product.image_url} autoPlay loop muted playsInline />
                  ) : (
                    <img src={product.image_url} alt={product.name} />
                  )}
                </div>
                <div className="cc-info">
                  <span className="sku">{product.sku || 'AETHER-ARCHIVE'}</span>
                  <h4>{product.name}</h4>
                  
                  <p className={`price-tag ${isOnSale ? 'on-sale' : ''}`}>
                    {Number(product.price).toLocaleString('uk-UA')} ₴
                    {isOnSale && (
                      <span className="old-price">
                        {Number(product.compare_at_price).toLocaleString('uk-UA')} ₴
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {hasFetched && !loading && products.length === 0 && (
        <div className="w-full text-center py-60 text-[10px] tracking-[6px] font-black text-gray-400 uppercase px-4">
          Archive is empty for {categoryTitle}
        </div>
      )}
    </div>
  );
}