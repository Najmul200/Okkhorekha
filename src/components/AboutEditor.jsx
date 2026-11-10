import { useEffect, useState } from 'react';
import { DEFAULT_ABOUT_CONTENT } from '../data/aboutContent.js';
import { supabase } from '../lib/supabase';

const textFields = [
  ['homeTitle', 'Homepage section title'],
  ['homeSubtitle', 'Homepage subtitle'],
  ['homeKicker', 'Homepage small heading'],
  ['homeHeading', 'Homepage main heading'],
  ['homeParagraph', 'Homepage paragraph 1'],
  ['homeParagraphTwo', 'Homepage paragraph 2'],
  ['pageEyebrow', 'About page eyebrow'],
  ['pageTitle', 'About page title'],
  ['pageIntro', 'About page introduction'],
  ['pointEyebrow', 'Point-of-view eyebrow'],
  ['pointTitle', 'Point-of-view heading'],
  ['pointParagraph', 'Point-of-view paragraph 1'],
  ['pointParagraphTwo', 'Point-of-view paragraph 2'],
  ['practicesTitle', 'Services section title'],
  ['practicesDescription', 'Services section description'],
];

function Field({ label, value, onChange, multiline = false }) {
  const Input = multiline ? 'textarea' : 'input';
  return (
    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
      {label}
      <Input
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        rows={multiline ? 3 : undefined}
        className="mt-2 w-full rounded border border-gray-300 p-2.5 text-sm font-normal normal-case tracking-normal text-gray-800 focus:border-[#c65f20] focus:outline-none"
      />
    </label>
  );
}

export default function AboutEditor() {
  const [content, setContent] = useState(DEFAULT_ABOUT_CONTENT);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;
    supabase
      .from('about_content')
      .select('content')
      .eq('id', 'about')
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setErrorMessage(`Could not load About Us content: ${error.message}`);
          return;
        }
        if (data?.content) setContent({ ...DEFAULT_ABOUT_CONTENT, ...data.content });
      });

    return () => {
      active = false;
    };
  }, []);

  const updateContent = (key, value) => {
    setContent((current) => ({ ...current, [key]: value }));
    setSuccessMessage('');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const filePath = `about/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from('project-images').upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from('project-images').getPublicUrl(filePath);
      updateContent('imageUrl', data.publicUrl);
    } catch (error) {
      setErrorMessage(`Image upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await supabase.from('about_content').upsert({
      id: 'about',
      content,
      updated_at: new Date().toISOString(),
    });

    if (error) setErrorMessage(`Could not save About Us content: ${error.message}`);
    else setSuccessMessage('About Us content saved and published.');
    setSaving(false);
  };

  const updateListItem = (key, index, field, value) => {
    const items = [...content[key]];
    items[index] = typeof items[index] === 'string'
      ? value
      : { ...items[index], [field]: value };
    updateContent(key, items);
  };

  return (
    <form onSubmit={handleSave} className="w-full max-w-5xl min-w-0 rounded-lg border border-gray-100 bg-white p-8 shadow-sm max-[700px]:p-4">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Website content</span>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">About Us</h1>
          <p className="mt-2 text-sm text-gray-500">Edits publish to the homepage and About Us page.</p>
        </div>
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded bg-[#c65f20] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#a84d18] disabled:opacity-60"
        >
          {saving ? 'SAVING...' : 'SAVE AND PUBLISH'}
        </button>
      </div>

      {errorMessage && <p role="alert" className="mb-5 rounded bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
      {successMessage && <p role="status" className="mb-5 rounded bg-green-50 p-3 text-sm text-green-700">{successMessage}</p>}

      <div className="space-y-8">
        <section className="space-y-4 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Studio image</h2>
          {content.imageUrl && <img src={content.imageUrl} alt="About studio preview" className="h-48 w-full max-w-md rounded object-cover" />}
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded border border-[#c65f20] px-4 py-2 text-xs font-bold text-[#c65f20]">
              {uploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
            <span className="text-xs text-gray-400">or enter an image URL below</span>
          </div>
          <Field label="Image URL" value={content.imageUrl} onChange={(value) => updateContent('imageUrl', value)} />
        </section>

        <section className="space-y-4 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Homepage About section</h2>
          {textFields.slice(0, 6).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={content[key]}
              multiline={key.toLowerCase().includes('paragraph') || key === 'homeSubtitle'}
              onChange={(value) => updateContent(key, value)}
            />
          ))}
          <div className="grid min-w-0 gap-4 md:grid-cols-3">
            {content.homeHighlights.map((item, index) => (
              <Field
                key={`highlight-${index}`}
                label={`Highlight ${index + 1}`}
                value={item}
                onChange={(value) => updateListItem('homeHighlights', index, null, value)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">About Us page</h2>
          {textFields.slice(6).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={content[key]}
              multiline={key.toLowerCase().includes('paragraph') || key === 'pageIntro' || key === 'practicesDescription'}
              onChange={(value) => updateContent(key, value)}
            />
          ))}
          <div className="grid min-w-0 gap-4 md:grid-cols-3">
            {content.practices.map((practice, index) => (
              <div key={`practice-${index}`} className="space-y-3 rounded border border-gray-200 p-3">
                <Field label={`Practice ${index + 1} title`} value={practice.title} onChange={(value) => updateListItem('practices', index, 'title', value)} />
                <Field label="Description" value={practice.text} onChange={(value) => updateListItem('practices', index, 'text', value)} multiline />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Studio statistics</h2>
          <div className="grid min-w-0 gap-4 md:grid-cols-3">
            {content.stats.map((stat, index) => (
              <div key={`stat-${index}`} className="space-y-3 rounded border border-gray-200 p-3">
                <Field label={`Statistic ${index + 1} value`} value={stat.value} onChange={(value) => updateListItem('stats', index, 'value', value)} />
                <Field label="Label" value={stat.label} onChange={(value) => updateListItem('stats', index, 'label', value)} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-5 text-right">
        <button type="submit" disabled={saving || uploading} className="rounded bg-[#c65f20] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60">
          {saving ? 'SAVING...' : 'SAVE AND PUBLISH'}
        </button>
      </div>
    </form>
  );
}
