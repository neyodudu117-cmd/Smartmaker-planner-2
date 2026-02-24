/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cxfwdcloejuallodlfuf.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UM8hAXqUJZELtUW60xpukA_WaMh5w0c';

export const supabase = createClient(supabaseUrl, supabaseKey);
