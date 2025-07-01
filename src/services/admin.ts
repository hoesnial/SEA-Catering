import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  newSubscriptions: number;
  monthlyRecurringRevenue: number;
  reactivations: number;
  subscriptionGrowth: number;
  totalActiveSubscriptions: number;
  totalPausedSubscriptions: number;
  totalCancelledSubscriptions: number;
  averageSubscriptionValue: number;
}

export const adminService = {
  async getDashboardMetrics(startDate: string, endDate: string): Promise<DashboardMetrics> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    try {
      // Get new subscriptions in date range
      const { data: newSubs, error: newSubsError } = await supabase
        .from('subscriptions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59.999Z');

      if (newSubsError) throw newSubsError;

      // Get all subscriptions for status breakdown
      const { data: allSubs, error: allSubsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (allSubsError) throw allSubsError;

      // Get reactivations (subscriptions that were cancelled and then reactivated)
      const { data: reactivations, error: reactivationsError } = await supabase
        .from('subscriptions')
        .select('*')
        .not('reactivated_at', 'is', null)
        .gte('reactivated_at', startDate)
        .lte('reactivated_at', endDate + 'T23:59:59.999Z');

      if (reactivationsError) throw reactivationsError;

      // Calculate metrics
      const newSubscriptions = newSubs?.length || 0;
      const totalActiveSubscriptions = allSubs?.filter(s => s.status === 'active').length || 0;
      const totalPausedSubscriptions = allSubs?.filter(s => s.status === 'paused').length || 0;
      const totalCancelledSubscriptions = allSubs?.filter(s => s.status === 'cancelled').length || 0;
      
      // Calculate MRR from active subscriptions
      const monthlyRecurringRevenue = allSubs
        ?.filter(s => s.status === 'active')
        .reduce((total, sub) => total + (sub.total_price || 0), 0) || 0;

      // Calculate average subscription value
      const averageSubscriptionValue = totalActiveSubscriptions > 0 
        ? monthlyRecurringRevenue / totalActiveSubscriptions 
        : 0;

      // Calculate growth rate (simplified - comparing new subscriptions to total)
      const subscriptionGrowth = totalActiveSubscriptions > 0 
        ? (newSubscriptions / totalActiveSubscriptions) * 100 
        : 0;

      return {
        newSubscriptions,
        monthlyRecurringRevenue,
        reactivations: reactivations?.length || 0,
        subscriptionGrowth,
        totalActiveSubscriptions,
        totalPausedSubscriptions,
        totalCancelledSubscriptions,
        averageSubscriptionValue
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  async getAllSubscriptions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateSubscriptionStatus(
    subscriptionId: number, 
    status: 'active' | 'paused' | 'cancelled',
    additionalData?: Record<string, any>
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const updateData = {
      status,
      ...additionalData
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTestimonials() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async approveTestimonial(testimonialId: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { data, error } = await supabase
      .from('testimonials')
      .update({ approved: true })
      .eq('id', testimonialId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};