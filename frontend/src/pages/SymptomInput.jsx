import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Search,
    Loader2,
    Sparkles,
    Send,
    Bot,
    User,
    AlertCircle,
    Check,
    X,
    HelpCircle,
    Heart,
    Brain,
    Stethoscope,
    Activity,
    Wind,
    Bone,
    Thermometer,
    Shield,
    MessageCircle,
    ClipboardList,
    FileText,
    Droplets,
    ChevronDown
} from 'lucide-react';

const LEFT_CATEGORIES = [
    { icon: Activity, label: 'Gastrointestinal', desc: 'Digestive system problems', count: 4, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', diseases: ['GERD', 'Gastroenteritis', 'Peptic Ulcer Disease', 'Hemorrhoids (Piles)'] },
    { icon: Stethoscope, label: 'Hepatic', desc: 'Liver-related disorders', count: 8, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', diseases: ['Hepatitis A', 'Hepatitis B', 'Hepatitis C', 'Hepatitis D', 'Hepatitis E', 'Alcoholic Hepatitis', 'Jaundice', 'Chronic Cholestasis'] },
    { icon: Heart, label: 'Cardiovascular', desc: 'Heart & circulation issues', count: 3, color: 'text-red-600', bg: 'bg-red-50 border-red-100', diseases: ['Heart Attack', 'Hypertension', 'Varicose Veins'] },
    { icon: Brain, label: 'Neurological', desc: 'Brain & nerve disorders', count: 3, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100', diseases: ['Migraine', 'Paralysis (Brain Hemorrhage)', 'Positional Vertigo'] },
    { icon: AlertCircle, label: 'Infectious', desc: 'Viral & bacterial infections', count: 6, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', diseases: ['AIDS', 'Chicken Pox', 'Common Cold', 'Dengue', 'Malaria', 'Typhoid'] },
    { icon: Sparkles, label: 'Dermatology', desc: 'Skin conditions & rashes', count: 4, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-100', diseases: ['Acne', 'Psoriasis', 'Fungal Infection', 'Impetigo'] },
];

const RIGHT_CATEGORIES = [
    { icon: Wind, label: 'Respiratory', desc: 'Lung & breathing issues', count: 3, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100', diseases: ['Bronchial Asthma', 'Pneumonia', 'Tuberculosis'] },
    { icon: Thermometer, label: 'Metabolic', desc: 'Hormonal & endocrine', count: 4, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', diseases: ['Diabetes', 'Hyperthyroidism', 'Hypothyroidism', 'Hypoglycemia'] },
    { icon: Bone, label: 'Orthopedic', desc: 'Bone & joint conditions', count: 3, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100', diseases: ['Arthritis', 'Cervical Spondylosis', 'Osteoarthritis'] },
    { icon: Shield, label: 'Immunology', desc: 'Immune & allergic reactions', count: 2, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', diseases: ['Allergy', 'Drug Reaction'] },
    { icon: Droplets, label: 'Urological', desc: 'Urinary system disorders', count: 1, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100', diseases: ['Urinary Tract Infection'] },
];

const EXAMPLE_PROMPTS = [
    "I have yellow skin, dark urine, and stomach pain for 3 days",
    "High fever with shivering, sweating, and body ache",
    "Red itchy spots all over my body and a mild fever",
    "Chest pain with shortness of breath and dizziness",
    "Severe headache, sensitivity to light, and visual disturbances"
];

export default function SymptomInput() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm MedAssist AI. Please describe the symptoms you are experiencing in detail, and I'll help you assess them.",
            type: 'text'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [knownSymptoms, setKnownSymptoms] = useState([]);
    const [absentSymptoms, setAbsentSymptoms] = useState([]);
    const [currentQuestionSymptom, setCurrentQuestionSymptom] = useState(null);
    const [initialMessage, setInitialMessage] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);

    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = inputText.trim();
        setInputText('');

        setMessages(prev => [...prev, { role: 'user', content: userMsg, type: 'text' }]);
        await processTurn(userMsg, knownSymptoms, absentSymptoms, true);
    };

    const handleAnswerQuestion = async (answer) => {
        if (!currentQuestionSymptom) return;

        let newKnown = [...knownSymptoms];
        let newAbsent = [...absentSymptoms];
        let userReply = "Unsure";

        if (answer === 'yes') {
            if (!newKnown.includes(currentQuestionSymptom)) newKnown.push(currentQuestionSymptom);
            userReply = "Yes";
        } else if (answer === 'no') {
            if (!newAbsent.includes(currentQuestionSymptom)) newAbsent.push(currentQuestionSymptom);
            userReply = "No";
        } else {
            if (!newAbsent.includes(currentQuestionSymptom)) newAbsent.push(currentQuestionSymptom);
        }

        setKnownSymptoms(newKnown);
        setAbsentSymptoms(newAbsent);
        setCurrentQuestionSymptom(null);

        setMessages(prev => {
            const copy = [...prev];
            if (copy.length > 0 && copy[copy.length - 1].role === 'assistant') {
                copy[copy.length - 1].type = 'text';
            }
            return [...copy, { role: 'user', content: userReply, type: 'text' }];
        });

        await processTurn("", newKnown, newAbsent);
    };

    const processTurn = async (messageText, currentKnown, currentAbsent, isFirst = false) => {
        setError('');
        setLoading(true);

        const currentInitialMsg = isFirst ? messageText : initialMessage;
        if (isFirst) setInitialMessage(messageText);

        try {
            const res = await api.post('/chat', {
                message: messageText,
                initial_message: currentInitialMsg,
                known_symptoms: currentKnown,
                absent_symptoms: currentAbsent
            });

            const data = res.data;
            setKnownSymptoms(data.known_symptoms || currentKnown);
            setAbsentSymptoms(data.absent_symptoms || currentAbsent);

            if (data.status === 'completed') {
                navigate('/results', { state: { result: data } });
            } else if (data.status === 'in_progress') {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.question,
                    type: data.next_symptom ? 'question' : 'text'
                }]);
                setCurrentQuestionSymptom(data.next_symptom || null);
            }

        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleExampleClick = (prompt) => {
        setInputText(prompt);
    };

    const isAwaitingFirstInput = messages.length === 1;
    const isAwaitingAnswer = currentQuestionSymptom !== null && !loading;

    return (
        <div className="xl:grid xl:grid-cols-[280px_1fr_280px] xl:gap-5 max-w-[1440px] mx-auto px-4 py-6 animate-fade-in h-[calc(100vh-100px)]">

            {/* ── Left Sidebar: Disease Categories ── */}
            <aside className="hidden xl:flex flex-col gap-2 py-4 self-start sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
                <h3 className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-1 px-1">Diagnostic Areas</h3>
                {LEFT_CATEGORIES.map((cat) => {
                    const isExpanded = expandedCategory === cat.label;
                    return (
                        <div key={cat.label}>
                            <button onClick={() => setExpandedCategory(isExpanded ? null : cat.label)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border w-full text-left transition-all duration-200 hover:shadow-md ${isExpanded ? 'shadow-md border-opacity-60' : ''} ${cat.bg}`}>
                                <div className={`${cat.color} flex-shrink-0`}><cat.icon className="w-4.5 h-4.5" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[13px] font-semibold ${cat.color} leading-tight`}>{cat.label}</p>
                                    <p className="text-[10px] text-surface-500 leading-snug">{cat.desc}</p>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-surface-400 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`accordion-grid ${isExpanded ? 'open' : ''}`}>
                                <div>
                                    <div className={`mt-1.5 mb-1 mx-1 p-2 rounded-lg bg-white/70 border ${cat.bg} flex flex-wrap gap-1.5`}>
                                        {cat.diseases.map((d) => (
                                            <span key={d} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${cat.color} bg-white border ${cat.bg}`}>
                                                <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className="mt-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50 border border-primary-100 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-primary-100 flex items-center justify-center">
                            <Stethoscope className="w-3 h-3 text-primary-600" />
                        </div>
                        <p className="text-[11px] font-bold text-primary-700">41 Diseases <span className="text-primary-500 font-medium">Covered</span></p>
                    </div>
                </div>
            </aside>

            {/* ── Center: Chat Interface ── */}
            <div className="flex flex-col min-w-0">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Interactive Diagnostic Assistant
                    </div>
                    <h1 className="text-3xl font-bold font-display text-surface-900">
                        Symptom <span className="gradient-text">Analysis</span>
                    </h1>
                </div>
                {isAwaitingFirstInput && (
                    <div className="mb-6 hidden sm:block xl:hidden animate-slide-up">
                        <p className="text-xs font-bold text-surface-400 text-center uppercase tracking-widest mb-3">Supported Categories</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {[...LEFT_CATEGORIES, ...RIGHT_CATEGORIES].map(({ icon: Icon, label, color }) => (
                                <span key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-white/80 shadow-sm ${color}`}>
                                    <Icon className="w-3.5 h-3.5" />{label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex-1 glass-card p-4 md:p-6 mb-6 flex flex-col overflow-hidden shadow-lg border border-surface-200 bg-white">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-down`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-5 h-5 text-primary-600" />
                                    </div>
                                )}
                                <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-tr-sm'
                                    : 'bg-surface-100 text-surface-800 rounded-tl-sm border border-surface-200'
                                    }`}>
                                    <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                                    {msg.role === 'assistant' && msg.type === 'question' && idx === messages.length - 1 && !loading && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button onClick={() => handleAnswerQuestion('yes')} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium">
                                                <Check className="w-4 h-4" /> Yes
                                            </button>
                                            <button onClick={() => handleAnswerQuestion('no')} className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-sm font-medium">
                                                <X className="w-4 h-4" /> No
                                            </button>
                                            <button onClick={() => handleAnswerQuestion('unsure')} className="flex items-center gap-1.5 px-4 py-2 bg-surface-200 text-surface-700 border border-surface-300 rounded-lg hover:bg-surface-300 transition-colors text-sm font-medium">
                                                <HelpCircle className="w-4 h-4" /> Unsure
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-surface-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3 justify-start animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                    <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                                </div>
                                <div className="bg-surface-100 text-surface-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-surface-200">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    {error && (
                        <div className="mb-3 flex items-start gap-2 px-4 py-3 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm animate-slide-down">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
                        </div>
                    )}
                    {!isAwaitingAnswer && (
                        <div className="pt-2">
                            {isAwaitingFirstInput && (
                                <div className="mb-3">
                                    <p className="text-xs font-semibold text-surface-400 mb-2">TRY AN EXAMPLE:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {EXAMPLE_PROMPTS.map((prompt, i) => (
                                            <button key={i} onClick={() => handleExampleClick(prompt)} className="text-left px-3 py-1.5 rounded-full border border-surface-200 bg-surface-50 text-xs text-surface-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition">
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="relative flex items-center">
                                <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} disabled={loading} rows={2} className="w-full pl-5 pr-14 py-3 rounded-xl border border-surface-300 bg-surface-50 text-surface-900 placeholder-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all text-sm leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed shadow-inner" placeholder={isAwaitingFirstInput ? "Type your symptoms here..." : "Type additional details if needed..."} />
                                <button type="submit" disabled={loading || !inputText.trim()} className="absolute right-2 bottom-2 w-10 h-10 flex items-center justify-center rounded-lg bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition shadow-md">
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>


            <aside className="hidden xl:flex flex-col gap-2 py-4 self-start sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto pl-1">
                <h3 className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-1 px-1">More Specialties</h3>
                {RIGHT_CATEGORIES.map((cat) => {
                    const isExpanded = expandedCategory === cat.label;
                    return (
                        <div key={cat.label}>
                            <button onClick={() => setExpandedCategory(isExpanded ? null : cat.label)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border w-full text-left transition-all duration-200 hover:shadow-md ${isExpanded ? 'shadow-md border-opacity-60' : ''} ${cat.bg}`}>
                                <div className={`${cat.color} flex-shrink-0`}><cat.icon className="w-4.5 h-4.5" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[13px] font-semibold ${cat.color} leading-tight`}>{cat.label}</p>
                                    <p className="text-[10px] text-surface-500 leading-snug">{cat.desc}</p>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-surface-400 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`accordion-grid ${isExpanded ? 'open' : ''}`}>
                                <div>
                                    <div className={`mt-1.5 mb-1 mx-1 p-2 rounded-lg bg-white/70 border ${cat.bg} flex flex-wrap gap-1.5`}>
                                        {cat.diseases.map((d) => (
                                            <span key={d} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${cat.color} bg-white border ${cat.bg}`}>
                                                <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}


                <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100">
                    <h4 className="text-[10px] font-bold text-primary-700 uppercase tracking-wider mb-2.5">How It Works</h4>
                    <div className="space-y-2.5">
                        {[
                            { icon: MessageCircle, step: '1', text: 'Describe your symptoms' },
                            { icon: ClipboardList, step: '2', text: 'Answer follow-up questions' },
                            { icon: FileText, step: '3', text: 'Get diagnostic report' },
                        ].map(({ icon: Icon, step, text }) => (
                            <div key={step} className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[9px] font-bold text-primary-600">{step}</span>
                                </div>
                                <p className="text-[11px] text-primary-700 font-medium">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-emerald-700 leading-snug">Your data is processed securely and never shared.</p>
                </div>
            </aside>
        </div>
    );
}
