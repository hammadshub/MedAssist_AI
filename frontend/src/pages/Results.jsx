import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PredictionCard from '../components/PredictionCard';
import RiskBadge from '../components/RiskBadge';
import RedFlagAlert from '../components/RedFlagAlert';
import {
    ArrowLeft,
    ClipboardList,
    UserCheck,
    Lightbulb,
    Tag,
    FlaskConical,
    Stethoscope,
    HeartPulse,
    FileText,
    Download
} from 'lucide-react';

export default function Results() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const result = location.state?.result;

    if (!result) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
                <p className="text-surface-500 mb-4">No results to display.</p>
                <button onClick={() => navigate('/')} className="btn-primary">
                    Go to Symptom Analysis
                </button>
            </div>
        );
    }

    const {
        predictions = [],
        risk_level,
        red_flags = [],
        emergency_message,
        extracted_symptoms = [],
        recommendations = {},
        disclaimer,
        raw_input,
    } = result;

    const isEmergency = risk_level === 'EMERGENCY' || risk_level === 'URGENT';

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 py-8 pb-20 animate-fade-in print:hidden">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> New Analysis
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-surface-900">Analysis Results</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-white border-2 border-surface-200 text-surface-700 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm"
                        >
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                        <RiskBadge level={risk_level} />
                    </div>
                </div>
                <RedFlagAlert redFlags={red_flags} emergencyMessage={emergency_message} />
                {predictions.length > 0 && (
                    <div className="mb-8 mt-2">
                        <PredictionCard prediction={predictions[0]} rank={0} isHero={true} />
                    </div>
                )}
                {predictions.length > 1 && (
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-surface-600 flex items-center gap-2 mb-3 ml-1">
                            <ClipboardList className="w-4 h-4" /> Alternative Possibilities
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {predictions.slice(1).map((pred, i) => (
                                <PredictionCard key={pred.disease} prediction={pred} rank={i + 1} isHero={false} />
                            ))}
                        </div>
                    </div>
                )}
                {!isEmergency && recommendations && Object.keys(recommendations).length > 0 && (
                    <div className="glass-card p-5 mb-8 border-emerald-400">
                        <h3 className="text-sm font-semibold text-surface-600 flex items-center gap-2 mb-4">
                            <Lightbulb className="w-4 h-4" />
                            Recommendations for {predictions[0]?.disease}
                        </h3>

                        <div className="grid gap-4 md:grid-cols-3">
                            {recommendations.lab_tests && (
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 shadow-sm">
                                    <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                        <FlaskConical className="w-3.5 h-3.5" /> Lab Tests
                                    </h4>
                                    <p className="text-sm text-blue-800">{recommendations.lab_tests}</p>
                                </div>
                            )}

                            {recommendations.specialist && (
                                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 shadow-sm">
                                    <h4 className="text-xs font-semibold text-violet-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                        <UserCheck className="w-3.5 h-3.5" /> Specialist
                                    </h4>
                                    <p className="text-sm text-violet-800">{recommendations.specialist}</p>
                                </div>
                            )}

                            {recommendations.lifestyle_tips && (
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm">
                                    <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                        <HeartPulse className="w-3.5 h-3.5" /> Lifestyle Tips
                                    </h4>
                                    <p className="text-sm text-emerald-800">{recommendations.lifestyle_tips}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="glass-card p-6 border-surface-400 mb-6 bg-white/70">
                    <h3 className="text-sm font-semibold text-surface-600 flex items-center gap-2 mb-4">
                        <FileText className="w-4 h-4" /> Patient Context Report
                    </h3>
                    <div className="mb-5">
                        <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Initial Description</p>
                        <p className="text-base font-medium text-surface-800 italic bg-surface-100/50 p-4 rounded-xl border border-surface-200">
                            "{raw_input || 'No description provided'}"
                        </p>
                    </div>
                    {extracted_symptoms.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" /> Identified Medical Terminology
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {extracted_symptoms.map((sym) => (
                                    <span key={sym} className="px-3 py-1.5 rounded-full bg-surface-100 text-surface-700 text-xs font-semibold border border-surface-300">
                                        {sym.replace(/_/g, ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {disclaimer && (
                    <div className="glass-card p-5 border-l-4 border-amber-400 bg-amber-50/30">
                        <div className="flex items-start gap-3">
                            <Stethoscope className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-surface-700">{disclaimer}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="hidden print:block print-report bg-white text-black font-sans">
                <div className="flex justify-between items-end border-b-[3px] border-surface-900 pb-3 mb-5">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-surface-900 mb-0.5">MedAssist AI</h1>
                        <p className="text-sm font-bold tracking-widest text-surface-500 uppercase">Diagnostic Report</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-surface-800">Patient: {user?.name || 'N/A'}</p>
                        <p className="text-sm font-semibold text-surface-800">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <div>
                        <div className="mb-5">
                            <h2 className="text-base font-bold border-b-2 border-surface-200 pb-2 mb-3 text-surface-800">1. Patient Context</h2>
                            <div className="mb-3">
                                <h3 className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5">Initial Description</h3>
                                <p className="text-sm font-medium italic text-surface-700 bg-surface-50 p-3 rounded border border-surface-200">
                                    "{raw_input || 'No description provided'}"
                                </p>
                            </div>
                            {extracted_symptoms.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-1.5">Identified Medical Symptoms</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {extracted_symptoms.map(sym => (
                                            <span key={sym} className="px-2.5 py-1 bg-surface-100 text-surface-800 text-xs font-bold rounded border border-surface-300">
                                                {sym.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mb-5">
                            <h2 className="text-base font-bold border-b-2 border-surface-200 pb-2 mb-3 text-surface-800">2. Diagnostic Assessment</h2>

                            {isEmergency ? (
                                <div className="p-4 border-2 border-red-500 bg-red-50 text-red-800 rounded mb-3">
                                    <h3 className="font-bold text-red-900 uppercase text-sm">CRITICAL WARNING</h3>
                                    <p className="text-sm font-semibold mt-1">{emergency_message}</p>
                                    <p className="text-xs mt-2 font-bold tracking-widest uppercase text-red-600">Triggered: {red_flags.join(', ')}</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-surface-100 border-y-2 border-surface-300">
                                            <th className="py-2.5 px-3 font-bold text-surface-600 w-10">#</th>
                                            <th className="py-2.5 px-3 font-bold text-surface-600">Predicted Disease Target</th>
                                            <th className="py-2.5 px-3 font-bold text-surface-600 w-24 text-right">Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {predictions.map((p, i) => (
                                            <tr key={p.disease} className="border-b border-surface-200">
                                                <td className="py-3 px-3 text-surface-500 font-bold">{i + 1}</td>
                                                <td className="py-3 px-3 font-bold text-surface-900 text-sm">{p.disease}
                                                    <p className="text-xs text-surface-500 font-semibold mt-0.5 max-w-[500px] leading-relaxed">{p.description}</p>
                                                </td>
                                                <td className="py-3 px-3 text-right font-bold text-surface-800">{p.confidence}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        {!isEmergency && recommendations && Object.keys(recommendations).length > 0 && (
                            <div className="mb-5">
                                <h2 className="text-base font-bold border-b-2 border-surface-200 pb-2 mb-3 text-surface-800">3. Actionable Care Plan</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {recommendations.lab_tests && (
                                        <div className="p-3 border border-surface-300 rounded bg-surface-50">
                                            <h3 className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-1">Recommended Lab Testing</h3>
                                            <p className="text-sm font-bold text-surface-800">{recommendations.lab_tests}</p>
                                        </div>
                                    )}
                                    {recommendations.specialist && (
                                        <div className="p-3 border border-surface-300 rounded bg-surface-50">
                                            <h3 className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-1">Recommended Specialist</h3>
                                            <p className="text-sm font-bold text-surface-800">{recommendations.specialist}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
            </div>
        </>
    );
}
