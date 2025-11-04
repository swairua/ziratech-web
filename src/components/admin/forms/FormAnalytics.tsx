import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { api } from '@/lib/apiClient';

export const FormAnalytics = () => {
  const [totals, setTotals] = useState({ total: 0, responded: 0, career: 0, avgHours: 0 });

  useEffect(() => {
    const load = async () => {
      const res = await api.formSubmissions.list();
      const rows: any[] = Array.isArray(res.data) ? res.data : [];
      const total = rows.length;
      const responded = rows.filter(r => r.status === 'responded').length;
      const career = rows.filter(r => r.form_type === 'career').length;
      // If handled_at is present, compute avg response time
      const handled = rows.filter(r => r.handled_at).map(r => ({
        start: new Date(r.created_at).getTime(),
        end: new Date(r.handled_at).getTime(),
      })).filter(t => Number.isFinite(t.start) && Number.isFinite(t.end) && t.end >= t.start);
      const avgMs = handled.length ? handled.reduce((a, b) => a + (b.end - b.start), 0) / handled.length : 0;
      const avgHours = avgMs ? Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10 : 0;
      setTotals({ total, responded, career, avgHours });
    };
    load();
  }, []);

  const responseRate = totals.total ? Math.round((totals.responded / totals.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totals.total}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-gray-500">Live total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Response Rate</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{responseRate}%</div>
            <div className="text-xs text-gray-500">responded submissions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totals.avgHours}h</div>
            <div className="text-xs text-gray-500">based on handled_at</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Career Applications</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totals.career}</div>
            <div className="text-xs text-gray-500">job applications received</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Submissions Over Time</CardTitle>
            <CardDescription>Basic snapshot, charts can be added later</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 flex items-center justify-center text-gray-500">Data available: {totals.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Type Distribution</CardTitle>
            <CardDescription>Counts by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 flex items-center justify-center text-gray-500">Career: {totals.career} • Responded: {totals.responded}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
