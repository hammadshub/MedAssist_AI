import { ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react';

export default function RiskBadge({ level }) {
    const config = {
        LOW: {
            className: 'risk-badge-low',
            icon: ShieldCheck,
            label: 'Low Risk',
        },
        MEDIUM: {
            className: 'risk-badge-medium',
            icon: ShieldAlert,
            label: 'Medium Risk',
        },
        HIGH: {
            className: 'risk-badge-high',
            icon: ShieldOff,
            label: 'High Risk',
        },
        URGENT: {
            className: 'risk-badge-high',
            icon: ShieldOff,
            label: 'Urgent',
        },
        EMERGENCY: {
            className: 'risk-badge-high',
            icon: ShieldOff,
            label: 'Emergency',
        },
    };

    const { className, icon: Icon, label } = config[level] || config.LOW;

    return (
        <span className={className}>
            <Icon className="w-4 h-4" />
            {label}
        </span>
    );
}
