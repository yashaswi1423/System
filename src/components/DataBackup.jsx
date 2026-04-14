import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, AlertTriangle } from 'lucide-react';

const BACKUP_KEY = 'sls_last_backup';

export default function DataBackup() {
  const fileRef = useRef(null);
  const [lastBackup, setLastBackup] = useState(() => localStorage.getItem(BACKUP_KEY));
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!lastBackup) { setShowWarning(true); return; }
    const daysSince = (Date.now() - Number(lastBackup)) / 86400000;
    setShowWarning(daysSince >= 3);
  }, [lastBackup]);

  const handleExport = () => {
    const data = localStorage.getItem('solo-leveling-system');
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sls-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const now = String(Date.now());
    localStorage.setItem(BACKUP_KEY, now);
    setLastBackup(now);
    setShowWarning(false);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.state) { alert('Invalid backup file.'); return; }
        localStorage.setItem('solo-leveling-system', ev.target.result);
        alert('Data restored! Reloading...');
        window.location.reload();
      } catch {
        alert('Failed to read backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const daysSince = lastBackup
    ? Math.floor((Date.now() - Number(lastBackup)) / 86400000)
    : null;

  return (
    <div style={{
      padding: '12px 14px',
      background: showWarning ? 'rgba(255,170,0,0.06)' : 'rgba(4,18,37,0.7)',
      border: `1px solid ${showWarning ? 'rgba(255,170,0,0.3)' : 'rgba(0,245,255,0.12)'}`,
      backdropFilter: 'blur(12px)',
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {showWarning && <AlertTriangle size={12} color="#ffaa00" />}
          <span style={{ fontSize: 10, color: showWarning ? '#ffaa00' : '#7ab8d4',
            letterSpacing: 2, fontFamily: 'Orbitron' }}>
            DATA BACKUP
          </span>
        </div>
        <span style={{ fontSize: 10, color: '#7ab8d4' }}>
          {daysSince === null ? 'Never backed up' :
           daysSince === 0 ? 'Backed up today' :
           `${daysSince}d ago`}
        </span>
      </div>

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: 8 }}
          >
            <div style={{ fontSize: 11, color: '#ffaa00', lineHeight: 1.4 }}>
              ⚠ Back up your data — localStorage can be cleared by the browser.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button whileTap={{ scale: 0.95 }} className="btn-neon" onClick={handleExport}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: '10px 8px', fontSize: 12,
            borderColor: showWarning ? '#ffaa00' : undefined,
            color: showWarning ? '#ffaa00' : undefined }}>
          <Download size={13} /> EXPORT
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="btn-neon"
          onClick={() => fileRef.current?.click()}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: '10px 8px', fontSize: 12,
            borderColor: '#aa88ff', color: '#aa88ff' }}>
          <Upload size={13} /> IMPORT
        </motion.button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
      </div>

      <div style={{ fontSize: 10, color: '#7ab8d4', marginTop: 8, lineHeight: 1.5 }}>
        Save the .json file to Google Drive or WhatsApp Saved Messages
      </div>
    </div>
  );
}
