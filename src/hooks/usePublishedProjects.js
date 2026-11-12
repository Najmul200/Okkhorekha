import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PROJECT_CACHE_TTL_MS = 30_000;
const projectCache = new Map();

export default function usePublishedProjects({ homeOnly = false, includeUnpublished = false } = {}) {
  const cacheKey = `${homeOnly ? 'home' : 'all'}:${includeUnpublished ? 'all-statuses' : 'published'}`;
  const [projects, setProjects] = useState(() => projectCache.get(cacheKey)?.data || []);

  useEffect(() => {
    let active = true;
    const cached = projectCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < PROJECT_CACHE_TTL_MS) {
      setProjects(cached.data);
      return () => {
        active = false;
      };
    }

    let query = supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!includeUnpublished) query = query.eq('published', true);

    if (homeOnly) query = query.eq('show_on_home', true);

    const request = cached?.request || Promise.resolve(query);
    if (!cached?.request) {
      projectCache.set(cacheKey, {
        data: cached?.data || [],
        fetchedAt: cached?.fetchedAt || 0,
        request,
      });
    }

    request.then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error('Failed to load published projects:', error);
        projectCache.delete(cacheKey);
        return;
      }
      const freshProjects = data || [];
      projectCache.set(cacheKey, { data: freshProjects, fetchedAt: Date.now(), request: null });
      setProjects(freshProjects);
    });

    return () => {
      active = false;
    };
  }, [cacheKey, homeOnly, includeUnpublished]);

  return projects;
}
