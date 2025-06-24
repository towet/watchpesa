import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Plus, Save, XCircle } from 'lucide-react';

// Interfaces matching Supabase tables
interface Category {
  id: string;
  title: string;
  description: string;
  thumbnail: string; // Corrected from image_url
  earn_per_video: number;
  total_views: string;
  video_count: number;
  premium: boolean;
}

interface Video {
  id: string;
  category_id: string;
  title: string;
  description: string;
  duration: number;
  earn_amount: number;
  youtube_id: string;
  thumbnail: string;
  price: number;
  video_url: string;
  premium: boolean;
}

// A generic, reusable form input component
function FormInput({ label, value, onChange, type = 'text', placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );
}

export default function AdminPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  
  // State for forms
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingVideo, setEditingVideo] = useState<Partial<Video> | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    const { data: catData, error: catErr } = await supabase.from('categories').select('*').order('created_at');
    const { data: vidData, error: vidErr } = await supabase.from('videos').select('*').order('created_at');
    if (catErr || vidErr) {
      setError(catErr?.message || vidErr?.message || 'Error loading data');
    } else {
      setCategories(catData || []);
      setVideos(vidData || []);
    }
    setLoading(false);
  }

  // --- CRUD Handlers ---
  async function handleSaveCategory() {
    if (!editingCategory) return;
    setLoading(true);
    const { id, ...updateData } = editingCategory;
    const { error } = id
      ? await supabase.from('categories').update(updateData).eq('id', id)
      : await supabase.from('categories').insert(updateData).select();
    
    if (error) setError(error.message);
    setEditingCategory(null);
    await fetchData();
  }

  async function handleDeleteCategory(id: string) {
    if (!window.confirm('Delete this category and all its videos?')) return;
    setLoading(true);
    await supabase.from('videos').delete().eq('category_id', id); // Delete associated videos
    await supabase.from('categories').delete().eq('id', id);
    await fetchData();
  }

  async function handleSaveVideo() {
    if (!editingVideo) return;

    // --- FORM VALIDATION ---
    if (!editingVideo.title || !editingVideo.video_url || !editingVideo.earn_amount || editingVideo.earn_amount <= 0) {
      setError('Please fill out all required fields. Earn Amount must be greater than 0.');
      return;
    }

    setLoading(true);
    const { id, ...updateData } = editingVideo;
    const { error } = id
      ? await supabase.from('videos').update(updateData).eq('id', id)
      : await supabase.from('videos').insert(updateData).select();

    if (error) {
      setError(error.message);
    } else {
      setError(null); // Clear previous errors on success
      setEditingVideo(null);
      await fetchData();
    }
    setLoading(false);
  }

  async function handleDeleteVideo(id: string) {
    if (!window.confirm('Delete this video?')) return;
    setLoading(true);
    await supabase.from('videos').delete().eq('id', id);
    await fetchData();
  }
  
  // --- Form Rendering ---
  function renderCategoryForm() {
    if (!editingCategory) return null;
    const setField = (field: keyof Category, value: any) => setEditingCategory(prev => ({ ...prev, [field]: value }));

    return (
      <Card className="mb-4 bg-gray-50 p-4">
        <CardContent className="space-y-3">
          <h3 className="text-lg font-semibold">{editingCategory.id ? 'Edit' : 'Add'} Category</h3>
          <FormInput label="Title" value={editingCategory.title} onChange={(e: any) => setField('title', e.target.value)} />
          <FormInput label="Description" value={editingCategory.description} onChange={(e: any) => setField('description', e.target.value)} />
          <FormInput label="Thumbnail URL" value={editingCategory.thumbnail} onChange={(e: any) => setField('thumbnail', e.target.value)} />
          <FormInput label="Earn Per Video" type="number" value={editingCategory.earn_per_video} onChange={(e: any) => setField('earn_per_video', Number(e.target.value))} />
          <FormInput label="Total Views" value={editingCategory.total_views} onChange={(e: any) => setField('total_views', e.target.value)} />
          <FormInput label="Video Count" type="number" value={editingCategory.video_count} onChange={(e: any) => setField('video_count', Number(e.target.value))} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!editingCategory.premium} onChange={e => setField('premium', e.target.checked)} />
            Premium
          </label>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSaveCategory}><Save className="h-4 w-4 mr-1" />Save</Button>
            <Button variant="outline" onClick={() => setEditingCategory(null)}><XCircle className="h-4 w-4 mr-1" />Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderVideoForm() {
    if (!editingVideo) return null;
    const setField = (field: keyof Video, value: any) => setEditingVideo(prev => ({ ...prev, [field]: value }));

    return (
      <Card className="mb-2 ml-8 bg-gray-50 p-4">
        <CardContent className="space-y-3">
          <h3 className="text-lg font-semibold">{editingVideo.id ? 'Edit' : 'Add'} Video</h3>
          <FormInput label="Title" value={editingVideo.title} onChange={(e: any) => setField('title', e.target.value)} />
          <FormInput label="Description" value={editingVideo.description} onChange={(e: any) => setField('description', e.target.value)} />
          <FormInput label="Thumbnail URL" value={editingVideo.thumbnail} onChange={(e: any) => setField('thumbnail', e.target.value)} />
          <FormInput label="Video URL" value={editingVideo.video_url} onChange={(e: any) => setField('video_url', e.target.value)} />
          <FormInput label="Duration (min)" type="number" value={editingVideo.duration} onChange={(e: any) => setField('duration', Number(e.target.value))} />
          <FormInput label="Earn Amount *" type="number" value={editingVideo.earn_amount} onChange={(e: any) => setField('earn_amount', Number(e.target.value))} placeholder="Must be > 0" />
          <FormInput label="Price" type="number" value={editingVideo.price} onChange={(e: any) => setField('price', Number(e.target.value))} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!editingVideo.premium} onChange={e => setField('premium', e.target.checked)} />
            Premium
          </label>
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSaveVideo}
              disabled={!editingVideo.title || !editingVideo.video_url || !editingVideo.earn_amount || editingVideo.earn_amount <= 0}
            >
              <Save className="h-4 w-4 mr-1" />Save
            </Button>
            <Button variant="outline" onClick={() => setEditingVideo(null)}><XCircle className="h-4 w-4 mr-1" />Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button onClick={() => setEditingCategory({})}><Plus className="h-4 w-4 mr-1" />Add Category</Button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">Error: {error}</div>}
      {loading && <div className="text-gray-500 mb-4">Loading...</div>}

      {/* Add/Edit Category Form */} 
      {editingCategory && !editingCategory.id && renderCategoryForm()}

      {/* Category & Video List */}
      <div className="space-y-8">
        {categories.map(cat => (
          <div key={cat.id}>
            {editingCategory?.id === cat.id ? renderCategoryForm() : (
              <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img src={cat.thumbnail || 'https://placehold.co/128x80'} alt={cat.title} className="w-32 h-20 object-cover rounded-lg bg-gray-200" />
                  <div className="flex-1">
                    <div className="font-bold text-lg">{cat.title}</div>
                    <p className="text-gray-600 text-sm mb-1">{cat.description}</p>
                    <div className="text-xs text-gray-500">ID: {cat.id}</div>
                  </div>
                  <div className="flex gap-2 self-start sm:self-center">
                    <Button size="sm" variant="outline" onClick={() => setEditingCategory(cat)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Section */}
            <div className="pl-4 sm:pl-12 mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-700">Videos</h4>
                <Button size="sm" variant="ghost" onClick={() => setEditingVideo({ category_id: cat.id })}><Plus className="h-4 w-4 mr-1" />Add Video</Button>
              </div>
              {editingVideo && editingVideo.category_id === cat.id && !editingVideo.id && renderVideoForm()}
              {videos.filter(v => v.category_id === cat.id).map(video => (
                <div key={video.id}>
                  {editingVideo?.id === video.id ? renderVideoForm() : (
                    <Card className="bg-white">
                      <CardContent className="p-3 flex items-start sm:items-center gap-4">
                        <img src={video.thumbnail || 'https://placehold.co/96x64'} alt={video.title} className="w-24 h-16 object-cover rounded-md bg-gray-200" />
                        <div className="flex-1">
                          <div className="font-bold">{video.title}</div>
                          <p className="text-gray-600 text-sm">Earn: {video.earn_amount} KSH | Price: {video.price} KSH</p>
                        </div>
                        <div className="flex gap-2 self-start sm:self-center">
                          <Button size="sm" variant="outline" onClick={() => setEditingVideo(video)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteVideo(video.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
