'use client';

import React, { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  const fetchPosts = async () => {
    const res = await fetch('http://localhost:5000/api/posts');
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, author }),
    });

    if (res.ok) {
      setTitle('');
      setContent('');
      setAuthor('');
      fetchPosts(); // refresh danh sách
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý bài viết</h1>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung"
          className="w-full border p-2 rounded"
          required
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Tác giả"
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Đăng bài
        </button>
      </form>

      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="border p-4 rounded">
            <h3 className="font-bold text-lg">{p.title}</h3>
            <p className="text-gray-600">
              {p.author} — {p.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}