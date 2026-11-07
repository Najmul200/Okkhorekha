import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pyanxzhxjhwolwpyozjo.supabase.co';
const supabaseAnonKey = 'sb_publishable_49H2ICQova5ozC7IMxhldw_gIKbQtJw';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
