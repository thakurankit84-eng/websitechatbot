import { useState, useEffect } from 'react';
import { supabase, FAQ, SUPABASE_ENABLED } from '../lib/supabase';
import { getDefaultFaqs } from '../lib/faqRepository';

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    // Ensure defaults exist only when first visiting the admin page
    ensureDefaults();
    fetchFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureDefaults = async () => {
    if (!SUPABASE_ENABLED) return;

    try {
      const { data, error } = await (supabase as any).from('faqs').select('id').limit(1);
      if (error) throw error;
      if (!data || data.length === 0) {
        // Insert default faqs
        const defaults = getDefaultFaqs().map(f => ({ question: f.question, answer: f.answer, category: f.category, keywords: f.keywords }));
        const { error: insertError } = await (supabase as any).from('faqs').insert(defaults);
        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error ensuring default FAQs:', err);
    }
  };

  const fetchFaqs = async () => {
    if (!SUPABASE_ENABLED) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).from('faqs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setFaqs((data as FAQ[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addFaq = async () => {
    if (!SUPABASE_ENABLED) return alert('Supabase not configured');
    if (!question || !answer) return alert('Question and answer are required');
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).from('faqs').insert([{ question, answer, category, keywords }]);
      if (error) throw error;
      setQuestion('');
      setAnswer('');
      setCategory('');
      setKeywords('');
      fetchFaqs();
    } catch (err) {
      console.error(err);
      alert('Failed to add FAQ');
    } finally {
      setLoading(false);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!SUPABASE_ENABLED) return alert('Supabase not configured');
    if (!confirm('Delete this FAQ?')) return;
    try {
      const { error } = await (supabase as any).from('faqs').delete().eq('id', id);
      if (error) throw error;
      fetchFaqs();
    } catch (err) {
      console.error(err);
      alert('Failed to delete FAQ');
    }
  };

  // Bulk sync defaults: update matching questions, insert missing ones
  const syncDefaults = async () => {
    if (!SUPABASE_ENABLED) return alert('Supabase not configured');
    if (!confirm('Sync default FAQs to Supabase? This will update existing entries with the same question text and add any missing defaults.')) return;

    setLoading(true);
    try {
      // Fetch existing faqs (id + question)
      const { data: existingData, error: fetchError } = await (supabase as any).from('faqs').select('id,question');
      if (fetchError) throw fetchError;
      const existing = (existingData as any[]) || [];
      const questionToId = new Map<string, string>();
      for (const row of existing) {
        if (row.question) questionToId.set(row.question as string, row.id as string);
      }

      const defaults = getDefaultFaqs();
      const toInsert: Array<Partial<FAQ>> = [];

      // Update existing entries where question matches
      for (const def of defaults) {
        const existingId = questionToId.get(def.question);
        const payload = { question: def.question, answer: def.answer, category: def.category, keywords: def.keywords };
        if (existingId) {
          const { error: updateError } = await (supabase as any).from('faqs').update(payload).eq('id', existingId);
          if (updateError) console.error('Failed to update FAQ:', def.question, updateError);
        } else {
          toInsert.push(payload);
        }
      }

      // Insert any missing defaults in a single batch
      if (toInsert.length > 0) {
        const { error: insertError } = await (supabase as any).from('faqs').insert(toInsert);
        if (insertError) throw insertError;
      }

      alert('FAQ sync completed');
      fetchFaqs();
    } catch (err) {
      console.error('Error syncing defaults:', err);
      alert('Failed to sync defaults. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Manage FAQs</h2>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="border p-2" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <input className="border p-2" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <textarea className="border p-2 col-span-1 md:col-span-2" placeholder="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <input className="border p-2" placeholder="Keywords (comma separated)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={addFaq} className="bg-red-600 text-white px-4 py-2 rounded">Add FAQ</button>
        <button onClick={fetchFaqs} className="bg-gray-200 px-4 py-2 rounded">Refresh</button>
        <button onClick={syncDefaults} className="bg-blue-600 text-white px-4 py-2 rounded">Sync Defaults</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left">
              <th className="p-2 border">Question</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Keywords</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((f) => (
              <tr key={f.id}>
                <td className="p-2 border">{f.question}</td>
                <td className="p-2 border">{f.category}</td>
                <td className="p-2 border">{f.keywords}</td>
                <td className="p-2 border">
                  <button onClick={() => deleteFaq(f.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
