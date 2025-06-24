
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play, TrendingUp, Smartphone } from 'lucide-react';

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Helper to get day name from date
function getDayName(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}


export const EarningsHistory = () => {
  const [weeklyData, setWeeklyData] = useState<{ day: string; earnings: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      // Fetch last 7 days earnings for chart
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 6);
      const { data: earningsRows, error: earningsError } = await supabase
        .from('earnings_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: true });
      if (earningsError) {
        setError(earningsError.message);
        setLoading(false);
        return;
      }
      // Group by day
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const dayMap: { [day: string]: number } = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        dayMap[days[d.getDay()]] = 0;
      }
      earningsRows.forEach(row => {
        const day = getDayName(row.created_at);
        dayMap[day] = (dayMap[day] || 0) + Number(row.amount);
      });
      setWeeklyData(Object.entries(dayMap).map(([day, earnings]) => ({ day, earnings })));
      // Fetch recent activity (last 10)
      const { data: recentRows, error: recentError } = await supabase
        .from('earnings_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (recentError) {
        setError(recentError.message);
        setLoading(false);
        return;
      }
      setRecentActivity(recentRows);
      setLoading(false);
    };
    fetchEarnings();
  }, []);

  const totalWeeklyEarnings = weeklyData.reduce((sum, day) => sum + day.earnings, 0);
  const averageDaily = weeklyData.length ? Math.round(totalWeeklyEarnings / weeklyData.length) : 0;

  return (
    <div className="space-y-6">
      {/* Mobile-optimized layout */}
      <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        {/* Weekly Chart - Full width on mobile */}
        <Card className="lg:col-span-2 animate-slide-up rounded-3xl border-0 shadow-xl bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Weekly Earnings</h3>
                  <p className="text-sm text-gray-500">Your progress this week</p>
                </div>
              </div>
              <div className="text-center sm:text-right bg-gradient-to-r from-primary-50 to-success-50 rounded-2xl p-4">
                <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                  {totalWeeklyEarnings.toLocaleString()} KSH
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  Avg: {averageDaily} KSH/day
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-40">Loading...</div>
            ) : weeklyData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400">No earnings data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="earnings" fill="#663399" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="bg-white animate-slide-up rounded-3xl border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-success rounded-2xl flex items-center justify-center shadow-lg">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-500">Your latest watched videos</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center justify-center h-32">Loading...</div>
            ) : recentActivity.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400">No activity yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity, idx) => (
                  <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-gray-900 text-base line-clamp-1">
                          {activity.video_title || 'Watched Video'}
                        </h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs rounded-full px-2 py-1">
                            {activity.category || 'General'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                      <span className="font-bold text-primary-600 text-lg">
                        +{activity.amount} KSH
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
};
