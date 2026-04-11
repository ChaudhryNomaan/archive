"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase';

const ARCHIVE_CATEGORIES = ["MEN-SHOES", "WOMEN-SHOES", "SHIRTS", "SHORTS"];

const PRESET_SIZES = [
  "32", "34", "36", "38", "40", "42", "44", "46", 
  "xs", "s", "m", "l", "xl", "xxl", "os"
];

const generateUniqueId = (name: string) => {
  const base = name.toUpperCase().trim().replace(/ /g, '').replace(/[^\w-]+/g, '').substring(0, 4);
  const entropy = Date.now().toString(36).substring(4).toUpperCase();
  return `${base}-${entropy}-GLOBAL`;
};

const generateSlug = (name: string) => {
  const base = name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  return `${base}-${Math.random().toString(36).substring(2, 7)}`;
};

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

  return (
    <div className="luxury-select-container" ref={containerRef}>
      <label className="select-label">{label}</label>
      <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span>{value?.replace('-', ' ').toUpperCase() || 'SELECT...'}</span>
        <span className={`arrow ${isOpen ? 'up' : ''}`}>▼</span>
      </div>
      {isOpen && (
        <ul className="select-options">
          {options.map((opt) => (
            <li key={opt} className={opt === value ? "active" : ""} onClick={() => { onChange(opt); setIsOpen(false); }}>
              {opt.replace('-', ' ').toUpperCase()}
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
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<{file: File, preview: string}[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [formValues, setFormValues] = useState({
    name: '', sku: '', price: '', compare_at_price: '', size: '',
    category: 'COLLECTION', 
    subCategory: ARCHIVE_CATEGORIES[0] 
  });

  const fetchVault = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVault(); }, []);

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
        compare_at_price: editingItem.compare_at_price?.toString() || '',
        size: editingItem.specifications?.size || '',
        category: editingItem.category || 'COLLECTION',
        subCategory: editingItem.sub_category || ARCHIVE_CATEGORIES[0]
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
      name: '', sku: '', price: '', compare_at_price: '', size: '',
      category: 'COLLECTION',
      subCategory: ARCHIVE_CATEGORIES[0]
    });
  };

  const toggleSize = (s: string) => {
    const currentSizes = formValues.size.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
    const newSizes = currentSizes.includes(s.toLowerCase()) 
      ? currentSizes.filter(x => x !== s.toLowerCase()) 
      : [...currentSizes, s.toLowerCase()];
    setFormValues({ ...formValues, size: newSizes.join(', ') });
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
        compare_at_price: formValues.compare_at_price ? parseFloat(formValues.compare_at_price) : null,
        category: formValues.category,
        sub_category: formValues.subCategory, 
        image_url: allMedia[0] || '',
        media: allMedia.slice(1),
        specifications: { size: formValues.size }
      };

      if (editingItem) {
        await supabase.from('products').update({ 
          ...basePayload, 
          sku: formValues.sku || editingItem.sku
        }).eq('id', editingItem.id);
      } else {
        const { error } = await supabase.from('products').insert([{ 
          ...basePayload, 
          sku: formValues.sku || generateUniqueId(formValues.name),
          slug: generateSlug(formValues.name) 
        }]);
        if (error) throw error;
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
    if (!confirm("Confirm permanent removal?")) return;
    setLoading(true);
    try {
      await supabase.from('products').delete().eq('id', id);
      fetchVault();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-archive">
      <header className="luxury-header">
        <div className="accent-line"></div>
        <div className="header-meta">
          <span>ENGINE_V3.0 // GLOBAL_VAULT</span>
          <span>UNIFIED_INVENTORY_SYSTEM</span>
        </div>
        <h1 className="luxury-title">ARCHIVE <span className="serif-italic">& Vault</span></h1>
      </header>

      <div className="admin-split-layout">
        <aside className="luxury-form-container">
          <h3 className="card-subtitle">{editingItem ? 'MODIFY RECORD' : 'NEW ENTRY'}</h3>
          <form onSubmit={handleSave} className="luxury-stack">
            
            <div className="input-group">
              <label>IDENTIFIER (PRODUCT NAME)</label>
              <input className="luxury-input" placeholder="e.g. CORE RUNNER" value={formValues.name} onChange={e => setFormValues({...formValues, name: e.target.value})} required />
            </div>

            <div className="input-group">
              <label>SIZE GRID</label>
              <div className="size-grid">
                {PRESET_SIZES.map(s => (
                  <button key={s} type="button" className={`luxury-size-btn ${formValues.size.toLowerCase().includes(s.toLowerCase()) ? 'active' : ''}`} onClick={() => toggleSize(s)}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
                <label>SKU (AUTO-GENERATED IF BLANK)</label>
                <input className="luxury-input" placeholder="AETH-XXXX" value={formValues.sku} onChange={e => setFormValues({...formValues, sku: e.target.value})} />
            </div>

            <div className="luxury-row">
              <div className="input-group">
                <label>SALE PRICE (₴)</label>
                <input className="luxury-input" type="number" step="1" placeholder="CURRENT" value={formValues.price} onChange={e => setFormValues({...formValues, price: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>PREVIOUS PRICE (₴)</label>
                <input className="luxury-input" type="number" step="1" placeholder="OPTIONAL" value={formValues.compare_at_price} onChange={e => setFormValues({...formValues, compare_at_price: e.target.value})} />
              </div>
            </div>

            <div className="luxury-row">
              <LuxurySelect 
                label="SECTOR" 
                value={formValues.subCategory} 
                options={ARCHIVE_CATEGORIES} 
                onChange={(val) => setFormValues({...formValues, subCategory: val})} 
              />
            </div>

            <div className="input-group">
              <label>MEDIA ASSETS</label>
              <div className="upload-block" onClick={() => fileInputRef.current?.click()}>
                <span>UPLOAD MEDIA +</span>
                <input type="file" ref={fileInputRef} hidden multiple accept="image/*,video/*" onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setSelectedFiles(prev => [...prev, ...files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]);
                }} />
              </div>
              <div className="preview-strip">
                {selectedFiles.map((f, i) => <img key={i} src={f.preview} className="mini-preview" />)}
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
            <input 
              type="text" 
              placeholder="SEARCH VAULT..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="luxury-search-input"
            />
          </div>

          <div className="table-header-luxury">
            <span>SKU</span>
            <span>IDENTIFIER</span>
            <span>PRICING</span>
            <span>CTRL</span>
          </div>

          <div className="inventory-scroll">
            {filteredItems.map(item => (
              <div key={item.id} className="inventory-row-luxury" onClick={() => setEditingItem(item)}>
                <span className="col-sku">{item.sku}</span>
                <span className="col-name">
                  {item.name}
                  <div className="row-sub-info">{item.sub_category?.replace('-', ' ')}</div>
                </span>
                <span className="col-price">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: item.compare_at_price ? '#ff4d4d' : '#fff' }}>₴{item.price}</span>
                    {item.compare_at_price && (
                      <span style={{ fontSize: '7px', textDecoration: 'line-through', color: '#444' }}>
                        ₴{item.compare_at_price}
                      </span>
                    )}
                  </div>
                </span>
                <span className="col-actions">
                  <button className="delete-btn" onClick={(e) => handleDelete(e, item.id)}>DEL</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .luxury-archive { padding: 40px; background: #000; min-height: 100vh; color: #fff; }
        .luxury-header { margin-bottom: 40px; }
        .accent-line { width: 30px; height: 1px; background: #d4af37; margin-bottom: 15px; }
        .header-meta { display: flex; justify-content: space-between; font-size: 8px; color: #444; letter-spacing: 2px; }
        .luxury-title { font-size: 4rem; font-weight: 200; margin: 0; text-transform: uppercase; }
        .serif-italic { font-family: serif; font-style: italic; color: #444; }
        .admin-split-layout { display: grid; grid-template-columns: 350px 1fr; gap: 50px; }
        .luxury-form-container { background: #111; padding: 25px; border: 1px solid #222; position: sticky; top: 20px; }
        .card-subtitle { font-size: 9px; color: #d4af37; letter-spacing: 3px; margin-bottom: 25px; }
        .luxury-stack { display: flex; flex-direction: column; gap: 20px; }
        .luxury-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .input-group label { display: block; font-size: 8px; color: #444; margin-bottom: 8px; letter-spacing: 1px; }
        .luxury-input { background: none; border: none; border-bottom: 1px solid #222; color: #fff; width: 100%; padding: 8px 0; outline: none; font-size: 12px; }
        .size-grid { display: flex; gap: 4px; flex-wrap: wrap; }
        .luxury-size-btn { background: none; border: 1px solid #222; color: #444; padding: 5px 8px; font-size: 9px; cursor: pointer; transition: 0.2s; }
        .luxury-size-btn.active { border-color: #d4af37; color: #fff; background: #1a1a1a; }
        .luxury-submit-btn { background: #fff; color: #000; border: none; padding: 15px; font-weight: 900; cursor: pointer; margin-top: 10px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; }
        .luxury-search-input { background: #050505; border: 1px solid #111; padding: 12px; color: #fff; width: 100%; margin-bottom: 20px; font-size: 10px; }
        .table-header-luxury, .inventory-row-luxury { display: grid; grid-template-columns: 140px 1fr 100px 60px; padding: 15px 0; border-bottom: 1px solid #111; font-size: 9px; }
        .table-header-luxury { color: #444; text-transform: uppercase; letter-spacing: 1px; }
        .inventory-row-luxury { cursor: pointer; transition: background 0.2s; }
        .inventory-row-luxury:hover { background: #050505; }
        .col-sku { color: #d4af37; font-family: monospace; }
        .row-sub-info { color: #444; margin-top: 4px; font-size: 7px; text-transform: uppercase; }
        .delete-btn { background: none; border: 1px solid #333; color: #444; font-size: 7px; padding: 4px; cursor: pointer; }
        .delete-btn:hover { border-color: #ff4d4d; color: #ff4d4d; }
        .upload-block { border: 1px dashed #222; padding: 20px; text-align: center; color: #444; font-size: 9px; cursor: pointer; }
        .preview-strip { display: flex; gap: 5px; margin-top: 10px; overflow-x: auto; }
        .mini-preview { width: 40px; height: 40px; object-fit: cover; border: 1px solid #222; }
        .cancel-btn { background: none; border: none; color: #444; font-size: 8px; cursor: pointer; text-decoration: underline; margin-top: 5px; }
      `}</style>
    </div>
  );
}