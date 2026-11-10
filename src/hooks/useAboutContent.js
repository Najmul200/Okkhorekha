import { useEffect, useState } from 'react';
import { DEFAULT_ABOUT_CONTENT } from '../data/aboutContent.js';
import { supabase } from '../lib/supabase';

export default function useAboutContent() {
  const [content, setContent] = useState(DEFAULT_ABOUT_CONTENT);

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      const { data, error } = await supabase
        .from('about_content')
        .select('content')
        .eq('id', 'about')
        .maybeSingle();

      if (!active) return;
      if (error) {
        console.error('Failed to load About Us content:', error);
        return;
      }
      if (data?.content) {
        setContent({ ...DEFAULT_ABOUT_CONTENT, ...data.content });
      }
    };

    loadContent();
    const channel = supabase
      .channel('about-content-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'about_content', filter: 'id=eq.about' },
        loadContent
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`About Us live updates subscription failed: ${status}`);
        }
      });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return content;
}
