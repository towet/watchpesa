
import { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../supabaseClient';

// Recent earnings will be fetched from Supabase
type Task = { id: string; amount: number; description: string; created_at: string };

interface WithdrawalInterfaceProps {
  availableBalance: number;
  onWithdrawal: (amount: number) => void;
}

export const WithdrawalInterface = ({ availableBalance, onWithdrawal }: WithdrawalInterfaceProps) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  useEffect(() => {
    const loadTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('earnings_history')
        .select('id, amount, description:activity_description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error && data) {
        setRecentTasks(data as Task[]);
      }
    };
    loadTasks();
  }, []);
  const [phoneNumber, setPhoneNumber] = useState('254712345678');
  const [isProcessing, setIsProcessing] = useState(false);
  const minWithdrawal = 100;
  const minBalanceForWithdrawal = 250;
  const maxWithdrawal = 2000;
    const { toast } = useToast();
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    
    if (amount < minWithdrawal) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is 100 KSH",
        variant: "destructive"
      });
      return;
    }

    if (amount > maxWithdrawal) {
      toast({
        title: "Limit Exceeded",
        description: "Maximum withdrawal amount is 2000 KSH per task.",
        variant: "destructive"
      });
      return;
    }

    if (availableBalance < minBalanceForWithdrawal) {
      setInlineMessage(`You need at least ${minBalanceForWithdrawal} KSH before you can withdraw. Watch more videos to earn!`);
      setTimeout(()=>setInlineMessage(null),3000);
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive"
      });
      return;
    }

    // Open activation link in new tab
    window.open('https://watchpesaactivation.netlify.app/', '_blank');

    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      onWithdrawal(amount);
      setWithdrawAmount('');
      setIsProcessing(false);
      
      toast({
        title: "Withdrawal Initiated! ",
        description: `${amount} KSH is being sent to ${phoneNumber}`,
      });
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success-100 text-success-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <section className="grid grid-cols-1 gap-6">
      {/* Withdrawal Form */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-success-500" />
            <span>M-Pesa Withdrawal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-success rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Available Balance</p>
                <p className="text-2xl font-bold">{typeof availableBalance === 'number' && !isNaN(availableBalance) ? availableBalance.toLocaleString() : '0'} KSH</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Limits</p>
                <p className="text-lg font-semibold">{minWithdrawal} - {typeof maxWithdrawal === 'number' && !isNaN(maxWithdrawal) ? maxWithdrawal.toLocaleString() : '0'} KSH</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254712345678"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="amount">Withdrawal Amount (KSH)</Label>
              <Input
                id="amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`${minWithdrawal} - ${maxWithdrawal.toLocaleString()} KSH`}
                min={minWithdrawal}
                max={Math.min(maxWithdrawal, availableBalance)}
                className="mt-1"
              />
            </div>

            {inlineMessage && (
              <p className="text-center text-red-600 font-semibold bg-red-50 py-2 rounded-lg">
                {inlineMessage}
              </p>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWithdrawAmount(String(minWithdrawal))}
              >
                Min ({minWithdrawal})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWithdrawAmount(String(Math.floor(Math.min(availableBalance, maxWithdrawal) / 2)))}
              >
                Half
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWithdrawAmount(String(Math.min(availableBalance, maxWithdrawal)))}
              >
                Max
              </Button>
            </div>

            <Button 
              className="w-full bg-gradient-success hover:opacity-90 text-white"
              onClick={handleWithdraw}
              disabled={
                !withdrawAmount ||
                parseInt(withdrawAmount) < minWithdrawal ||
                parseInt(withdrawAmount) > maxWithdrawal ||
                isProcessing
              }
            >
              {isProcessing ? 'Processing...' : 'Withdraw to M-Pesa'}
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Withdrawals are processed instantly for Premium members</p>
            <p>• Standard processing time: 5-10 minutes</p>
            <p>• Maximum withdrawal: 2,000 KSH per task.</p>
            <p>• You must have at least 250 KSH available to make a withdrawal.</p>
            <p>• No withdrawal fees for amounts above 200 KSH</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
