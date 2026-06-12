type ProgressBarProps = {
  current: number;
  goal: number;
};

export default function ProgressBar({ current, goal }: ProgressBarProps) {
  const safeGoal = Math.max(goal, 1);
  const progress = Math.min((current / safeGoal) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Raised</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-black transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
