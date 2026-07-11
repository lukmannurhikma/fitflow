import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: { value: string; positive: boolean };
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({ icon: Icon, label, value, change, iconBg, iconColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className={cn('rounded-lg p-2.5', iconBg || 'bg-primary/10')}>
            <Icon className={cn('h-5 w-5', iconColor || 'text-primary')} />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-xs font-medium',
              change.positive ? 'text-emerald-600' : 'text-red-600',
            )}
          >
            {change.positive ? '\u2191' : '\u2193'} {change.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
