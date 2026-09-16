import { Clock, Package, Truck, CheckCircle2 } from 'lucide-react';

export default function ProgressStepper({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { label: 'Pending', icon: Clock },
    { label: 'Assigned', icon: Package },
    { label: 'In-Transit', icon: Truck },
    { label: 'Delivered', icon: CheckCircle2 }
  ];
  
  const stepLabels = steps.map(s => s.label);
  let currentIndex = stepLabels.indexOf(currentStatus);
  if (currentIndex === -1) currentIndex = 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4">
      <div className="relative">
        {/* The background line connecting the icons */}
        <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
        {/* The active colored line */}
        <div 
          className="absolute top-5 left-[12.5%] h-1 bg-accent -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_8px_rgba(255,107,44,0.4)]"
          style={{ width: `${(currentIndex / 3) * 75}%` }}
        ></div>

        {/* The icons and text */}
        <div className="relative z-10 flex justify-between w-full">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isActive = idx === currentIndex;
            const Icon = step.icon;
            
            return (
              <div key={step.label} className="flex flex-col items-center w-1/4">
                <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center bg-white transition-all duration-300 ${
                  isActive ? 'border-accent text-accent shadow-md scale-110' : 
                  isCompleted ? 'border-accent text-accent' : 
                  'border-slate-200 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className={`mt-3 text-[11px] font-bold text-center uppercase tracking-wider w-full px-1 break-words ${
                  isActive ? 'text-accent' : 
                  isCompleted ? 'text-slate-900' : 
                  'text-slate-400'
                }`}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
