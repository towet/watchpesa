
import { Check, Star, Crown, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MembershipTiersProps {
  currentTier: string;
}

const tiers = [
  {
    name: 'Basic',
    price: 'Free',
    monthlyPrice: 0,
    earnPerVideo: 50,
    color: 'gray',
    icon: Star,
    features: [
      'Access to basic video categories',
      'Earn up to 50 KSH per video',
      'Daily earning limit: 500 KSH',
      'Standard withdrawal processing',
      'Basic customer support'
    ],
    popular: false
  },
  {
    name: 'Elite',
    price: '200 KSH',
    monthlyPrice: 200,
    earnPerVideo: 150,
    color: 'primary',
    icon: Zap,
    features: [
      'Access to premium video categories',
      'Earn up to 150 KSH per video',
      'Daily earning limit: 1,000 KSH',
      'Priority withdrawal processing',
      'Priority customer support',
      'Weekly bonus rewards'
    ],
    popular: true
  },
  {
    name: 'Premium',
    price: '450 KSH',
    monthlyPrice: 450,
    earnPerVideo: 200,
    color: 'success',
    icon: Crown,
    features: [
      'Access to all video categories',
      'Earn up to 200 KSH per video',
      'Unlimited daily earnings',
      'Instant withdrawal processing',
      '24/7 premium customer support',
      'Weekly bonus rewards',
      'Exclusive content access',
      'Referral bonus multiplier'
    ],
    popular: false
  }
];

export const MembershipTiers = ({ currentTier }: MembershipTiersProps) => {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Membership Tiers</h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">Choose the plan that maximizes your earning potential</p>
      </div>

      {/* Mobile-first stacked layout */}
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-3 sm:gap-6">
        {tiers.map((tier) => {
          const IconComponent = tier.icon;
          return (
            <Card 
              key={tier.name} 
              className={`relative hover:shadow-2xl transition-all duration-500 animate-slide-up rounded-3xl overflow-hidden border-0 shadow-lg ${
                tier.popular ? 'ring-2 ring-primary-400 lg:scale-105 bg-gradient-to-br from-white to-primary-50/30' : 'bg-white'
              } ${currentTier === tier.name ? 'ring-2 ring-success-400 bg-gradient-to-br from-white to-success-50/30' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-primary text-white px-4 py-2 rounded-full shadow-lg">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {currentTier === tier.name && (
                <div className="absolute -top-4 right-4 z-10">
                  <Badge className="bg-gradient-success text-white px-4 py-2 rounded-full shadow-lg">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-6 pt-8">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${
                    tier.name === 'Basic' ? 'bg-gray-100' :
                    tier.name === 'Elite' ? 'bg-gradient-primary' :
                    'bg-gradient-success'
                  }`}>
                    <IconComponent className={`h-8 w-8 ${
                      tier.name === 'Basic' ? 'text-gray-600' : 'text-white'
                    }`} />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-primary-600">
                    {tier.price}
                    {tier.monthlyPrice > 0 && (
                      <span className="text-sm font-normal text-gray-500">/month</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-full px-4 py-2 inline-block">
                    Up to {tier.earnPerVideo} KSH per video
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-6 pb-8">
                <ul className="space-y-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-100 flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-success-600" />
                      </div>
                      <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full py-3 rounded-2xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl ${
                    currentTier === tier.name 
                      ? 'bg-success-500 hover:bg-success-600' 
                      : tier.popular 
                      ? 'bg-gradient-primary hover:opacity-90' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  disabled={currentTier === tier.name}
                >
                  {currentTier === tier.name ? 'Current Plan' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
