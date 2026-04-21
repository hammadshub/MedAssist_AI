import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RiskBadge from '../components/RiskBadge';
import {
    Clock,
    ChevronDown,
    ChevronUp,
    Search,
    Loader2,
    AlertCircle,
    Tag,
    Download,
} from 'lucide-react';

export default function History() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/history');
            setHistory(res.data.history || []);
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = history.filter((item) =>
        item.raw_input?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const riskColor = (level) => {
        switch (level?.toUpperCase()) {
            case 'EMERGENCY': return 'text-red-700 bg-red-50 border-red-200';
            case 'URGENT': return 'text-orange-700 bg-orange-50 border-orange-200';
            case 'MODERATE': return 'text-amber-700 bg-amber-50 border-amber-200';
            default: return 'text-green-700 bg-green-50 border-green-200';
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 py-8 pb-16 animate-fade-in print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold font-display text-surface-900">Prediction History</h1>
                        <p className="text-sm text-surface-500 mt-1">{user?.name ? `${user.name} — ` : ''}{history.length} past analyses</p>
                    </div>

                    {history.length > 0 && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                                    bg-white border-2 border-surface-200 text-surface-700
                                    hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50
                                    transition-all shadow-sm"
                            >
                                <Download className="w-4 h-4" /> Download History
                            </button>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input
                                    type="text"
                                    placeholder="Search history..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 rounded-xl border border-surface-200 bg-white text-sm
                                 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all w-64"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {filtered.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                        <p className="text-surface-500 font-medium">
                            {history.length === 0 ? 'No predictions yet' : 'No results match your search'}
                        </p>
                        <p className="text-surface-400 text-sm mt-1">
                            {history.length === 0 && 'Start by analyzing your symptoms on the home page.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((item) => (
                            <div key={item.id} className="glass-card overflow-hidden transition-all duration-300 hover:shadow-lg">
                                <button
                                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                                    className="w-full p-5 flex items-center justify-between text-left"
                                >
                                    <div className="flex-1 min-w-0 mr-4">
                                        <p className="text-sm font-medium text-surface-800 truncate">{item.raw_input}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="flex items-center gap-1 text-xs text-surface-400">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(item.created_at)}
                                            </span>
                                            <RiskBadge level={item.risk_level} />
                                        </div>
                                    </div>
                                    {expanded === item.id ? (
                                        <ChevronUp className="w-5 h-5 text-surface-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-surface-400" />
                                    )}
                                </button>

                                {expanded === item.id && (
                                    <div className="px-5 pb-5 border-t border-surface-100 pt-4 animate-slide-down">
                                        <div className="mb-4">
                                            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                <Tag className="w-3 h-3" /> Extracted Symptoms
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(item.extracted_kw || []).map((kw) => (
                                                    <span key={kw} className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                                                        {kw.replace(/_/g, ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Predictions</h4>
                                            <div className="grid gap-2">
                                                {(item.top_diseases || []).map((pred, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-50">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-surface-400">#{i + 1}</span>
                                                            <span className="text-sm font-medium text-surface-700">{pred.disease}</span>
                                                        </div>
                                                        <span className="text-sm font-semibold text-primary-600">{pred.confidence}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {item.red_flags && item.red_flags.length > 0 && (
                                            <div className="p-3 rounded-xl bg-danger-50 border border-danger-100">
                                                <h4 className="text-xs font-semibold text-danger-700 uppercase mb-1">Red Flags Detected</h4>
                                                {item.red_flags.map((flag, i) => (
                                                    <p key={i} className="text-xs text-danger-600">{flag.name}: {flag.message}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="hidden print:block bg-white text-black max-w-4xl mx-auto font-sans print-history">
                <div className="flex justify-between items-end border-b-[3px] border-surface-900 pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-surface-900 mb-1">MedAssist AI</h1>
                        <p className="text-sm font-bold tracking-widest text-surface-500 uppercase">Prediction History Report</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-surface-800">Patient: {user?.name || 'N/A'}</p>
                        <p className="text-sm font-semibold text-surface-800">Date: {new Date().toLocaleDateString()}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{history.length} Total Analyses</p>
                    </div>
                </div>
                {history.map((item, idx) => (
                    <div key={item.id} className="history-entry mb-8 pb-6 border-b border-surface-200 last:border-b-0">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold text-surface-800">
                                Entry #{idx + 1}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded border ${riskColor(item.risk_level)}`}>
                                    {item.risk_level || 'LOW'}
                                </span>
                                <span className="text-xs text-surface-500 font-medium">
                                    {formatDate(item.created_at)}
                                </span>
                            </div>
                        </div>
                        <div className="mb-3">
                            <h3 className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-1">Description</h3>
                            <p className="text-sm italic text-surface-700 bg-surface-50 p-3 rounded border border-surface-200">
                                "{item.raw_input || 'No description'}"
                            </p>
                        </div>
                        {item.extracted_kw && item.extracted_kw.length > 0 && (
                            <div className="mb-3">
                                <h3 className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-1">Extracted Symptoms</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {item.extracted_kw.map((kw) => (
                                        <span key={kw} className="px-2 py-0.5 bg-surface-100 text-surface-800 text-xs font-bold rounded-md border border-surface-300">
                                            {kw.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {item.top_diseases && item.top_diseases.length > 0 && (
                            <div className="mb-3">
                                <h3 className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-1">Predictions</h3>
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-surface-100 border-y border-surface-300">
                                            <th className="py-1.5 px-3 font-bold text-surface-600 w-10">#</th>
                                            <th className="py-1.5 px-3 font-bold text-surface-600">Disease</th>
                                            <th className="py-1.5 px-3 font-bold text-surface-600 w-24 text-right">Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.top_diseases.map((pred, i) => (
                                            <tr key={i} className="border-b border-surface-200">
                                                <td className="py-1.5 px-3 text-surface-500 font-bold">{i + 1}</td>
                                                <td className="py-1.5 px-3 font-semibold text-surface-800">{pred.disease}</td>
                                                <td className="py-1.5 px-3 text-right font-bold text-surface-700">{pred.confidence}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {item.red_flags && item.red_flags.length > 0 && (
                            <div className="p-3 border-2 border-red-300 bg-red-50 rounded">
                                <h3 className="text-xs font-bold text-red-700 uppercase mb-1">Red Flags Detected</h3>
                                {item.red_flags.map((flag, i) => (
                                    <p key={i} className="text-xs text-red-600 font-medium">{flag.name}: {flag.message}</p>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <div className="mt-12 pt-5 border-t-[3px] border-surface-900 text-xs text-surface-500 text-center font-medium">
                    <p>Generated by MedAssist AI — For informational purposes only. Not a substitute for professional medical advice.</p>
                </div>
            </div>
        </>
    );
}
