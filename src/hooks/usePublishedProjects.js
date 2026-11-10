import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function usePublishedProjects({ homeOnly = false } = {}) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let active = true;
    let query = supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true });

    if (homeOnly) query = query.eq('show_on_home', true);

    query.then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error('Failed to load published projects:', error);
        return;
      }
      setProjects(data || []);
    });

    return () => {
      active = false;
    };
  }, [homeOnly]);

  return projects;
}
