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
  updatedAt?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form tạo bài viết
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  // Trạng thái modal chỉnh sửa (Nâng cao 1)
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Lấy danh sách bài viết từ Backend
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/posts');
      setPosts(res.data);
    } catch {
      toast.error('Không thể kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Xử lý tạo bài viết mới (Tiết 2)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim()) {
      toast.error('Vui lòng nhập đầy đủ các trường thông tin!');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/posts', { title, content, author });
      toast.success('Đăng bài thành công!');
      setTitle('');
      setContent('');
      setAuthor('');
      fetchPosts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra khi tạo bài viết!');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xóa bài viết với Optimistic Update (Tiết 4-5 - Bài tập bắt buộc)
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

  // Mở modal sửa bài viết (Nâng cao 1)
  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditAuthor(post.author);
  };

  const closeEditModal = () => {
    setEditingPost(null);
    setEditTitle('');
    setEditContent('');
    setEditAuthor('');
  };

  // Xử lý cập nhật bài viết (PUT /api/posts/:id - Nâng cao 1)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    if (!editTitle.trim() || !editContent.trim() || !editAuthor.trim()) {
      toast.error('Vui lòng không để trống thông tin!');
      return;
    }

    try {
      setIsUpdating(true);
      const res = await api.put(`/api/posts/${editingPost.id}`, {
        title: editTitle,
        content: editContent,
        author: editAuthor,
      });

      // Cập nhật lại bài viết trong state
      setPosts((prev) =>
        prev.map((p) => (p.id === editingPost.id ? res.data : p))
      );

      toast.success('Cập nhật bài viết thành công!');
      closeEditModal();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Cập nhật thất bại!');
    } finally {
      setIsUpdating(false);
    }
  };

  // Format ngày tháng hiển thị thân thiện
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Vừa xong';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Vừa xong';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-800">
      {/* Header điều hướng hiện đại */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
              LB
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                Fullstack Blog
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Lab 3
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                NextJS App Router + Express Integration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Backend :5000
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
              {posts.length} bài viết
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột trái: Form tạo bài viết */}
          <section className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 sticky top-24">
              <div className="mb-5 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">✍️</span>
                  Tạo bài viết mới
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập thông tin bên dưới để gửi bài viết lên Backend Express
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Tiêu đề bài viết
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Tìm hiểu về Next.js và Express"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Tác giả
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Thái Tuấn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Nội dung bài viết
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Chia sẻ kiến thức, hướng dẫn hoặc suy nghĩ của bạn..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-medium text-sm shadow-md shadow-indigo-200 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang lưu bài viết...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng bài viết</span>
                      <span>🚀</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Cột phải: Danh sách bài viết */}
          <section className="lg:col-span-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">📰</span>
                  Danh sách bài viết
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cập nhật thời gian thực từ API Express
                </p>
              </div>
              <button
                onClick={fetchPosts}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🔄 Làm mới</span>
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-32 rounded-2xl bg-white p-5 border border-slate-200/80 animate-pulse flex flex-col justify-between"
                  >
                    <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                <div className="w-16 h-16 mx-auto mb-3 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl">
                  📭
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                  Chưa có bài viết nào
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Hãy điền vào biểu mẫu bên cạnh để đăng bài viết đầu tiên lên hệ thống.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 text-indigo-600 border border-slate-200 font-bold text-xs flex items-center justify-center">
                          {post.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {post.author}
                          </div>
                          <div className="text-xs text-slate-400">
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openEditModal(post)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Chỉnh sửa bài viết (PUT)"
                        >
                          <span>✏️</span>
                          <span className="hidden sm:inline">Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <span>🗑️</span>
                          <span className="hidden sm:inline">Xoá</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-3.5 mb-1.5 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed break-words whitespace-pre-line">
                      {post.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal chỉnh sửa bài viết (Nâng cao 1) */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>✏️</span> Cập nhật bài viết
              </h3>
              <button
                onClick={closeEditModal}
                className="text-slate-400 hover:text-slate-600 text-lg p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tác giả
                </label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nội dung
                </label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}