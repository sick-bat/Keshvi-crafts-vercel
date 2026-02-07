"use client";

interface PriceProgressBarProps {
    subtotal: number;
}

export default function PriceProgressBar({ subtotal }: PriceProgressBarProps) {
    const milestones = [
        { value: 650, label: "Free Shipping", icon: "🚚" },
        { value: 1250, label: "10% OFF", icon: "🎁" },
        { value: 1800, label: "20% OFF", icon: "✨" }
    ];

    const maxValue = 1800;
    const progress = Math.min((subtotal / maxValue) * 100, 100);

    // Dynamic message
    let message = "";
    let messageColor = "text-[#92400e]";

    if (subtotal < 650) {
        message = `Add ₹${650 - subtotal} more for Free Shipping`;
        messageColor = "text-[#92400e]";
    } else if (subtotal < 1250) {
        message = `🎉 Free Shipping unlocked! Add ₹${1250 - subtotal} more for 10% OFF`;
        messageColor = "text-[#15803d]";
    } else if (subtotal < 1800) {
        message = `🎉 10% OFF unlocked! Add ₹${1800 - subtotal} more for 20% OFF`;
        messageColor = "text-[#15803d]";
    } else {
        const saved = Math.round(subtotal * 0.20);
        message = `🎉 Amazing! You unlocked 20% OFF and saved ₹${saved}`;
        messageColor = "text-[#15803d]";
    }

    return (
        <div className="bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] p-5 rounded-xl border-2 border-[#fbbf24] shadow-sm mb-6">
            {/* Message */}
            <p className={`text-sm font-semibold ${messageColor} mb-3 text-center`}>
                {message}
            </p>

            {/* Progress Bar Container */}
            <div className="relative mb-4">
                {/* Background Track */}
                <div className="h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
                    {/* Progress Fill */}
                    <div
                        className="h-full bg-gradient-to-r from-[#f59e0b] via-[#d97706] to-[#b45309] transition-all duration-500 ease-out shadow-sm"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Milestone Markers */}
                <div className="absolute top-0 left-0 w-full h-3">
                    {milestones.map((milestone, idx) => {
                        const position = (milestone.value / maxValue) * 100;
                        const isReached = subtotal >= milestone.value;

                        return (
                            <div
                                key={milestone.value}
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                                style={{ left: `${position}%` }}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${isReached
                                            ? 'bg-[#15803d] border-white shadow-md scale-110'
                                            : 'bg-white border-[#d1d5db] shadow-sm'
                                        }`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Milestone Labels */}
            <div className="flex justify-between text-[10px] font-medium">
                {milestones.map((milestone) => {
                    const isReached = subtotal >= milestone.value;
                    return (
                        <div
                            key={milestone.value}
                            className={`flex flex-col items-center transition-colors ${isReached ? 'text-[#15803d]' : 'text-[#78716c]'
                                }`}
                        >
                            <span className="mb-0.5">{milestone.icon}</span>
                            <span className="whitespace-nowrap">{milestone.label}</span>
                            <span className="text-[9px] opacity-70">₹{milestone.value}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
