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
    Thermometer
} from 'lucide-react';

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
        <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in flex flex-col h-[calc(100vh-100px)]">
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
                <div className="mb-6 hidden sm:block animate-slide-up">
                    <p className="text-xs font-bold text-surface-400 text-center uppercase tracking-widest mb-3">
                        Supported Categories
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { icon: AlertCircle, label: 'Infectious', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                            { icon: Sparkles, label: 'Dermatology', color: 'bg-pink-100 text-pink-700 border-pink-200' },
                            { icon: Stethoscope, label: 'Hepatic', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                            { icon: Heart, label: 'Cardiovascular', color: 'bg-red-100 text-red-700 border-red-200' },
                            { icon: Activity, label: 'Gastrointestinal', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                            { icon: Brain, label: 'Neurological', color: 'bg-violet-100 text-violet-700 border-violet-200' },
                            { icon: Wind, label: 'Respiratory', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
                            { icon: Thermometer, label: 'Metabolic', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                            { icon: Bone, label: 'Orthopedic', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                        ].map(({ icon: Icon, label, color }) => (
                            <span
                                key={label}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-opacity-80 shadow-sm ${color}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
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
                                        <button
                                            onClick={() => handleAnswerQuestion('yes')}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                                        >
                                            <Check className="w-4 h-4" /> Yes
                                        </button>
                                        <button
                                            onClick={() => handleAnswerQuestion('no')}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-sm font-medium"
                                        >
                                            <X className="w-4 h-4" /> No
                                        </button>
                                        <button
                                            onClick={() => handleAnswerQuestion('unsure')}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-surface-200 text-surface-700 border border-surface-300 rounded-lg hover:bg-surface-300 transition-colors text-sm font-medium"
                                        >
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
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {error}
                    </div>
                )}
                {!isAwaitingAnswer && (
                    <div className="pt-2">
                        {isAwaitingFirstInput && (
                            <div className="mb-3">
                                <p className="text-xs font-semibold text-surface-400 mb-2">TRY AN EXAMPLE:</p>
                                <div className="flex flex-wrap gap-2">
                                    {EXAMPLE_PROMPTS.map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleExampleClick(prompt)}
                                            className="text-left px-3 py-1.5 rounded-full border border-surface-200 bg-surface-50 text-xs text-surface-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="relative flex items-center">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                disabled={loading}
                                rows={2}
                                className="w-full pl-5 pr-14 py-3 rounded-xl border border-surface-300 bg-surface-50 
                               text-surface-900 placeholder-surface-400 resize-none
                               focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                               transition-all text-sm leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                                placeholder={isAwaitingFirstInput ? "Type your symptoms here..." : "Type additional details if needed..."}
                            />
                            <button
                                type="submit"
                                disabled={loading || !inputText.trim()}
                                className="absolute right-2 bottom-2 w-10 h-10 flex items-center justify-center rounded-lg bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition shadow-md"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
