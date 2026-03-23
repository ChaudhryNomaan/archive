"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { CAT_MAP } from '@/lib/constants';
import { createClient } from '@/lib/supabase';

// Helper functions kept exactly as provided
const generateUniqueId = (name: string, cityId: string) => {
  const base = name.toUpperCase().trim().replace(/ /g, '').replace(/[^\w-]+/g, '').substring(0, 4);
  const entropy = Date.now().toString(36).substring(4).toUpperCase();
  return `${base}-${entropy}-${cityId.toUpperCase()}`;
};

const generateSlug = (name: string) => {
  const base = name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  return `${base}-${Math.random().toString(36).substring(2, 7)}`;
};

const PRESET_SIZES = ["xs", "s", "m", "l", "xl", "xxl", "os"];

function LuxurySelect({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = value === 'all' ? 'ALL CITIES' : value?.toUpperCase() || 'SELECT...';

  return (
    <div className="luxury-select-container" ref={containerRef}>
      <label className="select-label">{label}</label>
      <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span>{displayValue}</span>
        <span className={`arrow ${isOpen ? 'up' : ''}`}>▼</span>
      </div>
      {isOpen && (
        <ul className="select-options">
          {options.map((opt) => (
            <li key={opt} className={opt === value ? "active" : ""} onClick={() => { onChange(opt); setIsOpen(false); }}>
              {opt === 'all' ? 'ALL CITIES' : opt.toUpperCase()}
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .luxury-select-container { position: relative; width: 100%; z-index: 100; }
        .select-label { display: block; font-size: 9px; letter-spacing: 2px; color: #444; margin-bottom: 10px; font-weight: 700; }
        .select-trigger { border-bottom: 1px solid #222; padding: 10px 0; display: flex; justify-content: space-between; cursor: pointer; font-size: 14px; color: #fff; }
        .arrow { font-size: 8px; transition: transform 0.3s; color: #444; }
        .arrow.up { transform: rotate(180deg); }
        .select-options { position: absolute; top: 100%; left: 0; right: 0; background: #0a0a0a; border: 1px solid #111; z-index: 110; max-height: 250px; overflow-y: auto; }
        .select-options li { padding: 12px 15px; font-size: 10px; color: #666; cursor: pointer; border-bottom: 1px solid #111; }
        .select-options li:hover { background: #111; color: #fff; }
        .select-options li.active { color: #d4af37; }
      `}</style>
    </div>
  );
}

export default function ArchiveAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]); // Dynamic cities state
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<{file: File, preview: string}[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [viewCity, setViewCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [formValues, setFormValues] = useState({
    name: '', sku: '', price: '', size: '',
    category: Object.keys(CAT_MAP)[0],
    subCategory: CAT_MAP[Object.keys(CAT_MAP)[0]][0],
    cityId: '' 
  });

  // Fetch Cities from DB
  const fetchCities = async () => {
    const { data } = await supabase.from('cities').select('*').order('name', { ascending: true });
    if (data) {
      setCities(data);
      if (!formValues.cityId && data.length > 0) {
        setFormValues(prev => ({ ...prev, cityId: data[0].id }));
      }
    }
  };

  const fetchVault = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');
      if (viewCity !== 'all') query = query.eq('city_id', viewCity);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCities(); 
    fetchVault(); 
  }, [viewCity]);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  useEffect(() => {
    if (editingItem) {
      setFormValues({
        name: editingItem.name || '',
        sku: editingItem.sku || '',
        price: editingItem.price?.toString() || '',
        size: editingItem.specifications?.size || '',
        category: editingItem.category || Object.keys(CAT_MAP)[0],
        subCategory: editingItem.sub_category || CAT_MAP[Object.keys(CAT_MAP)[0]][0],
        cityId: editingItem.city_id || (cities[0]?.id || '')
      });
      const combined = [editingItem.image_url, ...(editingItem.media || [])].filter(Boolean);
      setExistingMedia(combined);
      setSelectedFiles([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      resetForm();
    }
  }, [editingItem]);

  const resetForm = () => {
    setEditingItem(null);
    setSelectedFiles([]);
    setExistingMedia([]);
    setFormValues({
      name: '', sku: '', price: '', size: '',
      category: Object.keys(CAT_MAP)[0],
      subCategory: CAT_MAP[Object.keys(CAT_MAP)[0]][0],
      cityId: cities[0]?.id || ''
    });
  };

  const toggleSize = (s: string) => {
    const currentSizes = formValues.size.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
    const newSizes = currentSizes.includes(s) ? currentSizes.filter(x => x !== s) : [...currentSizes, s];
    setFormValues({ ...formValues, size: newSizes.join(', ') });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newEntries = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setSelectedFiles(prev => [...prev, ...newEntries]);
  };

  // Helper to remove files from the preview list
  const removeSelectedFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingMedia = (url: string) => {
    setExistingMedia(prev => prev.filter(m => m !== url));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newlyUploadedUrls: string[] = [];
      for (const entry of selectedFiles) {
        const fileExt = entry.file.name.split('.').pop();
        const fileName = `vault/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        await supabase.storage.from('vault').upload(fileName, entry.file);
        const { data: { publicUrl } } = supabase.storage.from('vault').getPublicUrl(fileName);
        newlyUploadedUrls.push(publicUrl);
      }

      const allMedia = [...existingMedia, ...newlyUploadedUrls];
      const basePayload = {
        name: formValues.name,
        price: parseFloat(formValues.price) || 0,
        category: formValues.category,
        sub_category: formValues.subCategory,
        image_url: allMedia[0] || '',
        media: allMedia.slice(1),
        specifications: { size: formValues.size }
      };

      if (editingItem) {
        await supabase.from('products').update({ 
          ...basePayload, 
          sku: formValues.sku || editingItem.sku,
          city_id: formValues.cityId 
        }).eq('id', editingItem.id);
      } else {
        if (formValues.cityId === 'all') {
          const bulkPayload = cities.map(city => ({
            ...basePayload,
            city_id: city.id,
            sku: generateUniqueId(formValues.name, city.id),
            slug: `${generateSlug(formValues.name)}-${city.id}`
          }));
          const { error } = await supabase.from('products').insert(bulkPayload);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('products').insert([{ 
            ...basePayload, 
            sku: formValues.sku || generateUniqueId(formValues.name, formValues.cityId),
            city_id: formValues.cityId, 
            slug: generateSlug(formValues.name) 
          }]);
          if (error) throw error;
        }
      }

      resetForm();
      fetchVault();
    } catch (err: any) {
      alert(`Sync Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Confirm permanent removal from Vault?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchVault();
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-archive">
      <header className="luxury-header">
        <div className="accent-line"></div>
        <div className="header-meta">
          <span>ENGINE_V2.5 // LIVE_SEARCH</span>
          <span>LOCATION_AWARE_INVENTORY</span>
        </div>
        <h1 className="luxury-title">ARCHIVE <span className="serif-italic">& Vault</span></h1>
      </header>

      <div className="admin-split-layout">
        <aside className="luxury-form-container">
          <h3 className="card-subtitle">{editingItem ? 'MODIFY RECORD' : 'NEW ENTRY'}</h3>
          <form onSubmit={handleSave} className="luxury-stack">
            
            <div className="input-group">
              <LuxurySelect 
                label="LOCATION TARGET" 
                value={formValues.cityId} 
                options={['all', ...cities.map(c => c.id)]} 
                onChange={(val) => setFormValues({...formValues, cityId: val})} 
              />
            </div>

            <div className="input-group">
              <label>IDENTIFIER</label>
              <input className="luxury-input" placeholder="PRODUCT NAME" value={formValues.name} onChange={e => setFormValues({...formValues, name: e.target.value})} required />
            </div>

            <div className="input-group">
              <label>SIZE GRID</label>
              <div className="size-grid">
                {PRESET_SIZES.map(s => (
                  <button key={s} type="button" className={`luxury-size-btn ${formValues.size.toLowerCase().includes(s) ? 'active' : ''}`} onClick={() => toggleSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="luxury-row">
              <div className="input-group">
                <label>SKU (AUTO-GEN)</label>
                <input className="luxury-input" placeholder="LEAVE BLANK" value={formValues.sku} onChange={e => setFormValues({...formValues, sku: e.target.value})} />
              </div>
              <div className="input-group">
                <label>PRICE (€)</label>
                <input className="luxury-input" type="number" step="0.01" value={formValues.price} onChange={e => setFormValues({...formValues, price: e.target.value})} required />
              </div>
            </div>

            <div className="luxury-row">
              <LuxurySelect label="CATEGORY" value={formValues.category} options={Object.keys(CAT_MAP)} onChange={(val) => setFormValues({...formValues, category: val, subCategory: CAT_MAP[val][0]})} />
              <LuxurySelect label="SUB-ARCHIVE" value={formValues.subCategory} options={CAT_MAP[formValues.category] || []} onChange={(val) => setFormValues({...formValues, subCategory: val})} />
            </div>

            <div className="input-group">
              <label>MEDIA ASSETS</label>

              {/* MEDIA PREVIEW SECTION */}
              {(existingMedia.length > 0 || selectedFiles.length > 0) && (
                <div className="media-preview-grid">
                  {existingMedia.map((url, idx) => (
                    <div key={`existing-${idx}`} className="preview-item">
                      <img src={url} alt="Existing" />
                      <button type="button" className="remove-preview" onClick={() => removeExistingMedia(url)}>×</button>
                      <span className="preview-tag">SYNCED</span>
                    </div>
                  ))}
                  {selectedFiles.map((entry, idx) => (
                    <div key={`new-${idx}`} className="preview-item pending">
                      <img src={entry.preview} alt="New" />
                      <button type="button" className="remove-preview" onClick={() => removeSelectedFile(idx)}>×</button>
                      <span className="preview-tag">NEW</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="upload-block" onClick={() => fileInputRef.current?.click()}>
                <span>UPLOAD MEDIA +</span>
                <input type="file" ref={fileInputRef} hidden multiple accept="image/*,video/*" onChange={handleFileChange} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="luxury-submit-btn">
              {loading ? 'SYNCHRONIZING...' : editingItem ? 'UPDATE RECORD' : 'COMMIT TO VAULT'}
            </button>
            {editingItem && <button type="button" onClick={resetForm} className="cancel-btn">CANCEL EDIT</button>}
          </form>
        </aside>

        <div className="inventory-container">
          <div className="inventory-controls">
            <div className="city-filter-tabs">
              <button className={viewCity === 'all' ? 'active' : ''} onClick={() => setViewCity('all')}>GLOBAL</button>
              {cities.map(c => (
                <button key={c.id} className={viewCity === c.id ? 'active' : ''} onClick={() => setViewCity(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
            
            <div className="search-node">
              <input 
                type="text" 
                placeholder="SEARCH VAULT..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="luxury-search-input"
              />
              <span className="search-count">{filteredItems.length} ITEMS</span>
            </div>
          </div>

          <div className="table-header-luxury">
            <span className="col-sku">REF / SKU</span>
            <span className="col-name">IDENTIFIER</span>
            <span className="col-price">VALUE</span>
            <span className="col-actions">CTRL</span>
          </div>

          <div className="inventory-scroll">
            {filteredItems.length === 0 && !loading && <p className="empty-msg">NO MATCHING NODES FOUND</p>}
            {filteredItems.map(item => (
              <div key={item.id} className="inventory-row-luxury" onClick={() => setEditingItem(item)}>
                <span className="col-sku">{item.sku}</span>
                <span className="col-name">
                  {item.name}
                  <div className="row-sub-info">
                    {item.category} — <span className="city-tag">{item.city_id?.toUpperCase()}</span>
                  </div>
                </span>
                <span className="col-price">€{item.price}</span>
                <span className="col-actions">
                  <button className="delete-btn" onClick={(e) => handleDelete(e, item.id)}>DEL</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Style block kept exactly as provided */
        .luxury-archive { padding: 40px; max-width: 100%; margin: 0 auto; color: #fff; background: #000; min-height: 100vh; font-family: -apple-system, sans-serif; overflow-x: hidden; }
        .luxury-header { margin-bottom: 60px; }
        .accent-line { width: 40px; height: 1px; background: #d4af37; margin-bottom: 20px; }
        .header-meta { display: flex; justify-content: space-between; font-size: 8px; letter-spacing: 4px; color: #666; text-transform: uppercase; }
        .luxury-title { font-size: 5rem; font-weight: 200; letter-spacing: -2px; line-height: 0.9; text-transform: uppercase; margin: 0; }
        .serif-italic { font-family: serif; font-style: italic; color: #444; }
        .admin-split-layout { display: grid; grid-template-columns: 380px 1fr; gap: 60px; align-items: start; width: 100%; }
        .inventory-controls { margin-bottom: 30px; }
        .city-filter-tabs { display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #111; padding-bottom: 15px; overflow-x: auto; scrollbar-width: none; }
        .city-filter-tabs::-webkit-scrollbar { display: none; }
        .city-filter-tabs button { background: none; border: none; color: #444; font-size: 8px; letter-spacing: 2px; cursor: pointer; white-space: nowrap; padding: 5px 0; }
        .city-filter-tabs button.active { color: #d4af37; border-bottom: 1px solid #d4af37; }
        .search-node { position: relative; display: flex; align-items: center; background: #050505; border: 1px solid #111; padding: 10px 20px; }
        .luxury-search-input { background: none; border: none; color: #fff; font-size: 10px; letter-spacing: 2px; flex: 1; outline: none; text-transform: uppercase; }
        .search-count { font-size: 8px; color: #444; letter-spacing: 1px; }
        .inventory-container { overflow: hidden; }
        .table-header-luxury, .inventory-row-luxury { display: grid; grid-template-columns: 160px 1fr 100px 70px; gap: 20px; align-items: center; border-bottom: 1px solid #111; }
        .table-header-luxury { font-size: 8px; letter-spacing: 2px; color: #444; padding-bottom: 15px; text-transform: uppercase; }
        .inventory-row-luxury { padding: 25px 0; cursor: pointer; transition: 0.2s; }
        .inventory-row-luxury:hover { background: #050505; }
        .col-sku { color: #d4af37; font-size: 8px; font-weight: 800; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .col-name { font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .row-sub-info { font-weight: 400; color: #444; font-size: 8px; margin-top: 6px; }
        .city-tag { color: #d4af37; }
        .col-price { font-size: 11px; text-align: right; }
        .luxury-form-container { background: #050505; border: 1px solid #111; padding: 30px; position: sticky; top: 40px; }
        .card-subtitle { font-size: 9px; letter-spacing: 5px; color: #d4af37; margin-bottom: 30px; text-transform: uppercase; }
        .luxury-stack { display: flex; flex-direction: column; gap: 25px; }
        .luxury-input { background: transparent; border: none; border-bottom: 1px solid #222; color: #fff; width: 100%; padding: 10px 0; font-size: 13px; outline: none; }
        .luxury-submit-btn { background: #fff; color: #000; border: none; padding: 20px; font-size: 10px; font-weight: 900; letter-spacing: 3px; cursor: pointer; transition: 0.3s; }
        .luxury-submit-btn:hover { background: #d4af37; }
        .delete-btn { background: none; border: 1px solid #222; color: #444; font-size: 8px; padding: 6px 10px; cursor: pointer; transition: 0.2s; letter-spacing: 1px; }
        .delete-btn:hover { border-color: #ff4444; color: #ff4444; }
        .inventory-scroll { max-height: 65vh; overflow-y: auto; padding-right: 5px; }
        .inventory-scroll::-webkit-scrollbar { width: 2px; }
        .inventory-scroll::-webkit-scrollbar-thumb { background: #111; }
        .size-grid { display: flex; gap: 5px; flex-wrap: wrap; }
        .luxury-size-btn { background: none; border: 1px solid #222; color: #444; padding: 6px 10px; font-size: 9px; cursor: pointer; }
        .luxury-size-btn.active { border-color: #d4af37; color: #fff; }
        .upload-block { border: 1px dashed #222; padding: 20px; text-align: center; color: #444; font-size: 9px; cursor: pointer; }
        .cancel-btn { background: none; border: none; color: #444; font-size: 8px; margin-top: 10px; cursor: pointer; text-transform: uppercase; }
        .empty-msg { font-size: 8px; letter-spacing: 2px; color: #333; text-align: center; margin-top: 40px; }

        /* Preview Grid New Styles */
        .media-preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; }
        .preview-item { position: relative; aspect-ratio: 1; background: #111; border: 1px solid #222; overflow: hidden; }
        .preview-item img { width: 100%; height: 100%; object-fit: cover; }
        .preview-item.pending img { opacity: 0.5; }
        .remove-preview { position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.7); color: white; border: none; width: 18px; height: 18px; border-radius: 50%; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; z-index: 5; }
        .preview-tag { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); font-size: 6px; letter-spacing: 1px; padding: 4px; text-align: center; color: #d4af37; }
      `}</style>
    </div>
  );
}