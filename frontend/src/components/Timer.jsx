import { useState, useEffect } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

const Timer = ({ expiresAt, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(expiresAt) - new Date();
            return Math.max(0, Math.floor(difference / 1000));
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timer);
                if (onTimeUp) onTimeUp();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt, onTimeUp]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const isWarning = timeLeft <= 60; // Less than 1 minute

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg transition-colors ${
            isWarning ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' : 'bg-slate-800 text-slate-100 border border-slate-700'
        }`}>
            <TimerIcon className="w-5 h-5" />
            {formatTime(timeLeft)}
        </div>
    );
};

export default Timer;
