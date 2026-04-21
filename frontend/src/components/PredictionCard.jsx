import { Activity } from 'lucide-react';

export default function PredictionCard({ prediction, rank, isHero = false }) {
    const bgColors = [
        'from-primary-500 to-primary-700',
        'from-surface-500 to-surface-700',
        'from-surface-400 to-surface-600',
    ];

    const barColors = ['bg-primary-500', 'bg-surface-500', 'bg-surface-400'];

    return (
        <div className={`transition-all duration-300 animate-slide-up ${isHero ? 'bg-white rounded-xl shadow-md border border-surface-200 border-l-4 border-l-primary-500 p-6' : 'glass-card p-5 hover:shadow-xl hover:-translate-y-1'}`}
            style={{ animationDelay: `${rank * 100}ms` }}>
            <div className={`flex items-center justify-between ${isHero ? 'mb-4' : 'mb-3'}`}>
                <div className="flex items-center gap-3">
                    {isHero ? (
                        <div className="bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full text-xs font-bold leading-none flex items-center justify-center">
                            #{rank + 1}
                        </div>
                    ) : (
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bgColors[rank] || bgColors[2]}
                               flex items-center justify-center text-white text-sm font-bold`}>
                            #{rank + 1}
                        </div>
                    )}
                    <div>
                        <h4 className={`font-semibold ${isHero ? 'text-2xl text-surface-900 font-display' : 'text-base text-surface-800'}`}>
                            {prediction.disease}
                        </h4>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-surface-500">
                    <Activity className="w-4 h-4" />
                    <span className={isHero ? "text-surface-600" : ""}>{prediction.confidence}%</span>
                </div>
            </div>

            {/* Confidence bar */}
            <div className={`${isHero ? 'h-2' : 'h-2.5'} bg-surface-100 rounded-full overflow-hidden`}>
                <div
                    className={`h-full rounded-full ${barColors[rank] || barColors[2]} transition-all duration-700 ease-out`}
                    style={{ width: `${prediction.confidence}%` }}
                />
            </div>
            
            {/* Disease Description */}
            {prediction.description && (
                <div className={`mt-4 ${!isHero ? 'pt-3 border-t border-surface-100' : ''} flex items-start gap-2`}>
                    <p className={`${isHero ? 'text-sm text-surface-500 leading-relaxed' : 'text-sm text-surface-600 leading-relaxed'}`}>
                        {prediction.description}
                    </p>
                </div>
            )}
        </div>
    );
}
