'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  category?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Danh sách ảnh mẫu chuẩn phong cách toà soạn Hague
const HAGUE_PRESET_IMAGES = [
  { label: 'Góc nhìn đô thị', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sách & Tri thức', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80' },
  { label: 'Thiên nhiên mộc', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80' },
  { label: 'Không gian sáng tạo', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Kiến trúc cổ điển', url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80' },
  { label: 'Công nghiệp & Đổi mới', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { label: 'Chân trời hiện đại', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80' },
  { label: 'Nghề thủ công', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80' },
  { label: 'Di sản thế giới', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80' },
];

const CATEGORIES = [
  'ALL',
  'OPINION',
  'BUSINESS',
  'INTERVIEW',
  'POLITICS',
  'TRAVEL',
  'BOOKS',
  'LIFESTYLE'
];

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Modal tạo bài viết mới
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('OPINION');
  const [image, setImage] = useState(HAGUE_PRESET_IMAGES[0].url);
  const [submitting, setSubmitting] = useState(false);

  // Modal chỉnh sửa bài viết (PUT - Nâng cao 1)
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCategory, setEditCategory] = useState('OPINION');
  const [editImage, setEditImage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal đọc chi tiết bài viết (Reading View)
  const [readingPost, setReadingPost] = useState<Post | null>(null);

  // Tải danh sách bài viết từ Backend
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/posts');
      setPosts(res.data);
    } catch {
      toast.error('Không thể kết nối máy chủ backend!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Xử lý tạo bài viết mới (Tiết 2)
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề, nội dung và tác giả!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/api/posts', {
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        category,
        image: image || HAGUE_PRESET_IMAGES[0].url,
      });

      // Thêm bài viết mới vào đầu danh sách
      setPosts((prev) => [res.data, ...prev]);
      toast.success('Đăng bài thành công!');

      // Reset form & đóng modal
      setTitle('');
      setContent('');
      setAuthor('');
      setCategory('OPINION');
      setImage(HAGUE_PRESET_IMAGES[0].url);
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra khi tạo bài viết!');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xóa bài viết với Optimistic Update (Tiết 4-5 - Bài tập bắt buộc)
  const handleDeletePost = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Bạn chắc chắn muốn xoá bài viết này khỏi toà soạn?')) return;

    try {
      // Optimistic update: xóa khỏi state ngay lập tức
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (readingPost?.id === id) setReadingPost(null);
      if (editingPost?.id === id) setEditingPost(null);

      toast.success('Đã xoá bài viết', { icon: '🗑️' });

      // Gọi API xóa phía máy chủ
      await api.delete(`/api/posts/${id}`);
    } catch {
      toast.error('Xoá thất bại, đang đồng bộ lại dữ liệu!');
      fetchPosts(); // Rollback nếu có lỗi
    }
  };

  // Mở modal sửa bài viết (Nâng cao 1)
  const handleOpenEdit = (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditAuthor(post.author);
    setEditCategory(post.category || 'OPINION');
    setEditImage(post.image || HAGUE_PRESET_IMAGES[0].url);
  };

  // Xử lý cập nhật bài viết (PUT /api/posts/:id)
  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    if (!editTitle.trim() || !editContent.trim() || !editAuthor.trim()) {
      toast.error('Vui lòng không để trống thông tin!');
      return;
    }

    try {
      setIsUpdating(true);
      const res = await api.put(`/api/posts/${editingPost.id}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
        author: editAuthor.trim(),
        category: editCategory,
        image: editImage,
      });

      // Cập nhật lại trong state
      setPosts((prev) =>
        prev.map((p) => (p.id === editingPost.id ? res.data : p))
      );

      if (readingPost?.id === editingPost.id) {
        setReadingPost(res.data);
      }

      toast.success('Cập nhật bài viết thành công!');
      setEditingPost(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Cập nhật thất bại!');
    } finally {
      setIsUpdating(false);
    }
  };

  // Định dạng ngày chuẩn tạp chí
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'January 8, 2025';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'January 8, 2025';
    }
  };

  // Lọc bài viết theo danh mục & tìm kiếm
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        (post.category &&
          post.category.toUpperCase().includes(selectedCategory.toUpperCase()));
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Phân bổ bài viết vào layout chuẩn Hague
  const heroMain = filteredPosts[0] || posts[0];
  const heroLeft1 = filteredPosts[1] || posts[1];
  const heroLeft2 = filteredPosts[2] || posts[2];
  const latestSidebar = (filteredPosts.length > 3 ? filteredPosts.slice(3, 8) : posts.slice(3, 8));
  const businessPosts = posts.filter(p => p.category?.includes('BUSINESS')).length > 0
    ? posts.filter(p => p.category?.includes('BUSINESS')).slice(0, 4)
    : posts.slice(0, 4);
  const travelPosts = posts.filter(p => p.category?.includes('TRAVEL')).length > 0
    ? posts.filter(p => p.category?.includes('TRAVEL')).slice(0, 4)
    : posts.slice(4, 8);
  const politicsMain = posts.find(p => p.category?.includes('POLITICS')) || posts[2] || posts[0];
  const politicsGrid = posts.slice(1, 5);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a]">
      {/* 1. TOP HEADER & BRANDING (HAGUE) */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          {/* Top Bar with Icons, Center Logo, and Action Button */}
          <div className="grid grid-cols-3 items-center py-5 sm:py-7">
            {/* Left Icons */}
            <div className="flex items-center gap-3 sm:gap-4 text-gray-700">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="p-1.5 hover:text-black hover:bg-gray-100 rounded-md transition"
                title="Mở menu quản trị"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-1.5 hover:text-black hover:bg-gray-100 rounded-md transition"
                title="Tìm kiếm bài viết"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200 text-xs font-medium text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>API Express :5000</span>
              </div>
            </div>

            {/* Center Logo - HAGUE */}
            <div className="text-center">
              <h1
                onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                className="font-masthead text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.18em] text-black cursor-pointer hover:opacity-90 transition select-none uppercase inline-block"
              >
                HAGUE
              </h1>
            </div>

            {/* Right Action Button (Subscribe button in Hague -> Viết bài mới) */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#0077ff] hover:bg-[#0066dd] active:scale-95 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-base leading-none font-bold">+</span>
                <span>Viết bài mới</span>
              </button>
            </div>
          </div>

          {/* Search Bar Collapsible */}
          {showSearch && (
            <div className="pb-4 animate-in fade-in duration-200">
              <div className="max-w-xl mx-auto relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết theo tiêu đề, tác giả hoặc nội dung..."
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                  >
                    Xoá
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Bar */}
          <nav className="border-t border-b border-gray-200 py-3 overflow-x-auto scrollbar-none">
            <ul className="flex items-center justify-center min-w-max gap-6 sm:gap-8 text-xs font-semibold tracking-wider uppercase text-gray-700">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className={`transition-colors flex items-center gap-1 cursor-pointer py-1 ${
                      selectedCategory === cat
                        ? 'text-blue-600 font-extrabold border-b-2 border-blue-600'
                        : 'hover:text-black'
                    }`}
                  >
                    <span>{cat === 'ALL' ? 'Tất cả' : cat}</span>
                    {cat !== 'ALL' && <span className="text-[9px] text-gray-400">▾</span>}
                  </button>
                </li>
              ))}
              <li className="text-gray-300">|</li>
              <li className="text-gray-400 cursor-default text-[11px] normal-case tracking-normal">
                {posts.length} bài đã xuất bản
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
              Đang tải dữ liệu từ toà soạn...
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center bg-white border border-dashed border-gray-300 rounded-xl my-6">
            <div className="text-4xl mb-3">📰</div>
            <h3 className="text-lg font-bold text-gray-800">Không tìm thấy bài viết phù hợp</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Không có bài viết nào trong danh mục này hoặc từ khoá tìm kiếm không khớp.
            </p>
            <button
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* 2. HERO FEATURED SECTION (BỐ CỤC 3 CỘT ĐẶC TRƯNG CỦA HAGUE) */}
            {/* ============================================================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-gray-200">
              {/* Left Column: 2 Stacked Posts (3.5 cols) */}
              <div className="lg:col-span-3 flex flex-col justify-between gap-8">
                {heroLeft1 && (
                  <article
                    onClick={() => setReadingPost(heroLeft1)}
                    className="group cursor-pointer flex flex-col justify-between h-full pb-6 border-b lg:border-b-0 border-gray-200"
                  >
                    <div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 mb-3 rounded-sm">
                        <img
                          src={heroLeft1.image || HAGUE_PRESET_IMAGES[1].url}
                          alt={heroLeft1.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        {/* Action buttons on hover */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-black/60 backdrop-blur-sm p-1 rounded">
                          <button
                            onClick={(e) => handleOpenEdit(heroLeft1, e)}
                            className="p-1 text-white hover:text-blue-300 text-xs"
                            title="Sửa bài viết"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => handleDeletePost(heroLeft1.id, e)}
                            className="p-1 text-white hover:text-red-300 text-xs"
                            title="Xóa bài viết"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold tracking-wider text-blue-600 uppercase">
                        {heroLeft1.category || 'BOOKS'}
                      </span>
                      <h3 className="text-base font-bold text-gray-950 group-hover:text-blue-600 transition mt-1 leading-snug">
                        {heroLeft1.title}
                      </h3>
                    </div>
                    <span className="text-[11px] text-gray-400 mt-2 block">
                      {formatDate(heroLeft1.createdAt)}
                    </span>
                  </article>
                )}

                {heroLeft2 && (
                  <article
                    onClick={() => setReadingPost(heroLeft2)}
                    className="group cursor-pointer flex flex-col justify-between h-full pt-4 lg:pt-0"
                  >
                    <div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 mb-3 rounded-sm">
                        <img
                          src={heroLeft2.image || HAGUE_PRESET_IMAGES[2].url}
                          alt={heroLeft2.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-black/60 backdrop-blur-sm p-1 rounded">
                          <button
                            onClick={(e) => handleOpenEdit(heroLeft2, e)}
                            className="p-1 text-white hover:text-blue-300 text-xs"
                            title="Sửa bài viết"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => handleDeletePost(heroLeft2.id, e)}
                            className="p-1 text-white hover:text-red-300 text-xs"
                            title="Xóa bài viết"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold tracking-wider text-blue-600 uppercase">
                        {heroLeft2.category || 'BOOKS · POLITICS'}
                      </span>
                      <h3 className="text-base font-bold text-gray-950 group-hover:text-blue-600 transition mt-1 leading-snug">
                        {heroLeft2.title}
                      </h3>
                    </div>
                    <span className="text-[11px] text-gray-400 mt-2 block">
                      {formatDate(heroLeft2.createdAt)}
                    </span>
                  </article>
                )}
              </div>

              {/* Middle Column: Large Centerpiece Hero (5.5 cols) */}
              {heroMain && (
                <div className="lg:col-span-6 px-0 lg:px-4 flex flex-col justify-between">
                  <article
                    onClick={() => setReadingPost(heroMain)}
                    className="group cursor-pointer flex flex-col items-center text-center"
                  >
                    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-gray-100 mb-5 rounded-sm">
                      <img
                        src={heroMain.image || HAGUE_PRESET_IMAGES[0].url}
                        alt={heroMain.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                      />
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition bg-black/60 backdrop-blur-sm p-1.5 rounded">
                        <button
                          onClick={(e) => handleOpenEdit(heroMain, e)}
                          className="px-2 py-1 text-white hover:text-blue-300 text-xs flex items-center gap-1"
                        >
                          <span>✏️</span> Sửa
                        </button>
                        <button
                          onClick={(e) => handleDeletePost(heroMain.id, e)}
                          className="px-2 py-1 text-white hover:text-red-300 text-xs flex items-center gap-1"
                        >
                          <span>🗑️</span> Xoá
                        </button>
                      </div>
                    </div>

                    <span className="text-xs font-black tracking-widest text-blue-600 uppercase mb-2">
                      {heroMain.category || 'OPINION'}
                    </span>

                    <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 group-hover:text-blue-600 transition leading-tight mb-3 max-w-xl">
                      {heroMain.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 max-w-xl leading-relaxed mb-4">
                      {heroMain.content}
                    </p>

                    <div className="text-xs text-gray-400 font-medium">
                      <span>{formatDate(heroMain.createdAt)}</span>
                      <span className="mx-2">·</span>
                      <span className="text-gray-900 font-semibold">{heroMain.author}</span>
                    </div>
                  </article>
                </div>
              )}

              {/* Right Column: LATEST Sidebar (3 cols) */}
              <div className="lg:col-span-3 lg:border-l lg:border-gray-200 lg:pl-6">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-gray-900">
                  <h3 className="text-xs font-black tracking-widest uppercase text-gray-900">
                    LATEST
                  </h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {latestSidebar.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => setReadingPost(post)}
                      className="group cursor-pointer py-3.5 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 pr-1">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-950 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                          {post.title}
                        </h4>
                        <span className="text-[11px] text-gray-400 mt-1 block">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <div className="w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 overflow-hidden bg-gray-100 rounded-sm relative">
                        <img
                          src={post.image || HAGUE_PRESET_IMAGES[3].url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* ============================================================== */}
            {/* 3. BUSINESS SECTION (4 COLUMNS - GRID CHUẨN HAGUE) */}
            {/* ============================================================== */}
            <section className="py-12 border-b border-gray-200">
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-gray-200">
                <h3 className="text-xs font-black tracking-widest uppercase text-gray-950">
                  BUSINESS
                </h3>
                <button
                  onClick={() => setSelectedCategory('BUSINESS')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  View all »
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {businessPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => setReadingPost(post)}
                    className="group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 mb-3 rounded-sm">
                        <img
                          src={post.image || HAGUE_PRESET_IMAGES[4].url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-black/60 backdrop-blur-sm p-1 rounded">
                          <button
                            onClick={(e) => handleOpenEdit(post, e)}
                            className="p-1 text-white hover:text-blue-300 text-xs"
                            title="Sửa bài viết"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => handleDeletePost(post.id, e)}
                            className="p-1 text-white hover:text-red-300 text-xs"
                            title="Xóa bài viết"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold tracking-wider text-blue-600 uppercase">
                        {post.category || 'BUSINESS'}
                      </span>
                      <h4 className="text-sm font-bold text-gray-950 group-hover:text-blue-600 transition mt-1 leading-snug line-clamp-2">
                        {post.title}
                      </h4>
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        {formatDate(post.createdAt)}
                      </span>
                      <p className="text-xs text-gray-600 line-clamp-3 mt-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* ============================================================== */}
            {/* 4. TRAVEL SECTION (4 COLUMNS - GRID CHUẨN HAGUE) */}
            {/* ============================================================== */}
            <section className="py-12 border-b border-gray-200">
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-gray-200">
                <h3 className="text-xs font-black tracking-widest uppercase text-gray-950">
                  TRAVEL
                </h3>
                <button
                  onClick={() => setSelectedCategory('TRAVEL')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  View all »
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {travelPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => setReadingPost(post)}
                    className="group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 mb-3 rounded-sm">
                        <img
                          src={post.image || HAGUE_PRESET_IMAGES[7].url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-black/60 backdrop-blur-sm p-1 rounded">
                          <button
                            onClick={(e) => handleOpenEdit(post, e)}
                            className="p-1 text-white hover:text-blue-300 text-xs"
                            title="Sửa bài viết"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => handleDeletePost(post.id, e)}
                            className="p-1 text-white hover:text-red-300 text-xs"
                            title="Xóa bài viết"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold tracking-wider text-blue-600 uppercase">
                        {post.category || 'TRAVEL'}
                      </span>
                      <h4 className="text-sm font-bold text-gray-950 group-hover:text-blue-600 transition mt-1 leading-snug line-clamp-2">
                        {post.title}
                      </h4>
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        {formatDate(post.createdAt)}
                      </span>
                      <p className="text-xs text-gray-600 line-clamp-3 mt-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* ============================================================== */}
            {/* 5. POLITICS & EDITORIAL SPOTLIGHT (SPLIT FEATURED + 2X2 GRID) */}
            {/* ============================================================== */}
            <section className="py-12">
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-gray-200">
                <h3 className="text-xs font-black tracking-widest uppercase text-gray-950">
                  POLITICS
                </h3>
                <button
                  onClick={() => setSelectedCategory('POLITICS')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  View all »
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Large Feature (7 cols) */}
                {politicsMain && (
                  <article
                    onClick={() => setReadingPost(politicsMain)}
                    className="lg:col-span-7 group cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 mb-4 rounded-sm">
                      <img
                        src={politicsMain.image || HAGUE_PRESET_IMAGES[2].url}
                        alt={politicsMain.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-black/60 backdrop-blur-sm p-1 rounded">
                        <button
                          onClick={(e) => handleOpenEdit(politicsMain, e)}
                          className="p-1 text-white hover:text-blue-300 text-xs"
                          title="Sửa bài viết"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => handleDeletePost(politicsMain.id, e)}
                          className="p-1 text-white hover:text-red-300 text-xs"
                          title="Xóa bài viết"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold tracking-wider text-blue-600 uppercase">
                      {politicsMain.category || 'BOOKS · POLITICS'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-950 group-hover:text-blue-600 transition mt-1 mb-2 leading-snug">
                      {politicsMain.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed mb-3">
                      {politicsMain.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatDate(politicsMain.createdAt)}</span>
                      <span>·</span>
                      <span className="text-gray-900 font-semibold">{politicsMain.author}</span>
                    </div>
                  </article>
                )}

                {/* Right 2x2 Grid (5 cols) */}
                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {politicsGrid.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => setReadingPost(post)}
                      className="group cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 mb-2 rounded-sm">
                          <img
                            src={post.image || HAGUE_PRESET_IMAGES[6].url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>
                        <span className="text-[10px] font-extrabold tracking-wider text-blue-600 uppercase">
                          {post.category || 'POLITICS'}
                        </span>
                        <h4 className="text-xs font-bold text-gray-950 group-hover:text-blue-600 transition mt-0.5 line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* ============================================================== */}
      {/* FOOTER CHUẨN TOÀ SOẠN BÁO CHÍ */}
      {/* ============================================================== */}
      <footer className="bg-white border-t border-gray-200 mt-16 py-12 text-center">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <div className="font-masthead text-3xl font-black tracking-[0.2em] text-black uppercase mb-3">
            HAGUE
          </div>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Dự án Fullstack Integration: NextJS 16 App Router + Express Backend.
            Thiết kế bài thực hành Lab 3 theo phong cách toà soạn báo chí hiện đại.
          </p>
          <div className="text-xs text-gray-400">
            © 2026 Nguyễn Thái Tuấn (MSSV: N23DCPT054) - All rights reserved.
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* MODAL 1: TẠO BÀI VIẾT MỚI (SLIDE-OVER / EDITORIAL MODAL) */}
      {/* ============================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span>✍️</span> Biên tập bài viết mới
                </h3>
                <p className="text-xs text-gray-500">
                  Bài viết sẽ xuất hiện trên trang nhất của toà soạn HAGUE
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePost} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Tiêu đề bài báo (Headline) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: When you tell them the truth..."
                  className="w-full px-3.5 py-2.5 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Tác giả / Phóng viên *
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ví dụ: Isabella and Lucas"
                    className="w-full px-3.5 py-2.5 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Chuyên mục (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value="OPINION">OPINION (Ý kiến - Tiêu điểm)</option>
                    <option value="BUSINESS">BUSINESS (Kinh doanh)</option>
                    <option value="INTERVIEW">INTERVIEW (Phỏng vấn)</option>
                    <option value="POLITICS">POLITICS (Chính trị)</option>
                    <option value="TRAVEL">TRAVEL (Du lịch)</option>
                    <option value="BOOKS">BOOKS (Sách & Nghệ thuật)</option>
                    <option value="LIFESTYLE">LIFESTYLE (Đời sống)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Chọn ảnh minh hoạ toà soạn
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {HAGUE_PRESET_IMAGES.slice(0, 6).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setImage(img.url)}
                      className={`relative aspect-[4/3] rounded overflow-hidden cursor-pointer border-2 transition ${
                        image === img.url ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-transparent hover:opacity-80'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Hoặc dán URL hình ảnh tuỳ chọn..."
                  className="w-full px-3 py-1.5 rounded border border-gray-200 text-xs text-gray-600 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Nội dung chi tiết bài viết *
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung bài báo, bình luận hoặc phân tích của bạn..."
                  className="w-full px-3.5 py-2.5 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none font-article-body"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold tracking-wider uppercase shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {submitting ? 'Đang xuất bản...' : 'Xuất bản bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CHỈNH SỬA BÀI VIẾT (PUT - NÂNG CAO 1) */}
      {/* ============================================================== */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span>✏️</span> Chỉnh sửa bài viết #{editingPost.id}
              </h3>
              <button
                onClick={() => setEditingPost(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Tác giả
                  </label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Chuyên mục
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Nội dung bài viết
                </label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-600 resize-none font-article-body"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wider uppercase transition disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: ĐỌC BÀI VIẾT TOÀN DIỆN (READER VIEW) */}
      {/* ============================================================== */}
      {readingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Action Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
              <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase">
                {readingPost.category || 'ARTICLE'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(readingPost)}
                  className="px-3 py-1 text-xs font-medium text-gray-700 hover:text-blue-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition flex items-center gap-1"
                >
                  <span>✏️</span> Sửa bài
                </button>
                <button
                  onClick={() => handleDeletePost(readingPost.id)}
                  className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 bg-white border border-red-200 rounded hover:bg-red-50 transition flex items-center gap-1"
                >
                  <span>🗑️</span> Xoá
                </button>
                <button
                  onClick={() => setReadingPost(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6 sm:p-8 overflow-y-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 leading-tight mb-4">
                {readingPost.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-gray-500 pb-5 mb-6 border-b border-gray-200">
                <span className="font-semibold text-gray-900">{readingPost.author}</span>
                <span>·</span>
                <span>{formatDate(readingPost.createdAt)}</span>
              </div>

              {readingPost.image && (
                <div className="w-full aspect-[16/9] overflow-hidden rounded bg-gray-100 mb-6">
                  <img
                    src={readingPost.image}
                    alt={readingPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-base text-gray-800 leading-relaxed font-article-body space-y-4 whitespace-pre-line">
                {readingPost.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}