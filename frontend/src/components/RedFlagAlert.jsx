import { AlertOctagon, Phone, AlertTriangle } from 'lucide-react';

export default function RedFlagAlert({ redFlags, emergencyMessage }) {
    if (!redFlags || redFlags.length === 0) return null;

    return (
        <div className="animate-fade-in rounded-2xl border-2 border-danger-300 bg-gradient-to-r from-danger-50 to-danger-100/60 p-5 mb-6">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--gradient-danger)' }}>
                    <AlertOctagon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-danger-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Emergency Warning
                    </h3>
                    {emergencyMessage && (
                        <p className="mt-1 text-sm font-semibold text-danger-700">{emergencyMessage}</p>
                    )}
                    <ul className="mt-3 space-y-2">
                        {redFlags.map((flag, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-danger-700">
                                <span className="mt-0.5 w-2 h-2 rounded-full bg-danger-500 flex-shrink-0" />
                                <span>
                                    <strong>{flag.name}</strong>
                                    {flag.message && ` – ${flag.message}`}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-danger-800 bg-danger-200/60 px-3 py-2 rounded-lg">
                        <Phone className="w-3.5 h-3.5" />
                        If this is an emergency, call your local emergency services immediately.
                    </div>
                </div>
            </div>
        </div>
    );
}
