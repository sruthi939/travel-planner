import { useState, useEffect } from 'react';
import { Destination } from '../types/Destination';
import axios from 'axios';

export default function AdminDashboard() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState<Partial<Destination>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/destinations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDestinations(res.data);
    } catch (err) {
      console.error('Failed to fetch destinations');
      alert('Could not load destinations.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/destinations/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/destinations', form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchDestinations();
      setForm({});
      setEditingId(null);
    } catch (err) {
      alert('Failed to save destination.');
    }
  };

  const handleEdit = (dest: Destination) => {
    setForm(dest);
    setEditingId(dest._id!);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/destinations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDestinations();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-8 py-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Destino Admin
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              window.location.href = '/admin/login';
            }}
            className="text-red-400 hover:text-red-300 transition duration-200 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Add/Edit Form */}
        <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-5 text-gray-100 border-b border-gray-600 pb-2">
            {editingId ? 'Edit' : 'Add New'} Destination
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              placeholder="Title"
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              required
            />
            <input
              placeholder="Location"
              value={form.location || ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              required
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={form.days || ''}
              onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              required
            />
            <input
              placeholder="Image URL"
              value={form.image || ''}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            />
            <textarea
              placeholder="Description"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              rows={3}
            />
            <div className="col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                {editingId ? 'Update' : 'Add'} Destination
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({});
                    setEditingId(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-medium px-6 py-2.5 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Destinations Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.length === 0 ? (
            <p className="col-span-full text-center text-gray-400 text-lg">No destinations found.</p>
          ) : (
            destinations.map((dest) => (
              <div
                key={dest._id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={dest.image}
                  alt={dest.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
                <div className="p-5">
                  <h3 className="font-bold text-lg text-white">{dest.title}</h3>
                  <p className="text-blue-300">{dest.location}</p>
                  <p className="text-green-400 font-semibold mt-1">
                    ${dest.price} <span className="text-sm text-gray-300">for {dest.days} days</span>
                  </p>
                  <p className="text-gray-300 text-sm mt-2 line-clamp-2">{dest.description}</p>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => handleEdit(dest)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dest._id!)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}