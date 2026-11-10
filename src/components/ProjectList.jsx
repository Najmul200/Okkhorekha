import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
<div className="p-8 bg-white min-h-screen font-sans w-full"></div>


export default function ProjectList({ onNewProject, onEditProject }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error) setProjects(data || []);
  };

  const handleMove = async (currentIndex, direction) => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const currentItem = projects[currentIndex];
    const targetItem = projects[targetIndex];

    const { error } = await supabase.from('projects').upsert([
      { id: currentItem.id, sort_order: targetItem.sort_order },
      { id: targetItem.id, sort_order: currentItem.sort_order }
    ]);

    if (!error) fetchProjects();
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans max-[700px]:p-4">
      <div className="mb-6 flex items-center justify-between gap-4 max-[480px]:items-start">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{projects.length} TOTAL</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Projects</h1>
        </div>
    <button onClick={onNewProject} className="shrink-0 bg-[#c65f20] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b05219] max-[480px]:px-3">
  NEW PROJECT
</button>
        
      </div>

      <div className="admin-table">
      <table className="admin-table-row w-full border-collapse text-left">
        <thead>
          <tr className="border-b text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
            <th className="py-3">#</th>
            <th className="py-3">COVER</th>
            <th className="py-3">PROJECT</th>
            <th className="py-3">LOCATION</th>
            <th className="py-3">YEAR</th>
            <th className="py-3">STATUS</th>
            <th className="py-3 text-center">ORDER</th>
            <th className="py-3 text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((item, index) => (
            <tr key={item.id} className="border-b text-sm text-gray-700 hover:bg-gray-50/50">
              <td className="py-4 text-gray-400 font-mono">{String(index + 1).padStart(2, '0')}</td>
              <td className="py-4">
                {item.cover_url ? (
                  <img src={item.cover_url} alt="" loading="lazy" decoding="async" className="h-12 w-12 border border-gray-200 object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                    No Image
                  </div>
                )}
              </td>
              <td className="py-4">
                <div className="font-bold text-gray-900">{item.name}</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">
                  {item.collections?.join(', ') || item.slug}
                </div>
              </td>
              <td className="py-4 text-gray-600">{item.location}</td>
              <td className="py-4 text-gray-600 font-mono">{item.year}</td>
              <td className="py-4">
                <span className="border border-black text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                  {item.published ? 'LIVE' : 'DRAFT'}
                </span>
              </td>
              <td className="py-4 text-center">
                <div className="inline-flex border border-gray-200">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-30 border-r"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === projects.length - 1}
                    className="px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </td>
              <td className="py-4 text-right">
                <button
                  onClick={() => onEditProject(item.id)}
                  className="text-xs text-gray-600 hover:text-black font-medium underline underline-offset-2"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}