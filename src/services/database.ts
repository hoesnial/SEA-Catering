import { supabase, Subscription, MealPlan, Testimonial } from '../lib/supabase';

// Subscription services
export const subscriptionService = {
  async create(subscription: Omit<Subscription, 'id' | 'created_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{ ...subscription, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin';
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq(isAdmin ? 'id' : 'user_id', isAdmin ? data?.id : user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Check if user owns this subscription or is admin
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin && data.user_id !== user.id) {
      throw new Error('Access denied');
    }
    
    return data;
  },

  async getUserSubscriptions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateStatus(
    subscriptionId: number, 
    status: 'active' | 'paused' | 'cancelled',
    additionalData?: Record<string, any>
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const updateData = {
      status,
      ...additionalData
    };

    // If reactivating a cancelled subscription, set reactivated_at
    if (status === 'active' && additionalData?.cancelled_at) {
      updateData.reactivated_at = new Date().toISOString();
      updateData.cancelled_at = null;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .eq('user_id', user.id) // Ensure user can only update their own subscriptions
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Meal plan services
export const mealPlanService = {
  async create(mealPlan: Omit<MealPlan, 'id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { data, error } = await supabase
      .from('meal_plans')
      .insert([mealPlan])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async update(id: number, updates: Partial<MealPlan>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { data, error } = await supabase
      .from('meal_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Testimonial services
export const testimonialService = {
  async create(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('testimonials')
      .insert([{ ...testimonial, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getApproved() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getUserTestimonials() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async approve(id: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { data, error } = await supabase
      .from('testimonials')
      .update({ approved: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};