import { useId } from "react";

export default function CapacityDial({ used = 0, max = 1, size = 72, label }) {
  const gradId = useId();
  const safeMax = Math.max(max, 1);
  const ratio = Math.min(used / safeMax, 1);
  const percent = Math.round(ratio * 100);
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);

  return (
    <div className="capacity-dial" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#66a6ff" />
            <stop offset="100%" stopColor="#7ef5d1" />
          </linearGradient>
        </defs>
        <circle
          className="dial-bg"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="dial-fg"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={`url(#${gradId})`}
        />
      </svg>
      <div className="dial-label">
        <span className="dial-percent">{percent}%</span>
        {label ? <span className="dial-sub">{label}</span> : null}
      </div>
    </div>
  );
}
