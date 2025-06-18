import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000'); // Update to backend URL after deployment

function App() {
  const [disasters, setDisasters] = useState([]);
  const [form, setForm] = useState({ title: '', location_name: '', description: '', tags: '' });
  const [report, setReport] = useState({ content: '', image_url: '' });

  // Fetch disasters and set up WebSocket listeners
  useEffect(() => {
    // Fetch initial disasters
    axios.get('http://localhost:3000/disasters')
      .then(res => setDisasters(res.data))
      .catch(err => console.error('Error fetching disasters:', err));

    // WebSocket listeners for real-time updates
    socket.on('disaster_updated', (data) => {
      if (data.deleted) {
        setDisasters(prev => prev.filter(d => d.id !== data.id));
      } else {
        setDisasters(prev => [...prev.filter(d => d.id !== data.id), data]);
      }
      console.log('Disaster updated:', data);
    });

    socket.on('social_media_updated', (data) => {
      console.log('Social media update:', data);
    });

    socket.on('resources_updated', (data) => {
      console.log('Resources update:', data);
    });

    // Cleanup WebSocket connection
    return () => socket.disconnect();
  }, []);

  // Handle disaster form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/disasters', {
        ...form,
        tags: form.tags.split(',').map(tag => tag.trim())
      });
      setForm({ title: '', location_name: '', description: '', tags: '' });
    } catch (err) {
      console.error('Error creating disaster:', err);
    }
  };

  // Handle report submission
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/disasters/123/verify-image', report);
      setReport({ content: '', image_url: '' });
    } catch (err) {
      console.error('Error submitting report:', err);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">DisasterSync</h1>

      {/* Disaster Creation Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Create Disaster</h2>
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Title (e.g., NYC Flood)"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Location (e.g., Manhattan, NYC)"
            value={form.location_name}
            onChange={e => setForm({ ...form, location_name: e.target.value })}
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="border p-2 rounded"
            rows="4"
          />
          <input
            type="text"
            placeholder="Tags (comma-separated, e.g., flood,urgent)"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Add Disaster
          </button>
        </div>
      </form>

      {/* Report Submission Form */}
      <form onSubmit={handleReportSubmit} className="mb-8 p-4 border rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Submit Report</h2>
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Report Content (e.g., Need food in Lower East Side)"
            value={report.content}
            onChange={e => setReport({ ...report, content: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Image URL (e.g., http://example.com/flood.jpg)"
            value={report.image_url}
            onChange={e => setReport({ ...report, image_url: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Submit Report
          </button>
        </div>
      </form>

      {/* Display Disasters */}
      <h2 className="text-xl font-semibold mb-4">Disasters</h2>
      <ul className="border p-4 rounded">
        {disasters.length === 0 && <li>No disasters found.</li>}
        {disasters.map(d => (
          <li key={d.id} className="mb-2">
            <strong>{d.title}</strong> - {d.location_name} ({d.tags.join(', ')})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;