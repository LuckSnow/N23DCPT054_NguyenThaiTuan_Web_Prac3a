'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data);
    } catch {
      toast.error('Không thể kết nối server!');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/posts', { title, content, author });
      toast.success('Đăng bài thành công!');
      setTitle('');
      setContent('');
      setAuthor('');
      fetchPosts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id: number) => {
    // 1. Xác nhận người dùng
    if (!confirm('Bạn chắc chắn muốn xoá bài viết này?')) return;

    try {
      // 2. Gọi API xoá
      await api.delete(`/api/posts/${id}`);
      // 3. Cập nhật state NGAY (optimistic update) — không cần gọi lại API, UX nhanh hơn
      setPosts((prev) => prev.filter((p) => p.id !== id));
      // 4. Hiển thị toast thành công
      toast.success('Đã xoá bài viết', { icon: '🗑️' });
    } catch {
      toast.error('Xoá thất bại, thử lại!');
      // Rollback: gọi lại server để đồng bộ dữ liệu
      fetchPosts();
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Đăng bài
        </button>
      </form>

      <div className="space-y-3">
        {posts.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center p-3 border rounded mb-2 shadow-sm"
          >
            <div>
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-sm text-gray-500">
                {p.author} · {p.content}
              </p>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition"
            >
              Xoá
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}