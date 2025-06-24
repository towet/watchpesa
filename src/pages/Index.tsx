
import { useState, useEffect, useRef } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { EarningsCard } from '@/components/EarningsCard';
import { VideoCategories } from '@/components/VideoCategories';
import { MembershipTiers } from '@/components/MembershipTiers';
import { WithdrawalInterface } from '@/components/WithdrawalInterface';
import { EarningsHistory } from '@/components/EarningsHistory';
import { useToast } from '@/hooks/use-toast';

interface IndexProps {
  username?: string;
}
import { supabase } from '../supabaseClient';

const Index = ({ username }: IndexProps) => {
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [todayEarnings, setTodayEarnings] = useState<number | null>(null); // Placeholder: implement real logic for today
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
  const withdrawalRef = useRef<HTMLDivElement>(null);

  const handleWithdrawClick = () => {
    withdrawalRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      let { data, error } = await supabase
        .from('profiles')
        .select('earnings, tier')
        .eq('id', user.id)
        .single();

      // If the profile row does not exist yet, create it with default values
      if (error?.code === 'PGRST116') {
        console.log('Profile row missing – inserting default profile');
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          earnings: 0,
          tier: 'Basic'
        });
        if (insertError) {
          setError(insertError.message);
          setLoading(false);
          return;
        }
        // Try fetching again after insert
        ({ data, error } = await supabase
          .from('profiles')
          .select('earnings, tier')
          .eq('id', user.id)
          .single());
      }

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setTotalEarnings(data.earnings ?? 0);
      setAvailableBalance(data.earnings ?? 0); // Use same as total for now
      setCurrentTier(data.tier ?? 'Basic');
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { data: earningsHistory, error: earningsHistoryError } = await supabase
        .from('earnings_history')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString());
      if (earningsHistoryError) {
        console.error('Error fetching today\'s earnings:', earningsHistoryError);
      } else {
        const todayEarnings = earningsHistory.reduce((acc, curr) => acc + curr.amount, 0);
        setTodayEarnings(todayEarnings);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleEarningsUpdate = async (earnedAmount: number, videoTitle: string) => {
    // Log the values being sent
    console.log("Calling add_earnings_and_log with:", {
      amount_to_add: earnedAmount,
      activity_description: `Watched \"${videoTitle}\"`
    });

    // Call the database function to handle the transaction securely
    const { error: rpcError, data } = await supabase.rpc('add_earnings_and_log', {
      amount_to_add: earnedAmount,
      activity_description: `Watched "${videoTitle}"`
    });

    if (rpcError) {
      toast({
        title: "Sync Error",
        description: `Failed to save new balance: ${rpcError.message || JSON.stringify(rpcError)}`,
        variant: "destructive",
      });
      console.error("Supabase RPC Error:", rpcError);
      return; // Stop execution if the RPC call fails
    }

    // If successful, refetch the profile to get the updated balance
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('earnings, tier') // Reverted for clarity and performance
      .eq('id', user.id)
      .single();

    // Detailed logging to diagnose the balance update issue
    console.log("Refetch after earnings update complete.");
    if (profileError) {
      console.error("Error refetching profile:", JSON.stringify(profileError, null, 2));
      toast({
        title: "Fetch Error",
        description: `Could not refetch profile: ${profileError.message}`,
        variant: "destructive",
      });
    } else {
      console.log("Profile data refetched successfully:", JSON.stringify(profileData, null, 2));
      console.log("Setting new earnings to:", profileData.earnings);
      setTotalEarnings(profileData.earnings ?? 0);
      setAvailableBalance(profileData.earnings ?? 0);
    }
  };

  const handleWithdrawal = (amount: number) => {
    // After withdrawal, refetch profile
    setLoading(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('earnings, tier')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          setTotalEarnings(data?.earnings ?? 0);
          setAvailableBalance(data?.earnings ?? 0);
          setCurrentTier(data?.tier ?? 'Basic');
          setTodayEarnings(null);
          setLoading(false);
        });
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <DashboardHeader username={username} />
      
      <main className="pb-20 px-3 sm:px-4 lg:px-6">
        {/* Mobile-optimized container */}
        <div className="max-w-7xl mx-auto">
          {/* Earnings Overview - Mobile-first stacked layout */}
          <div className="pt-3 pb-4 space-y-3 sm:pt-4 sm:pb-6 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 lg:gap-4">
            <EarningsCard 
              title="Total Earnings"
              amount={totalEarnings}
              currency="KSH"
              icon="dollar-sign"
              gradient="gradient-primary"
            />
            <EarningsCard 
              title="Today's Earnings"
              amount={todayEarnings}
              currency="KSH"
              icon="clock"
              gradient="gradient-success"
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <EarningsCard 
                title="Available for Withdrawal"
                amount={availableBalance}
                currency="KSH"
                icon="dollar-sign"
                gradient="gradient-card"
                actionButton={true}
                onActionClick={handleWithdrawClick}
              />
            </div>
          </div>
        </div>

        {/* Mobile-optimized section spacing */}
        <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Video Categories */}
          <VideoCategories 
            currentTier={currentTier}
            onEarningsUpdate={handleEarningsUpdate}
          />

          {/* Membership Tiers */}
          <MembershipTiers currentTier={currentTier} />

          {/* Withdrawal Interface */}
          <div ref={withdrawalRef}>
            <WithdrawalInterface 
              availableBalance={availableBalance}
              onWithdrawal={handleWithdrawal}
            />
          </div>

          {/* Earnings History */}
          <EarningsHistory />
        </div>
      </main>
    </div>
  );
};

export default Index;
