import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import optimizeProjectImage from '../lib/optimizeProjectImage.js';

const MAX_GALLERY_IMAGES = 40;

export default function ProjectForm({ projectId = null, onBack }) {
  const [id, setId] = useState(projectId);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState(2026);
  const [icon, setIcon] = useState('house');
  const [sortOrder, setSortOrder] = useState(0);
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [collections, setCollections] = useState([]);
  const [published, setPublished] = useState(true);
  const [showOnHome, setShowOnHome] = useState(false);

  // Gallery States
  const [galleryImages, setGalleryImages] = useState([]);
  const [pastedUrl, setPastedUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [addingUrl, setAddingUrl] = useState(false);

  // ক্যাটাগরি সিরিয়াল: Residential -> Commercial -> Religious
  const availableCollections = ['Residential', 'Commercial', 'Religious'];

  useEffect(() => {
    if (id) {
      fetchProjectData(id);
    }
  }, [id]);

  const fetchProjectData = async (projId) => {
    const { data: proj } = await supabase.from('projects').select('*').eq('id', projId).single();
    if (proj) {
      setName(proj.name || '');
      setSlug(proj.slug || '');
      setLocation(proj.location || '');
      setYear(proj.year || 2026);
      setIcon(proj.icon || 'house');
      setSortOrder(proj.sort_order || 0);
      setCoverUrl(proj.cover_url || '');
      setDescription(proj.description || '');
      setCollections(proj.collections || []);
      setPublished(proj.published ?? true);
      setShowOnHome(proj.show_on_home ?? false);
    }
    fetchGallery(projId);
  };

  const fetchGallery = async (projId) => {
    const { data: imgs } = await supabase.from('project_images').select('*').eq('project_id', projId);
    if (imgs) setGalleryImages(imgs);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!id) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleCollectionToggle = (item) => {
    if (collections.includes(item)) {
      setCollections(collections.filter((c) => c !== item));
    } else {
      setCollections([...collections, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      slug,
      location,
      year: parseInt(year) || 2026,
      icon,
      sort_order: parseInt(sortOrder) || 0,
      cover_url: coverUrl,
      description,
      collections,
      published,
      show_on_home: showOnHome,
    };

    if (!id) {
      const { data, error } = await supabase.from('projects').insert([payload]).select().single();
      if (error) {
        alert('Error creating project: ' + error.message);
      } else {
        setId(data.id);
        alert('Project created successfully! Now you can upload gallery images.');
      }
    } else {
      const { error } = await supabase.from('projects').update(payload).eq('id', id);
      if (error) alert('Error updating project: ' + error.message);
      else alert('Changes saved successfully!');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error && onBack) onBack();
  };

  // 📸 আপলোড লজিক (অটো কাভার সেট সুবিধা সহ)
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !id || uploading || addingUrl) return;

    const remainingSlots = MAX_GALLERY_IMAGES - galleryImages.length;
    if (files.length > remainingSlots) {
      alert(`This project can have up to ${MAX_GALLERY_IMAGES} gallery images. You can add ${Math.max(remainingSlots, 0)} more.`);
      e.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const newImageRecords = [];
      for (const [index, originalFile] of files.entries()) {
        const file = await optimizeProjectImage(originalFile);
        const fileName = `${id}/${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}_${file.name}`;

        const { error: uploadErr } = await supabase.storage
          .from('project-images')
          .upload(fileName, file);

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(fileName);
        newImageRecords.push({ project_id: id, image_url: urlData.publicUrl });
      }

      const { error: dbErr } = await supabase
        .from('project_images')
        .insert(newImageRecords);

      if (dbErr) throw dbErr;

      // যদি কাভার ছবি খালি থাকে তবে প্রথম ছবিটিকে কাভার বানিয়ে দিবে
      if (!coverUrl && newImageRecords.length > 0) {
        const newCoverUrl = newImageRecords[0].image_url;
        const { error: coverErr } = await supabase
          .from('projects')
          .update({ cover_url: newCoverUrl })
          .eq('id', id);

        if (coverErr) throw coverErr;
        setCoverUrl(newCoverUrl);
      }

      await fetchGallery(id);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrlImage = async () => {
    if (!pastedUrl.trim() || !id || uploading || addingUrl) return;
    if (galleryImages.length >= MAX_GALLERY_IMAGES) {
      alert(`This project has reached the ${MAX_GALLERY_IMAGES}-image gallery limit.`);
      return;
    }

    const newUrl = pastedUrl.trim();
    setAddingUrl(true);
    try {
      const { error } = await supabase
        .from('project_images')
        .insert([{ project_id: id, image_url: newUrl }]);

      if (error) throw error;
      if (!coverUrl) setCoverUrl(newUrl);
      await fetchGallery(id);
      setPastedUrl('');
    } catch (err) {
      alert('Failed to save image URL: ' + err.message);
    } finally {
      setAddingUrl(false);
    }
  };

  const handleDeleteGalleryImage = async (imgId) => {
    const { error } = await supabase.from('project_images').delete().eq('id', imgId);
    if (!error) fetchGallery(id);
  };

  return (
    <div className="w-full max-w-4xl rounded-lg border border-gray-100 bg-white p-8 font-sans shadow-sm max-[700px]:p-4">
      <div className="mb-6 flex items-center justify-between gap-4 max-[480px]:items-start">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-[#c65f20] mb-2 block cursor-pointer transition"
          >
            ← BACK TO PROJECTS
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{id ? name || 'Edit Project' : 'New Project'}</h1>
        </div>
        {id && (
          <button
            onClick={handleDeleteProject}
            className="border border-red-300 text-red-600 text-xs px-4 py-2 hover:bg-red-600 hover:text-white uppercase font-semibold cursor-pointer transition rounded"
          >
            DELETE PROJECT
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6 max-[700px]:grid-cols-1 max-[700px]:gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">NAME *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-[#c65f20]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">KEY (SLUG)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto from name"
              className="w-full border border-gray-300 p-2.5 text-sm text-gray-600 rounded focus:outline-none focus:border-[#c65f20]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 max-[700px]:grid-cols-1 max-[700px]:gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">LOCATION</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-[#c65f20]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">YEAR</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-[#c65f20]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 max-[700px]:grid-cols-1 max-[700px]:gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">ICON</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-[#c65f20] bg-white cursor-pointer"
            >
              <option value="house">house</option>
              <option value="building">building</option>
              <option value="mosque">mosque</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">SORT ORDER</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-[#c65f20]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            COVER IMAGE URL * (REQUIRED FOR HOME/WEBSITE DISPLAY)
          </label>
          <input
            type="text"
            placeholder="/images/....webp or https://....supabase.co/storage/..."
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-[#c65f20]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">DESCRIPTION</label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-[#c65f20]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">COLLECTIONS</label>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {availableCollections.map((col) => (
              <label key={col} className="flex items-center space-x-2 cursor-pointer text-sm font-medium select-none">
                <input
                  type="checkbox"
                  checked={collections.includes(col)}
                  onChange={() => handleCollectionToggle(col)}
                  className="w-4 h-4 rounded border-gray-300 text-[#c65f20] focus:ring-[#c65f20] cursor-pointer"
                />
                <span>{col}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium select-none">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded text-[#c65f20] focus:ring-[#c65f20] cursor-pointer"
              />
              <span>Published (visible on the site)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium select-none text-[#c65f20]">
              <input
                type="checkbox"
                checked={showOnHome}
                onChange={(e) => setShowOnHome(e.target.checked)}
                className="w-4 h-4 rounded text-[#c65f20] focus:ring-[#c65f20] cursor-pointer"
              />
              <span className="font-bold">Show on Home Page</span>
            </label>
          </div>

          <button
            type="submit"
            className="bg-[#c65f20] hover:bg-[#a84d18] text-white text-xs font-bold px-6 py-3 uppercase tracking-wider cursor-pointer transition rounded"
          >
            {id ? 'SAVE CHANGES' : 'CREATE PROJECT'}
          </button>
        </div>
      </form>

      {/* GALLERY SECTION */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-4">
          GALLERY ({galleryImages.length}/{MAX_GALLERY_IMAGES})
        </h3>

        {!id ? (
          <p className="text-sm text-gray-400">
            Save the project first — uploads and the gallery unlock after it exists.
          </p>
        ) : (
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <label className="bg-white border-2 border-[#c65f20] text-[#c65f20] hover:bg-[#c65f20] hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition rounded">
                {uploading ? 'UPLOADING IMAGES...' : 'UPLOAD IMAGES'}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading || addingUrl || galleryImages.length >= MAX_GALLERY_IMAGES}
                />
              </label>

              <input
                type="text"
                placeholder="...or paste image URL"
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                disabled={uploading || addingUrl || galleryImages.length >= MAX_GALLERY_IMAGES}
                className="w-72 max-w-full rounded border border-gray-300 p-2 text-sm focus:border-[#c65f20] focus:outline-none"
              />

              <button
                type="button"
                onClick={handleAddUrlImage}
                disabled={uploading || addingUrl || galleryImages.length >= MAX_GALLERY_IMAGES}
                className="bg-[#c65f20] hover:bg-[#a84d18] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition rounded disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingUrl ? 'ADDING URL...' : 'ADD URL'}
              </button>
            </div>

            {galleryImages.length >= MAX_GALLERY_IMAGES && (
              <p className="mb-4 text-sm text-amber-700">
                This project has reached the {MAX_GALLERY_IMAGES}-image limit.
              </p>
            )}

            {galleryImages.length === 0 ? (
              <p className="text-sm text-gray-400">No gallery images yet.</p>
            ) : (
              <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-3 max-[700px]:grid-cols-2 max-[380px]:grid-cols-1">
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative group border border-gray-200 rounded overflow-hidden">
                    <img src={img.image_url} alt="Gallery" loading="lazy" decoding="async" className="h-32 w-full object-cover" />
                    
                    {/* SET AS COVER BUTTON */}
                    <button
                      type="button"
                      onClick={() => setCoverUrl(img.image_url)}
                      className="absolute bottom-1 left-1 bg-[#c65f20] text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition cursor-pointer font-bold rounded"
                    >
                      SET AS COVER
                    </button>

                    {/* REMOVE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition cursor-pointer font-bold rounded"
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}