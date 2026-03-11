"use client";
import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { CAT_MAP } from '@/lib/constants';
import Media from '@/components/Media';
import { createClient } from '@/lib/supabase';

export default function CategoryPage({ params }: { params: Promise<{ catId: string }> }) {
  const { catId } = use(params);
  const [activeSub, setActiveSub] = useState("");
  const [vaultData, setVaultData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    if (CAT_MAP[catId] && CAT_MAP[catId].length > 0) {
      setActiveSub(CAT_MAP[catId][0]);
    }

    const fetchVault = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', catId);

        if (error) throw error;
        setVaultData(data || []);
      } catch (error) {
        console.error("Failed to load vault:", error);
        setVaultData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVault();
  }, [catId]);

  const items = useMemo(() => {
    if (!Array.isArray(vaultData)) return [];
    return vaultData.filter(i => {
      const itemSub = i.sub_category || i.subcategory || "";
      return i.category === catId && 
             String(itemSub).toLowerCase() === String(activeSub).toLowerCase();
    });
  }, [catId, activeSub, vaultData]);

  if (!mounted) return <div className="cat-root" />;

  return (
    <div className="cat-root">
      <aside className="cat-sidebar">
        <span className="cat-breadcrumb">ARCHIVE {" // "} {catId}</span>
        <nav className="cat-nav-list">
          {CAT_MAP[catId]?.map(sub => (
            <button 
              key={sub} 
              className={activeSub === sub ? 'active' : ''} 
              onClick={() => setActiveSub(sub)}
            >
              {activeSub === sub && <div className="active-indicator" />}
              {sub.toUpperCase()}
            </button>
          ))}
        </nav>
      </aside>

      <div className="cat-grid">
        {isLoading ? (
          <div className="loading-state" style={{ padding: '20px', fontSize: '10px', letterSpacing: '2px', color: '#444' }}>
            SYNCHRONIZING_ARCHIVE...
          </div>
        ) : items.length > 0 ? (
          items.map((item, idx) => {
            const currentPrice = item.price || item.itemPrice;
            
            // AGGRESSIVE URL DETECTION
            let finalUrl = "";
            try {
              if (typeof item.image_url === 'string') {
                // If it's a stringified array "['url']", parse it. 
                // If it's just a string, it will fail parsing and we use it directly.
                if (item.image_url.startsWith('[') || item.image_url.startsWith('{')) {
                  const parsed = JSON.parse(item.image_url);
                  finalUrl = Array.isArray(parsed) ? parsed[0] : parsed;
                } else {
                  finalUrl = item.image_url;
                }
              } else if (Array.isArray(item.image_url)) {
                finalUrl = item.image_url[0];
              }
            } catch (e) {
              finalUrl = item.image_url;
            }

            return (
              <Link 
                key={item.id} 
                href={`/product/${item.slug}`} 
                className="cat-card stagger-in" 
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="cc-media reveal-frame">
                  {/* Passing BOTH media and basePath to trigger every possible check in Media.tsx */}
                  <Media item={{ 
                    ...item, 
                    media: finalUrl,
                    basePath: finalUrl 
                  }} />
                </div>
                
                <div className="cc-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="sku">{item.sku || item.id}</span>
                    {item.specifications?.size && (
                      <span style={{ fontSize: '8px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        SZ: {item.specifications.size}
                      </span>
                    )}
                  </div>
                  <h4>{item.name}</h4>
                  <div className="price-line">
                    <span style={{ color: '#fff' }}>
                      {currentPrice ? `€${currentPrice}` : "TBA"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="empty-state" style={{ padding: '20px', fontSize: '10px', color: '#444', letterSpacing: '1px' }}>
            NO_DATA_FOUND // SECTOR_{catId?.toUpperCase()}_{activeSub?.toUpperCase()}
          </div>
        )}
      </div>

      <style jsx>{`
        .price-line { margin-top: 5px; font-size: 11px; letter-spacing: 1px; }
        .empty-state { grid-column: 1 / -1; height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #1a1a1a; }
      `}</style>
    </div>
  );
}