import { useState, useEffect } from 'react';
import axios from 'axios';
import { Destination } from '@/types/Destination';

export default function AdminDashboard() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState<Partial<Destination>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/destinations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDestinations(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/destinations/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/destinations', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchDestinations();
      setForm({});
      setEditingId(null);
    } catch (err) {
      alert('Failed to save');
    }
  };

  const handleEdit = (dest: Destination) => {
    setForm(dest);
    setEditingId(dest._id!);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this destination?')) return;
    await axios.delete(`http://localhost:5000/api/admin/destinations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchDestinations();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Destino Admin</h1>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              window.location.href = '/admin/login';
            }}
            className="text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Add/Edit Form */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit' : 'Add New'} Destination</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Title"
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border p-3 rounded-lg"
              required
            />
            <input
              placeholder="Location"
              value={form.location || ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="border p-3 rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="border p-3 rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="Days"
              value={form.days || ''}
              onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
              className="border p-3 rounded-lg"
              required
            />
            <input
              placeholder="Image URL"
              value={form.image || ''}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="border p-3 rounded-lg md:col-span-2"
            />
            <textarea
              placeholder="Description"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border p-3 rounded-lg md:col-span-2"
              rows={3}
            />
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg"
              >
                {editingId ? 'Update' : 'Add'} Destination
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setForm({}); setEditingId(null); }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Destinations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div key={dest._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <img src={dest.image} alt={dest.title} className="w-full h-48 object-cover" />
              <div className="p-5">
                <h3 className="font-bold text-lg">{dest.title}</h3>
                <p className="text-gray-600">{dest.location}</p>
                <p className="text-blue-600 font-semibold">${dest.price} <span className="text-sm">for {dest.days} days</span></p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{dest.description}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(dest)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dest._id!)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}