import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-amber-50/95 backdrop-blur-sm border-t border-amber-200 px-4 py-2">
            <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <p>
                    <strong>Medical Disclaimer:</strong> MedAssist AI is an educational decision-support tool and does NOT provide
                    medical diagnoses. Always consult a qualified healthcare professional for medical advice.
                </p>
            </div>
        </div>
    );
}
