'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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

const HAGUE_PRESET_IMAGES = [
    { label: 'Công nghệ AI', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80' },
    { label: 'Sách & Tri thức', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80' },
    { label: 'Chính trị Quốc tế', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80' },
    { label: 'Kinh doanh Tài chính', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80' },
    { label: 'Du lịch Khám phá', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80' },
    { label: 'Đời sống Đô thị', url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&auto=format&fit=crop&q=80' },
];

const NAV_CATEGORIES = [
    { id: 'ALL', label: 'Trang chủ' },
    { id: 'BUSINESS', label: 'Kinh doanh' },
    { id: 'POLITICS', label: 'Chính trị' },
    { id: 'TRAVEL', label: 'Du lịch' },
    { id: 'TECH', label: 'Công nghệ' },
    { id: 'BOOKS', label: 'Sách' },
    { id: 'LIFESTYLE', label: 'Đời sống' },
];

const FORM_CATEGORIES = [
    { id: 'BUSINESS', label: 'Kinh doanh (Business)' },
    { id: 'POLITICS', label: 'Chính trị (Politics)' },
    { id: 'TRAVEL', label: 'Du lịch (Travel)' },
    { id: 'TECH', label: 'Công nghệ (Tech)' },
    { id: 'BOOKS', label: 'Sách & Tri thức (Books)' },
    { id: 'LIFESTYLE', label: 'Đời sống (Lifestyle)' },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80';

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src !== FALLBACK_IMAGE) {
        target.src = FALLBACK_IMAGE;
    }
};

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // File input refs
    const createFileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    // Modal tạo bài viết mới
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('BUSINESS');
    const [image, setImage] = useState(HAGUE_PRESET_IMAGES[0].url);
    const [submitting, setSubmitting] = useState(false);

    // Modal chỉnh sửa bài viết (PUT)
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editAuthor, setEditAuthor] = useState('');
    const [editCategory, setEditCategory] = useState('BUSINESS');
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

    // Xử lý upload ảnh từ máy tính (FileReader -> Base64 data URL)
    const handleFileUpload = (file: File, isEdit: boolean = false) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn tệp định dạng hình ảnh!');
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            toast.error('Dung lượng ảnh tối đa là 8MB!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (isEdit) {
                setEditImage(result);
            } else {
                setImage(result);
            }
            toast.success('Đã tải ảnh lên từ thiết bị!', { icon: '📸' });
        };
        reader.readAsDataURL(file);
    };

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
                category: category.toUpperCase(),
                image: image || HAGUE_PRESET_IMAGES[0].url,
            });

            setPosts((prev) => [res.data, ...prev]);
            toast.success('Đăng bài thành công!');

            // Reset
            setTitle('');
            setContent('');
            setAuthor('');
            setCategory('BUSINESS');
            setImage(HAGUE_PRESET_IMAGES[0].url);
            setIsCreateOpen(false);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Có lỗi xảy ra khi tạo bài viết!');
        } finally {
            setSubmitting(false);
        }
    };

    // Mở modal sửa bài viết (Nâng cao 1) - Đảm bảo đóng Reading modal
    const handleOpenEdit = (post: Post, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setReadingPost(null); // Đóng ngay modal đọc bài để không bị che khuất
        setEditingPost(post);
        setEditTitle(post.title);
        setEditContent(post.content);
        setEditAuthor(post.author);
        setEditCategory(post.category || 'BUSINESS');
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
                category: editCategory.toUpperCase(),
                image: editImage,
            });

            // Cập nhật lại trong state tức thì
            setPosts((prev) =>
                prev.map((p) => (p.id === editingPost.id ? res.data : p))
            );

            toast.success('Cập nhật bài viết thành công!');
            setEditingPost(null);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Cập nhật thất bại!');
        } finally {
            setIsUpdating(false);
        }
    };

    // Xử lý xóa bài viết với Optimistic Update (Tiết 4-5 - Bắt buộc)
    const handleDeletePost = async (id: number, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (!confirm('Bạn chắc chắn muốn xoá bài viết này khỏi toà soạn?')) return;

        try {
            // Optimistic update
            setPosts((prev) => prev.filter((p) => p.id !== id));
            if (readingPost?.id === id) setReadingPost(null);
            if (editingPost?.id === id) setEditingPost(null);

            toast.success('Đã xoá bài viết', { icon: '🗑️' });
            await api.delete(`/api/posts/${id}`);
        } catch {
            toast.error('Xoá thất bại, đang hoàn tác dữ liệu!');
            fetchPosts(); // Rollback
        }
    };

    // Định dạng ngày chuẩn tạp chí
    const formatDate = (dateString?: string) => {
        if (!dateString) return '4 Tháng 10, 2026';
        try {
            const d = new Date(dateString);
            return d.toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return '4 Tháng 10, 2026';
        }
    };

    // Kiểm tra trạng thái đang lọc / tìm kiếm
    const isFiltered = selectedCategory !== 'ALL' || searchQuery.trim() !== '';

    // Lọc bài viết chính xác
    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const matchesCategory =
                selectedCategory === 'ALL' ||
                (post.category && post.category.toUpperCase().includes(selectedCategory.toUpperCase()));

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                q === '' ||
                post.title.toLowerCase().includes(q) ||
                post.author.toLowerCase().includes(q) ||
                post.content.toLowerCase().includes(q) ||
                (post.category && post.category.toLowerCase().includes(q));

            return matchesCategory && matchesSearch;
        });
    }, [posts, selectedCategory, searchQuery]);

    // Phân bổ các bài cho trang nhất Hague khi không lọc
    const heroMain = posts.find(p => p.id === 1) || posts[0];
    const heroLeft1 = posts.find(p => p.id === 2) || posts[1];
    const heroLeft2 = posts.find(p => p.id === 3) || posts[2];
    const latestSidebar = posts.filter(p => [4, 5, 6, 7, 8].includes(p.id)).length === 5
        ? posts.filter(p => [4, 5, 6, 7, 8].includes(p.id))
        : posts.slice(3, 8);

    const businessPosts = posts.filter(p => p.category?.includes('BUSINESS')).length >= 4
        ? posts.filter(p => p.category?.includes('BUSINESS')).slice(0, 4)
        : posts.slice(8, 12);

    const travelPosts = posts.filter(p => p.category?.includes('TRAVEL')).length >= 4
        ? posts.filter(p => p.category?.includes('TRAVEL')).slice(0, 4)
        : posts.slice(12, 16);

    const politicsMain = posts.find(p => p.id === 17) || posts.find(p => p.category?.includes('POLITICS')) || posts[0];
    const politicsGrid = posts.filter(p => [18, 19, 20].includes(p.id)).length > 0
        ? posts.filter(p => [18, 19, 20].includes(p.id))
        : posts.slice(17, 20);

    // Lấy nhãn của category đang chọn
    const currentCategoryLabel = NAV_CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory;

    return (
        <div className="min-h-screen bg-white text-[#111111] antialiased">
            {/* ============================================================== */}
            {/* 1. TOP HEADER & MASTHEAD (HAGUE)                                 */}
            {/* ============================================================== */}
            <header className="border-b border-[#e5e5e5] bg-white sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
                <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
                    {/* Row 1: Left Icons, Centered HAGUE Logo, Right Subscribe button */}
                    <div className="flex items-center justify-between py-5 sm:py-7">
                        {/* Left Icons */}
                        <div className="flex items-center gap-3 sm:gap-4 text-[#555555]">
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="p-1 hover:text-black transition cursor-pointer"
                                title="Tạo bài viết mới"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="p-1 hover:text-black transition cursor-pointer"
                                title="Mở thanh tìm kiếm bài viết"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={fetchPosts}
                                className="p-1 hover:text-black transition text-xs font-semibold text-gray-400 hover:text-gray-700 cursor-pointer"
                                title="Đồng bộ dữ liệu Backend :5000"
                            >
                                🔄
                            </button>
                        </div>

                        {/* Center Logo - HAGUE */}
                        <div className="text-center">
                            <h1
                                onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                                className="font-masthead text-4xl sm:text-5xl md:text-[54px] font-black tracking-[0.16em] text-black cursor-pointer hover:opacity-95 transition uppercase select-none leading-none"
                            >
                                HAGUE
                            </h1>
                        </div>

                        {/* Right Action Button (Hague Subscribe button -> + Viết bài) */}
                        <div className="flex items-center justify-end">
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#0073e6] hover:bg-[#0060c0] active:scale-95 text-white font-semibold text-xs sm:text-[13px] tracking-wide transition shadow-sm cursor-pointer"
                            >
                                + Viết bài mới
                            </button>
                        </div>
                    </div>

                    {/* Search Dropdown Input Bar */}
                    {showSearch && (
                        <div className="pb-4 animate-in fade-in duration-200">
                            <div className="max-w-xl mx-auto relative flex items-center">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Gõ từ khóa tìm kiếm tiêu đề, tác giả, nội dung hoặc chuyên mục..."
                                    className="w-full px-4 py-2.5 text-xs sm:text-sm border-2 border-[#0073e6] rounded-lg focus:outline-none bg-blue-50/30"
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 text-xs text-gray-400 hover:text-gray-700 px-1 py-0.5"
                                    >
                                        ✕ Xoá
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Row 2: Centered Sub-navigation Bar */}
                    <nav className="border-t border-[#e5e5e5] py-3 overflow-x-auto scrollbar-none">
                        <ul className="flex items-center justify-center min-w-max gap-5 sm:gap-7 text-[13px] font-medium text-[#444444]">
                            {NAV_CATEGORIES.map((cat) => (
                                <li key={cat.id}>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(cat.id);
                                            setSearchQuery('');
                                        }}
                                        className={`flex items-center gap-1 transition-colors cursor-pointer py-0.5 ${selectedCategory === cat.id
                                            ? 'text-[#0073e6] font-bold border-b-2 border-[#0073e6]'
                                            : 'hover:text-black'
                                            }`}
                                    >
                                        <span>{cat.label}</span>
                                        {cat.id !== 'ALL' && (
                                            <span className="text-[9px] text-[#888888]">▾</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </header>

            {/* ============================================================== */}
            {/* MAIN CONTAINER                                                 */}
            {/* ============================================================== */}
            <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
                {loading ? (
                    <div className="py-24 text-center">
                        <div className="inline-block w-8 h-8 border-3 border-gray-200 border-t-[#0073e6] rounded-full animate-spin mb-3"></div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            Đang tải nội dung toà soạn...
                        </p>
                    </div>
                ) : isFiltered ? (
                    /* ============================================================== */
                    /* GIAO DIỆN KHI ĐANG LỌC DANH MỤC HOẶC TÌM KIẾM                  */
                    /* ============================================================== */
                    <section className="py-4">
                        {/* Header thông báo trạng thái lọc */}
                        <div className="flex flex-wrap items-center justify-between pb-4 mb-8 border-b-2 border-black gap-3">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0073e6] block mb-1">
                                    KẾT QUẢ ĐANG HIỂN THỊ
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
                                    {searchQuery.trim() !== '' ? (
                                        <>
                                            Tìm kiếm: &ldquo;{searchQuery}&rdquo;
                                            {selectedCategory !== 'ALL' && (
                                                <span className="text-base font-normal text-gray-500 ml-2">
                                                    (trong chuyên mục {currentCategoryLabel})
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <>Chuyên mục: {currentCategoryLabel}</>
                                    )}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Đã tìm thấy <strong className="text-black font-bold">{filteredPosts.length}</strong> bài viết phù hợp
                                </p>
                            </div>

                            {/* Nút reset quay về trang chủ */}
                            <button
                                onClick={() => {
                                    setSelectedCategory('ALL');
                                    setSearchQuery('');
                                }}
                                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>✕</span>
                                <span>Quay về trang chủ đầy đủ</span>
                            </button>
                        </div>

                        {/* Danh sách kết quả dạng lưới bài báo 3 cột */}
                        {filteredPosts.length === 0 ? (
                            <div className="py-20 text-center border border-dashed border-gray-300 rounded-xl my-6 bg-gray-50/50">
                                <div className="text-4xl mb-3">🔍</div>
                                <h3 className="text-base font-bold text-gray-800">
                                    Không tìm thấy bài viết nào phù hợp
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                    Hãy thử gõ từ khoá tìm kiếm khác hoặc chuyển sang chuyên mục khác để xem bài viết.
                                </p>
                                <button
                                    onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                                    className="mt-4 px-4 py-2 text-xs font-semibold text-[#0073e6] bg-white border border-[#0073e6] rounded-md hover:bg-blue-50 transition cursor-pointer"
                                >
                                    Xem tất cả bài viết
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPosts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="group flex flex-col justify-between border-b border-gray-100 pb-6"
                                    >
                                        <div>
                                            <div
                                                onClick={() => setReadingPost(post)}
                                                className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 mb-3 cursor-pointer rounded-sm"
                                            >
                                                <img
                                                    src={post.image || HAGUE_PRESET_IMAGES[0].url}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                                                 onError={handleImageError}/>
                                            </div>
                                            <span className="text-[11px] font-bold tracking-wider text-[#0073e6] uppercase block">
                                                {post.category || 'TIN TỨC'}
                                            </span>
                                            <h3
                                                onClick={() => setReadingPost(post)}
                                                className="text-[17px] font-bold text-[#111111] group-hover:text-[#0073e6] transition mt-1 leading-snug cursor-pointer line-clamp-2"
                                            >
                                                {post.title}
                                            </h3>
                                            <p className="text-[13px] text-[#555555] line-clamp-3 mt-2 leading-relaxed">
                                                {post.content}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 text-[12px] text-[#888888]">
                                            <div>
                                                <span className="font-semibold text-gray-900">{post.author}</span>
                                                <span className="mx-1">·</span>
                                                <span>{formatDate(post.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={(e) => handleOpenEdit(post, e)}
                                                    className="text-[11px] text-gray-500 hover:text-[#0073e6] px-2 py-0.5 rounded bg-gray-50 hover:bg-blue-50 border border-gray-200 cursor-pointer"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeletePost(post.id, e)}
                                                    className="text-[11px] text-gray-500 hover:text-red-600 px-2 py-0.5 rounded bg-gray-50 hover:bg-red-50 border border-gray-200 cursor-pointer"
                                                >
                                                    Xoá
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                ) : (
                    /* ============================================================== */
                    /* GIAO DIỆN TRANG CHỦ TOÀ SOẠN HAGUE CHUẨN 100%                 */
                    /* ============================================================== */
                    <>
                        {/* ============================================================== */}
                        {/* 2. HERO FEATURED SECTION (CHUẨN 100% 3 CỘT HAGUE)             */}
                        {/* ============================================================== */}
                        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-[#e5e5e5]">
                            {/* CỘT TRÁI (3 cols) - 2 BÀI XẾP TẦNG */}
                            <div className="lg:col-span-3 flex flex-col justify-between gap-8">
                                {heroLeft1 && (
                                    <article className="group flex flex-col justify-between h-full">
                                        <div>
                                            <div
                                                onClick={() => setReadingPost(heroLeft1)}
                                                className="relative aspect-[1.35/1] w-full overflow-hidden bg-gray-100 mb-3 cursor-pointer"
                                            >
                                                <img
                                                    src={heroLeft1.image || HAGUE_PRESET_IMAGES[1].url}
                                                    alt={heroLeft1.title}
                                                    className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                                                 onError={handleImageError}/>
                                            </div>
                                            <span className="text-[11px] font-bold tracking-wider text-[#0073e6] uppercase block">
                                                {heroLeft1.category || 'BOOKS'}
                                            </span>
                                            <h3
                                                onClick={() => setReadingPost(heroLeft1)}
                                                className="text-[17px] font-bold text-[#111111] group-hover:text-[#0073e6] transition mt-1 leading-snug cursor-pointer line-clamp-2"
                                            >
                                                {heroLeft1.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-[12px] text-[#888888]">
                                                {formatDate(heroLeft1.createdAt)}
                                            </span>
                                            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                                                <button
                                                    onClick={(e) => handleOpenEdit(heroLeft1, e)}
                                                    className="text-[11px] text-gray-500 hover:text-[#0073e6] px-1.5 py-0.5 rounded bg-gray-50 hover:bg-blue-50 border border-gray-200 cursor-pointer"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeletePost(heroLeft1.id, e)}
                                                    className="text-[11px] text-gray-500 hover:text-red-600 px-1.5 py-0.5 rounded bg-gray-50 hover:bg-red-50 border border-gray-200 cursor-pointer"
                                                >
                                                    Xoá
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                )}

                                {heroLeft2 && (
                                    <article className="group flex flex-col justify-between h-full pt-4 border-t lg:border-t-0 border-[#e5e5e5]">
                                        <div>
                                            <div
                                                onClick={() => setReadingPost(heroLeft2)}
                                                className="relative aspect-[1.35/1] w-full overflow-hidden bg-gray-100 mb-3 cursor-pointer"
                                            >
                                                <img
                                                    src={heroLeft2.image || HAGUE_PRESET_IMAGES[2].url}
                                                    alt={heroLeft2.title}
                                                    className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                                                 onError={handleImageError}/>
                                            </div>
                                            <span className="text-[11px] font-bold tracking-wider text-[#0073e6] uppercase block">
                                                {heroLeft2.category || 'POLITICS'}
                                            </span>
                                            <h3
                                                onClick={() => setReadingPost(heroLeft2)}
                                                className="text-[17px] font-bold text-[#111111] group-hover:text-[#0073e6] transition mt-1 leading-snug cursor-pointer line-clamp-2"
                                            >
                                                {heroLeft2.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-[12px] text-[#888888]">
                                                {formatDate(heroLeft2.createdAt)}
                                            </span>
                                            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                                                <button
                                                    onClick={(e) => handleOpenEdit(heroLeft2, e)}
                                                    className="text-[11px] text-gray-500 hover:text-[#0073e6] px-1.5 py-0.5 rounded bg-gray-50 hover:bg-blue-50 border border-gray-200 cursor-pointer"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeletePost(heroLeft2.id, e)}
                                                    className="text-[11px] text-gray-500 hover:text-red-600 px-1.5 py-0.5 rounded bg-gray-50 hover:bg-red-50 border border-gray-200 cursor-pointer"
                                                >
                                                    Xoá
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                )}
                            </div>

                            {/* CỘT GIỮA (6 cols) - BÀI TIÊU ĐIỂM LỚN NHẤT */}
                            {heroMain && (
                                <div className="lg:col-span-6 px-0 lg:px-3 flex flex-col justify-between">
                                    <article className="group flex flex-col items-center text-center">
                                        <div
                                            onClick={() => setReadingPost(heroMain)}
                                            className="relative w-full aspect-[1/0.95] overflow-hidden bg-gray-100 mb-5 cursor-pointer"
                                        >
                                            <img
                                                src={heroMain.image || HAGUE_PRESET_IMAGES[0].url}
                                                alt={heroMain.title}
                                                className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                                             onError={handleImageError}/>
                                        </div>

                                        <span className="text-[11px] font-bold tracking-widest text-[#0073e6] uppercase mb-2">
                                            {heroMain.category || 'TECH'}
                                        </span>

                                        <h2
                                            onClick={() => setReadingPost(heroMain)}
                                            className="text-2xl sm:text-[30px] font-bold text-[#111111] group-hover:text-[#0073e6] transition leading-tight mb-3 max-w-lg cursor-pointer"
                                        >
                                            {heroMain.title}
                                        </h2>

                                        <p className="text-[13px] text-[#555555] line-clamp-3 max-w-lg leading-relaxed mb-4">
                                            {heroMain.content}
                                        </p>

                                        <div className="text-[12px] text-[#888888] font-normal flex items-center justify-center gap-2">
                                            <span>{formatDate(heroMain.createdAt)}</span>
                                            <span>·</span>
                                            <span className="text-[#111111] font-semibold">{heroMain.author}</span>
                                            <span className="mx-1">|</span>
                                            <button
                                                onClick={(e) => handleOpenEdit(heroMain, e)}
                                                className="text-[#0073e6] hover:underline cursor-pointer font-semibold"
                                            >
                                                Sửa
                                            </button>
                                            <span>·</span>
                                            <button
                                                onClick={(e) => handleDeletePost(heroMain.id, e)}
                                                className="text-red-500 hover:underline cursor-pointer font-semibold"
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    </article>
                                </div>
                            )}

                            {/* CỘT PHẢI (3 cols) - CỘT TIN LATEST */}
                            <div className="lg:col-span-3 lg:border-l lg:border-[#e5e5e5] lg:pl-6">
                                <div className="pb-2 mb-3 border-b border-black">
                                    <h3 className="text-[12px] font-bold tracking-wider uppercase text-black">
                                        LATEST (MỚI NHẤT)
                                    </h3>
                                </div>

                                <div className="divide-y divide-[#e5e5e5]">
                                    {latestSidebar.map((post) => (
                                        <article
                                            key={post.id}
                                            className="group py-3.5 flex items-start justify-between gap-3"
                                        >
                                            <div className="flex-1 pr-1">
                                                <h4
                                                    onClick={() => setReadingPost(post)}
                                                    className="text-[13px] font-bold text-[#111111] group-hover:text-[#0073e6] transition leading-snug line-clamp-2 cursor-pointer"
                                                >
                                                    {post.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[11px] text-[#888888]">
                                                        {formatDate(post.createdAt)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleOpenEdit(post, e)}
                                                        className="text-[10px] text-gray-400 hover:text-[#0073e6] cursor-pointer"
                                                    >
                                                        sửa
                                                    </button>
                                                </div>
                                            </div>
                                            <div
                                                onClick={() => setReadingPost(post)}
                                                className="w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-100 cursor-pointer"
                                            >
                                                <img
                                                    src={post.image || HAGUE_PRESET_IMAGES[3].url}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                 onError={handleImageError}/>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ============================================================== */}
                        {/* 3. CHUYÊN MỤC BUSINESS (LƯỚI 4 CỘT)                           */}
                        {/* ============================================================== */}
                        <section className="py-10 border-b border-[#e5e5e5]">
                            <div className="flex items-center justify-between pb-2 mb-6 border-b border-[#e5e5e5]">
                                <h3 className="text-[12px] font-bold tracking-wider uppercase text-black">
                                    BUSINESS (KINH DOANH)
                                </h3>
                                <button
                                    onClick={() => setSelectedCategory('BUSINESS')}
                                    className="text-[12px] font-medium text-[#0073e6] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    Xem chuyên mục »
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {businessPosts.map((post) => (
                                    <article key={post.id} className="group flex flex-col justify-between">
                                        <div>
                                            <div
                                                onClick={() => setReadingPost(post)}
                                                className="relative aspect-[1.4/1] w-full overflow-hidden bg-gray-100 mb-3 cursor-pointer"
                                            >
                                                <img
                                                    src={post.image || HAGUE_PRESET_IMAGES[4].url}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                                                 onError={handleImageError}/>
                                            </div>
                                            <span className="text-[11px] font-bold tracking-wider text-[#0073e6] uppercase block">
                                                {post.category || 'BUSINESS'}
                                            </span>
                                            <h4
                                                onClick={() => setReadingPost(post)}
                                                className="text-[15px] font-bold text-[#111111] group-hover:text-[#0073e6] transition mt-1 leading-snug line-clamp-2 cursor-pointer"
                                            >
                                                {post.title}
                                            </h4>
                                            <span className="text-[11px] text-[#888888] mt-1 block">
                                                {formatDate(post.createdAt)}
                                            </span>
                                            <p className="text-[12px] text-[#555555] line-clamp-3 mt-2 leading-relaxed">
                                                {post.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-gray-100">
                                            <button
                                                onClick={(e) => handleOpenEdit(post, e)}
                                                className="text-[11px] text-gray-500 hover:text-[#0073e6] px-1.5 py-0.5 rounded bg-gray-50 hover:bg-blue-50 border border-gray-200 cursor-pointer"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={(e) => handleDeletePost(post.id, e)}
                                                className="text-[11px] text-gray-500 hover:text-red-600 px-1.5 py-0.5 rounded bg-gray-50 hover:bg-red-50 border border-gray-200 cursor-pointer"
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        {/* ============================================================== */}
                        {/* 4. CHUYÊN MỤC TRAVEL (LƯỚI 4 CỘT)                             */}
                        {/* ============================================================== */}
                        <section className="py-10 border-b border-[#e5e5e5]">
                            <div className="flex items-center justify-between pb-2 mb-6 border-b border-[#e5e5e5]">
                                <h3 className="text-[12px] font-bold tracking-wider uppercase text-black">
                                    TRAVEL (DU LỊCH)
                                </h3>
                                <button
                                    onClick={() => setSelectedCategory('TRAVEL')}
                                    className="text-[12px] font-medium text-[#0073e6] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    Xem chuyên mục »
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {travelPosts.map((post) => (
                                    <article key={post.id} className="group flex flex-col justify-between">
                                        <div>
                                            <div
                                                onClick={() => setReadingPost(post)}
                                                className="relative aspect-[1.4/1] w-full overflow-hidden bg-gray-100 mb-3 cursor-pointer"
                                            >
                                                <img
                                                    src={post.image || HAGUE_PRESET_IMAGES[7]?.url || HAGUE_PRESET_IMAGES[4].url}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                                                 onError={handleImageError}/>
                                            </div>
                                            <span className="text-[11px] font-bold tracking-wider text-[#0073e6] uppercase block">
                                                {post.category || 'TRAVEL'}
                                            </span>
                                            <h4
                                                onClick={() => setReadingPost(post)}
                                                className="text-[15px] font-bold text-[#111111] group-hover:text-[#0073e6] transition mt-1 leading-snug line-clamp-2 cursor-pointer"
                                            >
                                                {post.title}
                                            </h4>
                                            <span className="text-[11px] text-[#888888] mt-1 block">
                                                {formatDate(post.createdAt)}
                                            </span>
                                            <p className="text-[12px] text-[#555555] line-clamp-3 mt-2 leading-relaxed">
                                                {post.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-gray-100">
                                            <button
                                                onClick={(e) => handleOpenEdit(post, e)}
                                                className="text-[11px] text-gray-500 hover:text-[#0073e6] px-1.5 py-0.5 rounded bg-gray-50 hover:bg-blue-50 border border-gray-200 cursor-pointer"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={(e) => handleDeletePost(post.id, e)}
                                                className="text-[11px] text-gray-500 hover:text-red-600 px-1.5 py-0.5 rounded bg-gray-50 hover:bg-red-50 border border-gray-200 cursor-pointer"
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        {/* ============================================================== */}
                        {/* 5. CHUYÊN MỤC POLITICS (SPLIT BÀI LỚN + LƯỚI 2X2)             */}
                        {/* ============================================================== */}
                        <section className="py-10">
                            <div className="flex items-center justify-between pb-2 mb-6 border-b border-[#e5e5e5]">
                                <h3 className="text-[12px] font-bold tracking-wider uppercase text-black">
                                    POLITICS (CHÍNH TRỊ - NGOẠI GIAO)
                                </h3>
                                <button
                                    onClick={() => setSelectedCategory('POLITICS')}
                                    className="text-[12px] font-medium text-[#0073e6] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    Xem chuyên mục »
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Bài lớn bên trái (7 cols) */}
                                {politicsMain && (
                                    <article className="lg:col-span-7 group">
                                        <div
                                            onClick={() => setReadingPost(politicsMain)}
                                            className="relative aspect-[1.6/1] w-full overflow-hidden bg-gray-100 mb-4 cursor-pointer"
                                        >
                                            <img
                                                src={politicsMain.image || HAGUE_PRESET_IMAGES[2].url}
                                                alt={politicsMain.title}
                                                className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                                             onError={handleImageError}/>
                                        </div>
                                        <span className="text-[11px] font-bold tracking-wider text-[#0073e6] uppercase block">
                                            {politicsMain.category || 'POLITICS'}
                                        </span>
                                        <h3
                                            onClick={() => setReadingPost(politicsMain)}
                                            className="text-xl sm:text-2xl font-bold text-[#111111] group-hover:text-[#0073e6] transition mt-1 mb-2 leading-snug cursor-pointer"
                                        >
                                            {politicsMain.title}
                                        </h3>
                                        <p className="text-[13px] text-[#555555] line-clamp-3 leading-relaxed mb-3">
                                            {politicsMain.content}
                                        </p>
                                        <div className="flex items-center justify-between text-[12px] text-[#888888]">
                                            <div className="flex items-center gap-2">
                                                <span>{formatDate(politicsMain.createdAt)}</span>
                                                <span>·</span>
                                                <span className="text-[#111111] font-semibold">{politicsMain.author}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => handleOpenEdit(politicsMain, e)}
                                                    className="text-[11px] text-gray-500 hover:text-[#0073e6] px-1.5 py-0.5 rounded bg-gray-50 hover:bg-blue-50 border border-gray-200 cursor-pointer"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeletePost(politicsMain.id, e)}
                                                    className="text-[11px] text-gray-500 hover:text-red-600 px-1.5 py-0.5 rounded bg-gray-50 hover:bg-red-50 border border-gray-200 cursor-pointer"
                                                >
                                                    Xoá
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                )}

                                {/* Lưới các bài bên phải (5 cols) */}
                                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {politicsGrid.map((post) => (
                                        <article key={post.id} className="group flex flex-col justify-between">
                                            <div>
                                                <div
                                                    onClick={() => setReadingPost(post)}
                                                    className="relative aspect-[1.4/1] w-full overflow-hidden bg-gray-100 mb-2 cursor-pointer"
                                                >
                                                    <img
                                                        src={post.image || HAGUE_PRESET_IMAGES[2].url}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                                                     onError={handleImageError}/>
                                                </div>
                                                <span className="text-[10px] font-bold tracking-wider text-[#0073e6] uppercase block">
                                                    {post.category || 'POLITICS'}
                                                </span>
                                                <h4
                                                    onClick={() => setReadingPost(post)}
                                                    className="text-[13px] font-bold text-[#111111] group-hover:text-[#0073e6] transition mt-0.5 line-clamp-2 leading-snug cursor-pointer"
                                                >
                                                    {post.title}
                                                </h4>
                                                <span className="text-[11px] text-[#888888] mt-1 block">
                                                    {formatDate(post.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-end gap-1.5 pt-2">
                                                <button
                                                    onClick={(e) => handleOpenEdit(post, e)}
                                                    className="text-[10px] text-gray-400 hover:text-[#0073e6] cursor-pointer"
                                                >
                                                    sửa
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeletePost(post.id, e)}
                                                    className="text-[10px] text-gray-400 hover:text-red-600 cursor-pointer"
                                                >
                                                    xoá
                                                </button>
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
            {/* FOOTER                                                          */}
            {/* ============================================================== */}
            <footer className="border-t border-[#e5e5e5] py-12 text-center bg-white mt-12">
                <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
                    <div className="font-masthead text-3xl font-black tracking-[0.16em] text-black uppercase mb-3 select-none">
                        HAGUE
                    </div>
                    <p className="text-[12px] text-[#666666] max-w-md mx-auto mb-4">
                        Thiết kế bài thực hành Fullstack Lab 3: NextJS + Express theo chuẩn toà soạn báo chí Hague.
                    </p>
                    <div className="text-[11px] text-[#888888]">
                        Nguyễn Thái Tuấn · MSSV: N23DCPT054 · Lớp: D23CQPTUD01-N
                    </div>
                </div>
            </footer>

            {/* ============================================================== */}
            {/* MODAL 1: CHỈNH SỬA BÀI VIẾT (PUT - NÂNG CAO 1) - Z-INDEX 100   */}
            {/* ============================================================== */}
            {editingPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-200 max-h-[92vh] flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5] mb-4">
                            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <span>✏️</span> CHỈNH SỬA BÀI VIẾT #{editingPost.id}
                            </h3>
                            <button
                                onClick={() => setEditingPost(null)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePost} className="space-y-4 overflow-y-auto pr-1">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6] focus:ring-1 focus:ring-[#0073e6]"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                        Tác giả
                                    </label>
                                    <input
                                        type="text"
                                        value={editAuthor}
                                        onChange={(e) => setEditAuthor(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6] focus:ring-1 focus:ring-[#0073e6]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                        Chuyên mục
                                    </label>
                                    <select
                                        value={editCategory}
                                        onChange={(e) => setEditCategory(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6] bg-white"
                                    >
                                        {FORM_CATEGORIES.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* CHỈNH SỬA HÌNH ẢNH */}
                            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Hình ảnh bài viết
                                    </label>
                                    <span className="text-[11px] text-blue-600 font-medium">Hỗ trợ ảnh từ máy tính</span>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-24 h-20 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300 relative group">
                                        {editImage ? (
                                            <img src={editImage} alt="Preview" className="w-full h-full object-cover"  onError={handleImageError}/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Không có ảnh</div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                ref={editFileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => editFileInputRef.current?.click()}
                                                className="px-3 py-1.5 rounded bg-white hover:bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                                            >
                                                <span>📁</span>
                                                <span>Tải ảnh mới từ máy</span>
                                            </button>

                                            {editImage && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditImage('')}
                                                    className="px-2.5 py-1.5 rounded hover:bg-red-50 text-xs font-medium text-red-600 transition cursor-pointer"
                                                >
                                                    Xoá ảnh
                                                </button>
                                            )}
                                        </div>

                                        <input
                                            type="url"
                                            value={editImage}
                                            onChange={(e) => setEditImage(e.target.value)}
                                            placeholder="Hoặc dán URL hình ảnh..."
                                            className="w-full px-2.5 py-1.5 rounded border border-gray-200 text-xs bg-white text-gray-600 focus:outline-none focus:border-[#0073e6]"
                                        />
                                    </div>
                                </div>

                                {/* Chọn nhanh ảnh mẫu toà soạn */}
                                <div className="mt-3 pt-2.5 border-t border-gray-200">
                                    <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5">
                                        Hoặc chọn nhanh từ thư viện toà soạn:
                                    </span>
                                    <div className="grid grid-cols-6 gap-1.5">
                                        {HAGUE_PRESET_IMAGES.map((img, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setEditImage(img.url)}
                                                className={`aspect-[4/3] rounded overflow-hidden cursor-pointer border-2 transition ${editImage === img.url ? 'border-[#0073e6] ring-1 ring-[#0073e6]' : 'border-transparent hover:opacity-80'
                                                    }`}
                                                title={img.label}
                                            >
                                                <img src={img.url} alt={img.label} className="w-full h-full object-cover"  onError={handleImageError}/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Nội dung bài viết
                                </label>
                                <textarea
                                    rows={5}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6] focus:ring-1 focus:ring-[#0073e6] resize-none leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5e5]">
                                <button
                                    type="button"
                                    onClick={() => setEditingPost(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
                                >
                                    Huỷ bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-2.5 rounded-md bg-[#0073e6] hover:bg-[#0060c0] active:scale-95 text-white text-xs font-bold tracking-wider uppercase transition disabled:opacity-50 cursor-pointer shadow-sm"
                                >
                                    {isUpdating ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL 2: TẠO BÀI VIẾT MỚI (+ VIẾT BÀI MỚI) - Z-INDEX 90         */}
            {/* ============================================================== */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5] bg-gray-50/50">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <span>✍️</span> Biên tập bài viết mới
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Xuất bản bài viết trực tiếp lên toà soạn Hague
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePost} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Tiêu đề bài báo (Headline) *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ví dụ: Chiến Lược Tái Cơ Cấu Tài Chính Doanh Nghiệp..."
                                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6]"
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
                                        placeholder="Ví dụ: Nguyễn Thái Tuấn"
                                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6]"
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
                                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6] bg-white"
                                    >
                                        {FORM_CATEGORIES.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* TẢI ẢNH TỪ THIẾT BỊ HOẶC CHỌN TỪ THƯ VIỆN */}
                            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Ảnh đại diện bài viết
                                    </label>
                                    <span className="text-[11px] text-blue-600 font-medium">Chọn từ máy tính hoặc thư viện</span>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-24 h-20 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300">
                                        {image ? (
                                            <img src={image} alt="Preview" className="w-full h-full object-cover"  onError={handleImageError}/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Chưa có ảnh</div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                ref={createFileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], false)}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => createFileInputRef.current?.click()}
                                                className="px-3.5 py-1.5 rounded bg-white hover:bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-800 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                                            >
                                                <span>📁</span>
                                                <span>Chọn ảnh từ máy tính</span>
                                            </button>
                                        </div>

                                        <input
                                            type="url"
                                            value={image}
                                            onChange={(e) => setImage(e.target.value)}
                                            placeholder="Hoặc dán URL hình ảnh tuỳ chọn..."
                                            className="w-full px-2.5 py-1.5 rounded border border-gray-200 text-xs bg-white text-gray-600 focus:outline-none focus:border-[#0073e6]"
                                        />
                                    </div>
                                </div>

                                {/* Danh sách ảnh mẫu toà soạn */}
                                <div className="mt-3 pt-2.5 border-t border-gray-200">
                                    <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5">
                                        Hoặc chọn nhanh từ toà soạn Hague:
                                    </span>
                                    <div className="grid grid-cols-6 gap-1.5">
                                        {HAGUE_PRESET_IMAGES.map((img, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setImage(img.url)}
                                                className={`aspect-[4/3] rounded overflow-hidden cursor-pointer border-2 transition ${image === img.url ? 'border-[#0073e6] ring-1 ring-[#0073e6]' : 'border-transparent hover:opacity-80'
                                                    }`}
                                                title={img.label}
                                            >
                                                <img src={img.url} alt={img.label} className="w-full h-full object-cover"  onError={handleImageError}/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Nội dung chi tiết bài viết *
                                </label>
                                <textarea
                                    rows={5}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Nhập nội dung bài báo của bạn..."
                                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6] resize-none leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5e5]">
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
                                    className="px-6 py-2.5 rounded-md bg-[#0073e6] hover:bg-[#0060c0] active:scale-95 text-white text-xs font-bold tracking-wider uppercase transition disabled:opacity-50 cursor-pointer shadow-sm"
                                >
                                    {submitting ? 'Đang xuất bản...' : 'XUẤT BẢN BÀI VIẾT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL 3: ĐỌC BÀI BÁO (READER MODE) - Z-INDEX 70                 */}
            {/* ============================================================== */}
            {readingPost && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-[#e5e5e5] bg-gray-50">
                            <span className="text-xs font-bold text-[#0073e6] tracking-wider uppercase">
                                {readingPost.category || 'ARTICLE'}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => handleOpenEdit(readingPost, e)}
                                    className="px-3 py-1 text-xs font-medium text-gray-700 hover:text-[#0073e6] bg-white border border-gray-300 rounded hover:bg-gray-50 transition cursor-pointer"
                                >
                                    ✏️ Sửa bài
                                </button>
                                <button
                                    onClick={(e) => handleDeletePost(readingPost.id, e)}
                                    className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 bg-white border border-red-200 rounded hover:bg-red-50 transition cursor-pointer"
                                >
                                    🗑️ Xoá
                                </button>
                                <button
                                    onClick={() => setReadingPost(null)}
                                    className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 ml-2 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto">
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] leading-tight mb-3">
                                {readingPost.title}
                            </h2>

                            <div className="flex items-center gap-3 text-xs text-[#888888] pb-4 mb-5 border-b border-[#e5e5e5]">
                                <span className="font-semibold text-black">{readingPost.author}</span>
                                <span>·</span>
                                <span>{formatDate(readingPost.createdAt)}</span>
                            </div>

                            {readingPost.image && (
                                <div className="w-full aspect-[16/9] overflow-hidden rounded bg-gray-100 mb-5">
                                    <img
                                        src={readingPost.image}
                                        alt={readingPost.title}
                                        onError={handleImageError}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="text-[15px] text-[#333333] leading-relaxed whitespace-pre-line space-y-4">
                                {readingPost.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}