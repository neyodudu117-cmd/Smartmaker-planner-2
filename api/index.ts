import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || 'https://cxfwdcloejuallodlfuf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_UM8hAXqUJZELtUW60xpukA_WaMh5w0c';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get user ID from email
async function getUserId(email: string | undefined) {
  if (!email) return 1; // Fallback to demo user
  const { data } = await supabase.from('users').select('id').eq('email', email).single();
  return data?.id || 1;
}

app.post('/api/users', async (req, res) => {
  const { email, name } = req.body;
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, name }])
      .select()
      .single();
    
    // Ignore unique constraint errors (user already exists)
    if (error && error.code !== '23505') {
      throw error;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/dashboard', async (req, res) => {
  const email = req.headers['x-user-email'] as string;
  const userId = await getUserId(email);
  
  try {
    const [
      { data: transactions },
      { data: affiliatePrograms },
      { data: digitalProducts },
      { data: goals }
    ] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId),
      supabase.from('affiliate_programs').select('*').eq('user_id', userId),
      supabase.from('digital_products').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId)
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    (transactions || []).forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') totalExpense += t.amount;
    });

    let affiliateEarnings = 0;
    (affiliatePrograms || []).forEach(a => affiliateEarnings += a.commissions);

    res.json({
      summary: {
        revenue: totalIncome,
        expenses: totalExpense,
        netProfit: totalIncome - totalExpense,
        affiliateEarnings
      },
      transactions: transactions || [],
      affiliatePrograms: affiliatePrograms || [],
      digitalProducts: digitalProducts || [],
      goals: goals || []
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { type, amount, category, date, description, is_tax_deductible } = req.body;
  const email = req.headers['x-user-email'] as string;
  const userId = await getUserId(email);
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ 
      user_id: userId, 
      type, 
      amount, 
      category, 
      date, 
      description, 
      is_tax_deductible: is_tax_deductible ? true : false 
    }])
    .select();
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ id: data?.[0]?.id });
});

app.post('/api/affiliate', async (req, res) => {
  const { name, clicks, conversions, commissions } = req.body;
  const email = req.headers['x-user-email'] as string;
  const userId = await getUserId(email);
  
  const { data, error } = await supabase
    .from('affiliate_programs')
    .insert([{ user_id: userId, name, clicks, conversions, commissions }])
    .select();
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ id: data?.[0]?.id });
});

app.post('/api/products', async (req, res) => {
  const { name, sales, gross_revenue, platform_fee } = req.body;
  const email = req.headers['x-user-email'] as string;
  const userId = await getUserId(email);
  
  const { data, error } = await supabase
    .from('digital_products')
    .insert([{ user_id: userId, name, sales, gross_revenue, platform_fee }])
    .select();
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ id: data?.[0]?.id });
});

app.post('/api/goals', async (req, res) => {
  const { type, target_amount, month } = req.body;
  const email = req.headers['x-user-email'] as string;
  const userId = await getUserId(email);
  
  const { data, error } = await supabase
    .from('goals')
    .insert([{ user_id: userId, type, target_amount, current_amount: 0, month }])
    .select();
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ id: data?.[0]?.id });
});

app.delete('/api/transactions/bulk', async (req, res) => {
  const { ids } = req.body;
  const email = req.headers['x-user-email'] as string;
  const userId = await getUserId(email);
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty ids array' });
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('id', ids)
    .eq('user_id', userId); // Ensure users only delete their own transactions
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true });
});

app.put('/api/transactions/bulk-categorize', async (req, res) => {
  const { ids, category } = req.body;
  const email = req.headers['x-user-email'] as string;
  const userId = await getUserId(email);
  
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !category) {
    return res.status(400).json({ error: 'Invalid ids array or missing category' });
  }

  const { error } = await supabase
    .from('transactions')
    .update({ category })
    .in('id', ids)
    .eq('user_id', userId); // Ensure users only update their own transactions
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true });
});

app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, category, date, description, is_tax_deductible } = req.body;
  const email = req.headers['x-user-email'] as string;
  const userId = await getUserId(email);
  
  const { error } = await supabase
    .from('transactions')
    .update({ amount, category, date, description, is_tax_deductible: is_tax_deductible ? true : false })
    .eq('id', id)
    .eq('user_id', userId);
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true });
});

export default app;
