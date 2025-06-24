
import { DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EarningsCardProps {
  title: string;
  amount: number;
  currency: string;
  icon: 'dollar-sign' | 'clock';
  gradient: string;
  actionButton?: boolean;
  onActionClick?: () => void;
}

export const EarningsCard = ({ 
  title, 
  amount, 
  currency, 
  icon, 
  gradient, 
  actionButton = false,
  onActionClick 
}: EarningsCardProps) => {
  const IconComponent = icon === 'dollar-sign' ? DollarSign : Clock;

  return (
    <Card className={`bg-${gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in hover:scale-[1.02] active:scale-[0.98] rounded-2xl sm:rounded-3xl overflow-hidden touch-manipulation`}>
      <CardContent className="p-4 sm:p-5 lg:p-6 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 opacity-10">
          <TrendingUp className="w-full h-full" />
        </div>
        
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg ${
            gradient === 'gradient-primary' ? 'bg-white/20 backdrop-blur-sm' : 
            gradient === 'gradient-success' ? 'bg-white/20 backdrop-blur-sm' : 
            'bg-primary-100 shadow-primary-200/50'
          }`}>
            <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${
              gradient === 'gradient-card' ? 'text-primary-600' : 'text-white'
            }`} />
          </div>
          {actionButton && (
            <Button 
              size="sm" 
              className="bg-success-500 hover:bg-success-600 text-white rounded-full px-4 sm:px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm touch-manipulation"
              onClick={onActionClick}
            >
              Withdraw
            </Button>
          )}
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <p className={`text-xs sm:text-sm font-semibold ${
            gradient === 'gradient-card' ? 'text-gray-600' : 'text-white/90'
          }`}>
            {title}
          </p>
          <div className="flex items-baseline space-x-1 sm:space-x-2">
            <span className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
              gradient === 'gradient-card' ? 'text-primary-600' : 'text-white'
            }`}>
              {typeof amount === 'number' && !isNaN(amount) ? amount.toLocaleString() : '0'}
            </span>
            <span className={`text-sm sm:text-lg font-semibold ${
              gradient === 'gradient-card' ? 'text-gray-500' : 'text-white/80'
            }`}>
              {currency}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
