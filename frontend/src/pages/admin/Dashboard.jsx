import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    X,
    Shield,
    Pill,
    AlertTriangle,
    Settings,
    CheckCircle,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────
   Admin Dashboard with tabbed CRUD for
   Diseases, Symptoms, and Red-Flag Rules
   ────────────────────────────────────────────────────── */

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('diseases');

    const tabs = [
        { key: 'diseases', label: 'Diseases', icon: Pill },
        { key: 'symptoms', label: 'Symptoms', icon: Settings },
        { key: 'rules', label: 'Red-Flag Rules', icon: AlertTriangle },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 pb-16 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--gradient-primary)' }}>
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold font-display text-surface-900">Admin Panel</h1>
                    <p className="text-sm text-surface-500">Manage diseases, symptoms & rules</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-surface-100 rounded-xl mb-6 overflow-x-auto">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-shrink-0
              ${activeTab === key
                                ? 'bg-white text-primary-700 shadow-sm'
                                : 'text-surface-500 hover:text-surface-700'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'diseases' && <DiseasesPanel />}
            {activeTab === 'symptoms' && <SymptomsPanel />}
            {activeTab === 'rules' && <RulesPanel />}
        </div>
    );
}


/* ─── Diseases Panel ─────────────────────────────────── */
function DiseasesPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', category: '', description: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/diseases');
            setItems(res.data.diseases || []);
        } catch { } finally { setLoading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing && editing !== 'new') {
                await api.put(`/admin/diseases/${editing}`, form);
            } else {
                await api.post('/admin/diseases', form);
            }
            setEditing(null);
            setForm({ name: '', category: '', description: '' });
            load();
        } catch { } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this disease?')) return;
        await api.delete(`/admin/diseases/${id}`);
        load();
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-800">{items.length} Diseases</h2>
                <button onClick={() => { setEditing('new'); setForm({ name: '', category: '', description: '' }); }}
                    className="btn-primary text-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Disease
                </button>
            </div>

            {/* Edit form */}
            {editing && (
                <div className="glass-card p-5 mb-4 animate-slide-down">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-surface-700">{editing === 'new' ? 'Add Disease' : 'Edit Disease'}</h3>
                        <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-surface-400" /></button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <input className="input-field" placeholder="Disease name" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input className="input-field" placeholder="Category (e.g. Gastrointestinal)" value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })} />
                    </div>
                    <textarea className="input-field mt-3" rows={2} placeholder="Description" value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <div className="mt-3 flex justify-end">
                        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="glass-card p-4 flex items-center justify-between group">
                        <div>
                            <p className="font-medium text-surface-800">{item.name}</p>
                            <p className="text-xs text-surface-400">{item.category}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditing(item.id); setForm(item); }}
                                className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-primary-600">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id)}
                                className="p-2 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-600">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


/* ─── Symptoms Panel ─────────────────────────────────── */
function SymptomsPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', aliases: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/symptoms');
            setItems(res.data.symptoms || []);
        } catch { } finally { setLoading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing && editing !== 'new') {
                await api.put(`/admin/symptoms/${editing}`, form);
            } else {
                await api.post('/admin/symptoms', form);
            }
            setEditing(null);
            setForm({ name: '', aliases: '' });
            load();
        } catch { } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this symptom?')) return;
        await api.delete(`/admin/symptoms/${id}`);
        load();
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-800">{items.length} Symptoms</h2>
                <button onClick={() => { setEditing('new'); setForm({ name: '', aliases: '' }); }}
                    className="btn-primary text-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Symptom
                </button>
            </div>

            {editing && (
                <div className="glass-card p-5 mb-4 animate-slide-down">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-surface-700">{editing === 'new' ? 'Add Symptom' : 'Edit Symptom'}</h3>
                        <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-surface-400" /></button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <input className="input-field" placeholder="Canonical name" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input className="input-field" placeholder="Aliases (comma-separated)" value={form.aliases}
                            onChange={(e) => setForm({ ...form, aliases: e.target.value })} />
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="glass-card p-4 flex items-center justify-between group">
                        <div>
                            <p className="font-medium text-surface-800">{item.name}</p>
                            <p className="text-xs text-surface-400 truncate max-w-md">{item.aliases}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditing(item.id); setForm(item); }}
                                className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-primary-600">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id)}
                                className="p-2 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-600">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


/* ─── Red-Flag Rules Panel ───────────────────────────── */
function RulesPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', symptom_combo: [], category: '', risk_level: 'HIGH', message: '' });
    const [comboInput, setComboInput] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/rules');
            setItems(res.data.rules || []);
        } catch { } finally { setLoading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        const combo = comboInput.split(',').map(s => s.trim()).filter(Boolean);
        try {
            const payload = { ...form, symptom_combo: combo };
            if (editing && editing !== 'new') {
                await api.put(`/admin/rules/${editing}`, payload);
            } else {
                await api.post('/admin/rules', payload);
            }
            setEditing(null);
            setForm({ name: '', symptom_combo: [], category: '', risk_level: 'HIGH', message: '' });
            setComboInput('');
            load();
        } catch { } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this rule?')) return;
        await api.delete(`/admin/rules/${id}`);
        load();
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-800">{items.length} Red-Flag Rules</h2>
                <button onClick={() => {
                    setEditing('new');
                    setForm({ name: '', symptom_combo: [], category: '', risk_level: 'HIGH', message: '' });
                    setComboInput('');
                }} className="btn-primary text-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Rule
                </button>
            </div>

            {editing && (
                <div className="glass-card p-5 mb-4 animate-slide-down">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-surface-700">{editing === 'new' ? 'Add Rule' : 'Edit Rule'}</h3>
                        <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-surface-400" /></button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <input className="input-field" placeholder="Rule name" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input className="input-field" placeholder="Category" value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })} />
                        <input className="input-field" placeholder="Symptom combo (comma-separated)" value={comboInput}
                            onChange={(e) => setComboInput(e.target.value)} />
                        <select className="input-field" value={form.risk_level}
                            onChange={(e) => setForm({ ...form, risk_level: e.target.value })}>
                            <option value="HIGH">HIGH</option>
                            <option value="URGENT">URGENT</option>
                            <option value="EMERGENCY">EMERGENCY</option>
                        </select>
                    </div>
                    <textarea className="input-field mt-3" rows={2} placeholder="Warning message" value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    <div className="mt-3 flex justify-end">
                        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="glass-card p-4 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-surface-800">{item.name}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${item.risk_level === 'EMERGENCY' ? 'bg-danger-100 text-danger-700'
                                            : item.risk_level === 'URGENT' ? 'bg-amber-100 text-amber-700'
                                                : 'bg-orange-100 text-orange-700'}`}>
                                        {item.risk_level}
                                    </span>
                                </div>
                                <p className="text-xs text-surface-400 mt-1">{item.category} • {(item.symptom_combo || []).join(', ')}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => {
                                    setEditing(item.id);
                                    setForm(item);
                                    setComboInput((item.symptom_combo || []).join(', '));
                                }}
                                    className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-primary-600">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)}
                                    className="p-2 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

