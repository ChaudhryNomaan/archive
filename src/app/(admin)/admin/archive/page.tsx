"use client";
import { useState, useEffect, useRef } from 'react';
import { CAT_MAP } from '@/lib/constants';
import { createClient } from '@/lib/supabase';

const PRESET_SIZES = ["xs", "s", "m", "l", "xl", "xxl", "os"];

const generateSlug = (name: string) => {
  const base = name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
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
        <span>{value?.toUpperCase() || 'SELECT...'}</span>
        <span className={`arrow ${isOpen ? 'up' : ''}`}>▼</span>
      </div>
      {isOpen && (
        <ul className="select-options">
          {options.map((opt) => (
            <li key={opt} className={opt === value ? "active" : ""} onClick={() => { onChange(opt); setIsOpen(false); }}>
              {opt.toUpperCase()}
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .luxury-select-container { position: relative; width: 100%; }
        .select-label { display: block; font-size: 9px; letter-spacing: 2px; color: #444; margin-bottom: 10px; font-weight: 700; }
        .select-trigger { border-bottom: 1px solid #222; padding: 10px 0; display: flex; justify-content: space-between; cursor: pointer; font-size: 15px; transition: border-color 0.3s; }
        .select-trigger:hover { border-color: #d4af37; }
        .arrow { font-size: 8px; transition: transform 0.3s; color: #444; }
        .arrow.up { transform: rotate(180deg); }
        .select-options { position: absolute; top: 100%; left: 0; right: 0; background: #0a0a0a; border: 1px solid #111; z-index: 100; margin: 0; padding: 0; list-style: none; max-height: 200px; overflow-y: auto; border-top: none; }
        .select-options li { padding: 12px 15px; font-size: 10px; letter-spacing: 1px; color: #666; cursor: pointer; }
        .select-options li:hover { background: #111; color: #fff; }
        .select-options li.active { color: #d4af37; background: #0c0c0c; }
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [formValues, setFormValues] = useState({
    name: '', sku: '', price: '', originalPrice: '', size: '',
    category: Object.keys(CAT_MAP)[0],
    subCategory: CAT_MAP[Object.keys(CAT_MAP)[0]][0],
  });

  const fetchVault = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.warn("Vault Sync: Products table empty.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVault(); }, []);

  useEffect(() => {
    if (editingItem) {
      setFormValues({
        name: editingItem.name || '',
        sku: editingItem.sku || '',
        price: editingItem.price?.toString() || '',
        originalPrice: editingItem.originalPrice?.toString() || '',
        size: editingItem.specifications?.size || '',
        category: editingItem.category || Object.keys(CAT_MAP)[0],
        subCategory: editingItem.sub_category || editingItem.subCategory || CAT_MAP[Object.keys(CAT_MAP)[0]][0],
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
      name: '', sku: '', price: '', originalPrice: '', size: '',
      category: Object.keys(CAT_MAP)[0],
      subCategory: CAT_MAP[Object.keys(CAT_MAP)[0]][0],
    });
  };

  const toggleSize = (s: string) => {
    const currentSizes = formValues.size.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
    const newSizes = currentSizes.includes(s) ? currentSizes.filter(x => x !== s) : [...currentSizes, s];
    setFormValues({ ...formValues, size: newSizes.join(', ') });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newEntries = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSelectedFiles(prev => [...prev, ...newEntries]);
  };

  const removeExisting = (url: string) => setExistingMedia(prev => prev.filter(item => item !== url));
  const removeStaged = (index: number) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newlyUploadedUrls: string[] = [];
      for (const entry of selectedFiles) {
        const fileExt = entry.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('vault').upload(fileName, entry.file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('vault').getPublicUrl(fileName);
        newlyUploadedUrls.push(publicUrl);
      }

      const allMedia = [...existingMedia, ...newlyUploadedUrls];
      const payload = {
        name: formValues.name,
        slug: editingItem ? editingItem.slug : generateSlug(formValues.name),
        sku: formValues.sku,
        price: parseFloat(formValues.price) || 0,
        category: formValues.category,
        sub_category: formValues.subCategory,
        image_url: allMedia[0] || '',
        media: allMedia.slice(1),
        specifications: { ...editingItem?.specifications, size: formValues.size }
      };

      const { error } = editingItem 
        ? await supabase.from('products').update(payload).eq('id', editingItem.id)
        : await supabase.from('products').insert([payload]);

      if (error) throw error;
      resetForm();
      await fetchVault();
    } catch (err: any) {
      alert(`Sync Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanent removal?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchVault();
  };

  return (
    <div className="luxury-archive">
      <header className="luxury-header">
        <div className="accent-line"></div>
        <div className="header-meta">
          <span>VAULT-MGMT-v4</span>
          <span>CURATED INVENTORY</span>
        </div>
        <h1 className="luxury-title">ARCHIVE <span className="serif-italic">& Vault</span></h1>
      </header>

      <div className="admin-split-layout">
        {/* Form is first in DOM for mobile accessibility when editing */}
        <aside className="luxury-form-container">
          <h3 className="card-subtitle">{editingItem ? 'MODIFY RECORD' : 'NEW ENTRY'}</h3>
          <form onSubmit={handleSave} className="luxury-stack">
            <div className="input-group">
              <label>PRODUCT IDENTIFIER</label>
              <input className="luxury-input" value={formValues.name} onChange={e => setFormValues({...formValues, name: e.target.value})} required />
            </div>

            <div className="input-group">
              <label>SIZE ARCHIVE</label>
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
                <label>SKU</label>
                <input className="luxury-input" value={formValues.sku} onChange={e => setFormValues({...formValues, sku: e.target.value})} required />
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
              <label>MEDIA ASSETS ({existingMedia.length + selectedFiles.length})</label>
              <div className="upload-block" onClick={() => fileInputRef.current?.click()}>
                <span>UPLOAD MEDIA +</span>
                <input type="file" ref={fileInputRef} hidden multiple accept="image/*,video/*" onChange={handleFileChange} />
              </div>
              <div className="preview-grid">
                {existingMedia.map((url, i) => (
                  <div key={`ex-${i}`} className="preview-item">
                    <img src={url} alt="existing" />
                    <button type="button" className="remove-overlay" onClick={() => removeExisting(url)}>REMOVE</button>
                  </div>
                ))}
                {selectedFiles.map((entry, i) => (
                  <div key={`st-${i}`} className="preview-item">
                    <img src={entry.preview} alt="staged" />
                    <button type="button" className="remove-overlay" onClick={() => removeStaged(i)}>REMOVE</button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="luxury-submit-btn">
              {loading ? 'SYNCHRONIZING...' : editingItem ? 'UPDATE ARCHIVE' : 'COMMIT TO VAULT'}
            </button>
            {editingItem && <button type="button" onClick={resetForm} className="cancel-btn">CANCEL</button>}
          </form>
        </aside>

        <div className="inventory-container">
          <div className="table-header-luxury">
            <span className="col-sku">REF</span>
            <span className="col-name">IDENTIFIER</span>
            <span className="col-price">VALUE</span>
            <span className="col-actions">CTRL</span>
          </div>

          <div className="inventory-scroll">
            {items.length === 0 && !loading && <p className="empty-msg">VAULT IS EMPTY</p>}
            {items.map(item => (
              <div key={item.id} className="inventory-row-luxury" onClick={() => setEditingItem(item)}>
                <span className="col-sku">{item.sku || 'N/A'}</span>
                <span className="col-name">
                  {item.name}
                  <div className="row-sub-info">{item.category} / {item.sub_category || 'General'}</div>
                </span>
                <span className="col-price">€{item.price}</span>
                <span className="col-actions">
                  <button className="text-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>DEL</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .luxury-archive { padding: 40px 20px; max-width: 1600px; margin: 0 auto; color: #fff; background: #000; min-height: 100vh; }
        .luxury-header { margin-bottom: 60px; }
        .accent-line { width: 40px; height: 1px; background: #d4af37; margin-bottom: 20px; }
        .header-meta { display: flex; justify-content: space-between; font-size: 8px; letter-spacing: 4px; color: #666; margin-bottom: 10px; text-transform: uppercase; }
        .luxury-title { font-size: clamp(2rem, 8vw, 5rem); font-weight: 200; letter-spacing: -2px; line-height: 0.9; text-transform: uppercase; margin: 0; }
        .serif-italic { font-family: serif; font-style: italic; color: #444; }
        
        .admin-split-layout { display: grid; grid-template-columns: 450px 1fr; gap: 60px; align-items: start; }
        
        .inventory-scroll { max-height: 80vh; overflow-y: auto; padding-right: 10px; }
        .inventory-scroll::-webkit-scrollbar { width: 2px; }
        .inventory-scroll::-webkit-scrollbar-thumb { background: #1a1a1a; }

        .table-header-luxury, .inventory-row-luxury { display: grid; grid-template-columns: 80px 1fr 80px 50px; gap: 15px; align-items: center; border-bottom: 1px solid #111; }
        .table-header-luxury { font-size: 8px; letter-spacing: 2px; color: #444; padding-bottom: 15px; text-transform: uppercase; }
        .inventory-row-luxury { padding: 20px 0; cursor: pointer; transition: 0.3s; }
        .inventory-row-luxury:hover { background: #050505; }
        
        .col-sku { color: #d4af37; font-size: 9px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; }
        .col-name { font-weight: 700; letter-spacing: 1px; font-size: 11px; text-transform: uppercase; }
        .row-sub-info { font-weight: 400; color: #444; font-size: 8px; margin-top: 4px; }
        .col-price { font-size: 11px; text-align: right; }
        
        .luxury-form-container { background: #050505; border: 1px solid #111; padding: 40px; position: sticky; top: 20px; }
        .card-subtitle { font-size: 10px; letter-spacing: 5px; color: #d4af37; margin-bottom: 40px; }
        .luxury-stack { display: flex; flex-direction: column; gap: 25px; }
        .input-group label { display: block; font-size: 9px; letter-spacing: 2px; color: #444; margin-bottom: 10px; font-weight: 700; }
        .luxury-input { background: transparent; border: none; border-bottom: 1px solid #222; color: #fff; width: 100%; padding: 10px 0; font-size: 14px; outline: none; border-radius: 0; }
        .luxury-input:focus { border-color: #d4af37; }
        
        .luxury-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .size-grid { display: flex; gap: 6px; flex-wrap: wrap; }
        .luxury-size-btn { background: none; border: 1px solid #222; color: #444; padding: 6px 10px; font-size: 9px; cursor: pointer; text-transform: uppercase; }
        .luxury-size-btn.active { border-color: #d4af37; color: #fff; }
        
        .upload-block { border: 1px dashed #222; padding: 20px; text-align: center; cursor: pointer; color: #444; font-size: 9px; letter-spacing: 2px; }
        .preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px; margin-top: 20px; }
        .preview-item { position: relative; aspect-ratio: 1; border: 1px solid #111; overflow: hidden; }
        .preview-item img { width: 100%; height: 100%; object-fit: cover; }
        .remove-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); color: #ff4444; font-size: 7px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; border: none; }
        .preview-item:hover .remove-overlay { opacity: 1; }
        
        .luxury-submit-btn { background: #fff; color: #000; border: none; padding: 20px; font-size: 10px; font-weight: 900; letter-spacing: 3px; cursor: pointer; margin-top: 10px; }
        .cancel-btn { background: none; border: none; color: #444; font-size: 9px; letter-spacing: 2px; cursor: pointer; text-transform: uppercase; margin-top: 10px; }
        .text-btn.delete { background: none; border: none; color: #444; font-size: 8px; cursor: pointer; }
        .text-btn.delete:hover { color: #ff4444; }

        /* Responsive Breakpoints */
        @media (max-width: 1100px) {
          .admin-split-layout { grid-template-columns: 1fr; gap: 40px; }
          .luxury-form-container { position: relative; top: 0; order: 1; }
          .inventory-container { order: 2; }
        }

        @media (max-width: 600px) {
          .luxury-archive { padding: 30px 15px; }
          .luxury-row { grid-template-columns: 1fr; }
          .table-header-luxury { grid-template-columns: 60px 1fr 60px; }
          .inventory-row-luxury { grid-template-columns: 60px 1fr 60px; }
          .col-actions { display: none; } /* Hide actions on small mobile, rely on row-click edit */
          .luxury-card { padding: 20px; }
        }
      `}</style>
    </div>
  );
}