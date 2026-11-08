import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pyanxzhxjhwolwpyozjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YW54emh4amh3b2x3cHlvempvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMjAyMDQsImV4cCI6MjEwOTU5NjIwNH0.T-8sAEurHo6yThOarVM-I2YL9ugphsF1y0U5_Gnr3Ws';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
