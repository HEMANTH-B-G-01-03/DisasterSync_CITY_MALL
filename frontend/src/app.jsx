import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');

function App() {
  const [disasters, setDisasters] = useState([]);
  const [form, setForm] = useState({ title: '', location_name: '', description: '', tags: '' });
  const [report, setReport] = useState({ content: '', image_url: '' });

  useEffect(() => {
    // Fetch disasters
    axios.get('http://localhost:3000/disasters').then(res => setDisasters(res.data));

    // WebSocket listeners
    socket.on('disaster_updated', (data) => {
      setDisasters(prev => [...prev.filter(d => d.id !== data.id), data]);
    });
    socket.on('social_media_updated', (data) => {
      console.log('Social media update:', data);
    });
    socket.on('resources_updated', (data) => {
      console.log('Resources update:', data);
    });

    return () => socket.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:3000/disasters', {
      ...form,
      tags: form.tags.split(',')
    });
    setForm({ title: '', location_name: '', description: '', tags: '' });
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:3000/disasters/123/verify-image', report);
    setReport({ content: '', image_url: '' });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl">DisasterSync</h1>
      <form onSubmit={handleSubmit} className="my-4">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Location"
          value={form.location_name}
          onChange={e => setForm({ ...form, location_name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">Add Disaster</button>
      </form>
      <form onSubmit={handleReportSubmit} className="my-4">
        <input
          type="text"
          placeholder="Report Content"
          value={report.content}
          onChange={e => setReport({ ...report, content: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={report.image_url}
          onChange={e => setReport({ ...report, image_url: e.target.value })}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-green-500 text-white p-2">Submit Report</button>
      </form>
      <h2 className="text-xl">Disasters</h2>
      <ul>
        {disasters.map(d => (
          <li key={d.id}>{d.title} - {d.location_name} ({d.tags.join(', ')})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;