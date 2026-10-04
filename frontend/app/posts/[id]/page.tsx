'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Comment {
    id: number;
    postId: number;
    author: string;
    content: string;
    createdAt: string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    author: string;
    category?: string;
    image?: string;
    comments?: Comment[];
    createdAt?: string;
    updatedAt?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80';

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const postId = Number(params?.id);

    const [commentAuthor, setCommentAuthor] = useState('');
    const [commentContent, setCommentContent] = useState('');

    // NÂNG CAO 1: State chỉnh sửa bài viết
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editAuthor, setEditAuthor] = useState('');
    const [editCategory, setEditCategory] = useState('BUSINESS');
    const [editContent, setEditContent] = useState('');
    const [editImage, setEditImage] = useState('');

    // NÂNG CAO 2: useQuery lấy chi tiết bài viết và bình luận
    const { data: post, isLoading, isError } = useQuery<Post>({
        queryKey: ['post', postId],
        queryFn: async () => {
            const res = await api.get(`/api/posts/${postId}`);
            return res.data;
        },
        enabled: !isNaN(postId),
    });

    // NÂNG CAO 1: Mutation cập nhật bài viết
    const updatePostMutation = useMutation({
        mutationFn: async (data: { title: string; author: string; category: string; content: string; image: string }) => {
            const res = await api.put(`/api/posts/${postId}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Cập nhật bài viết thành công!', { icon: '✏️' });
            setIsEditing(false);
        },
        onError: () => {
            toast.error('Cập nhật bài viết thất bại!');
        }
    });

    // NÂNG CAO 4: Mutation thêm bình luận
    const addCommentMutation = useMutation({
        mutationFn: async ({ author, content }: { author: string; content: string }) => {
            const res = await api.post(`/api/posts/${postId}/comments`, { author, content });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Đã gửi bình luận thành công!');
            setCommentContent('');
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Gửi bình luận thất bại!');
        }
    });

    // NÂNG CAO 4: Mutation xoá bình luận
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: number) => {
            const res = await api.delete(`/api/comments/${commentId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Đã xoá bình luận', { icon: '🗑️' });
        },
        onError: () => {
            toast.error('Xoá bình luận thất bại!');
        }
    });

    // Mutation xoá bài viết
    const deletePostMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/api/posts/${postId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Đã xoá bài viết thành công!', { icon: '🗑️' });
            router.push('/posts');
        },
        onError: () => {
            toast.error('Xoá bài viết thất bại!');
        }
    });

    const handleOpenEdit = () => {
        if (!post) return;
        setEditTitle(post.title);
        setEditAuthor(post.author);
        setEditCategory(post.category || 'BUSINESS');
        setEditContent(post.content);
        setEditImage(post.image || '');
        setIsEditing(true);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTitle.trim() || !editContent.trim() || !editAuthor.trim()) {
            toast.error('Vui lòng điền đủ tiêu đề, nội dung và tác giả!');
            return;
        }
        updatePostMutation.mutate({
            title: editTitle.trim(),
            author: editAuthor.trim(),
            category: editCategory,
            content: editContent.trim(),
            image: editImage.trim() || FALLBACK_IMAGE,
        });
    };

    const handleSendComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentAuthor.trim() || !commentContent.trim()) {
            toast.error('Vui lòng nhập họ tên và nội dung bình luận!');
            return;
        }
        addCommentMutation.mutate({
            author: commentAuthor.trim(),
            content: commentContent.trim(),
        });
    };

    const handleDeleteComment = (commentId: number) => {
        if (!confirm('Bạn chắc chắn muốn xoá bình luận này?')) return;
        deleteCommentMutation.mutate(commentId);
    };

    const handleDeletePost = () => {
        if (!confirm('Bạn chắc chắn muốn xoá vĩnh viễn bài báo này?')) return;
        deletePostMutation.mutate();
    };

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-3 border-gray-200 border-t-[#0073e6] rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-gray-500 font-medium">Đang tải bài viết từ toà soạn Hague...</p>
                </div>
            </div>
        );
    }

    if (isError || !post) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài viết</h2>
                    <p className="text-xs text-gray-500 mb-6">Bài viết này có thể đã bị xoá hoặc liên kết không chính xác.</p>
                    <Link
                        href="/posts"
                        className="px-5 py-2.5 rounded-full bg-[#0073e6] hover:bg-[#0060c0] text-white text-xs font-semibold tracking-wide transition shadow-sm inline-block"
                    >
                        ← Quay lại trang chủ toà soạn
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-[#111111] antialiased">
            {/* Header toà soạn */}
            <header className="border-b border-[#e5e5e5] bg-white sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
                <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/posts"
                        className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1.5 transition"
                    >
                        <span>←</span> Trang chủ toà soạn
                    </Link>

                    <Link href="/posts" className="font-masthead text-3xl font-black tracking-[0.16em] text-black uppercase select-none">
                        HAGUE
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleOpenEdit}
                            className="text-xs text-gray-700 hover:text-[#0073e6] px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition cursor-pointer flex items-center gap-1 font-medium"
                        >
                            ✏️ Sửa bài
                        </button>
                        <button
                            onClick={handleDeletePost}
                            disabled={deletePostMutation.isPending}
                            className="text-xs text-red-600 hover:text-red-700 px-3 py-1.5 rounded border border-red-200 hover:bg-red-50 transition cursor-pointer"
                        >
                            🗑️ Xoá bài
                        </button>
                    </div>
                </div>
            </header>

            {/* Chi tiết bài viết chuẩn toà soạn báo chí */}
            <main className="max-w-[820px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
                <article>
                    <div className="mb-4">
                        <span className="text-xs font-bold text-[#0073e6] uppercase tracking-widest">
                            {post.category || 'TIN TỨC'}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-[1.18] tracking-tight mb-5">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 pb-6 mb-8 border-b border-[#e5e5e5]">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-black text-sm">{post.author}</span>
                            <span>·</span>
                            <span>{formatDate(post.createdAt)}</span>
                            <span>·</span>
                            <span className="text-[#0073e6] font-medium">💬 {post.comments?.length || 0} bình luận</span>
                        </div>
                    </div>

                    {post.image && (
                        <div className="w-full aspect-[16/10] overflow-hidden rounded-md bg-gray-100 mb-8 shadow-sm">
                            <img
                                src={post.image}
                                alt={post.title}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="text-[17px] leading-[1.8] text-gray-800 whitespace-pre-line space-y-6">
                        {post.content}
                    </div>
                </article>

                {/* ============================================================== */}
                {/* NÂNG CAO 4: KHU VỰC BÌNH LUẬN ĐỘC GIẢ (COMMENTS MODULE)        */}
                {/* ============================================================== */}
                <section id="comments" className="mt-14 pt-8 border-t-2 border-black">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <span>💬</span> Ý kiến bạn đọc ({post.comments?.length || 0})
                        </h2>
                        <span className="text-[11px] text-[#0073e6] font-semibold bg-blue-50 px-2.5 py-1 rounded">
                            TanStack Query Realtime
                        </span>
                    </div>

                    {/* Form gửi bình luận mới */}
                    <form onSubmit={handleSendComment} className="p-5 bg-gray-50 rounded-xl border border-gray-200 mb-8 space-y-3.5">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Gửi phản hồi của bạn
                        </h3>
                        <div>
                            <input
                                type="text"
                                value={commentAuthor}
                                onChange={(e) => setCommentAuthor(e.target.value)}
                                placeholder="Họ và tên của bạn..."
                                className="w-full sm:w-1/2 px-3.5 py-2 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#0073e6] bg-white"
                                required
                            />
                        </div>
                        <textarea
                            rows={3}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Chia sẻ quan điểm hoặc đóng góp góc nhìn về nội dung bài báo này..."
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#0073e6] bg-white resize-none leading-relaxed"
                            required
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={addCommentMutation.isPending}
                                className="px-5 py-2 rounded-md bg-[#0073e6] hover:bg-[#0060c0] active:scale-95 text-white text-xs font-bold tracking-wider uppercase transition disabled:opacity-50 cursor-pointer shadow-sm"
                            >
                                {addCommentMutation.isPending ? 'Đang gửi...' : 'GỬI BÌNH LUẬN'}
                            </button>
                        </div>
                    </form>

                    {/* Danh sách bình luận */}
                    <div className="space-y-3.5">
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                                <div key={comment.id} className="p-4 bg-white border border-gray-200 rounded-lg flex items-start justify-between gap-4 shadow-2xs">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-[#0073e6] font-bold text-xs flex items-center justify-center flex-shrink-0 uppercase">
                                            {comment.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-900">{comment.author}</span>
                                                <span className="text-[10px] text-gray-400">·</span>
                                                <span className="text-[11px] text-gray-400">{formatDate(comment.createdAt)}</span>
                                            </div>
                                            <p className="text-xs text-gray-700 mt-1 leading-relaxed whitespace-pre-line">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        disabled={deleteCommentMutation.isPending}
                                        className="text-xs text-gray-400 hover:text-red-600 p-1 transition cursor-pointer"
                                        title="Xoá bình luận này"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-8 italic border border-dashed border-gray-200 rounded-lg">
                                Chưa có bình luận nào cho bài viết này. Hãy là người đầu tiên để lại ý kiến!
                            </p>
                        )}
                    </div>
                </section>
            </main>

            {/* Modal chỉnh sửa bài viết */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-200 max-h-[92vh] flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5] mb-4">
                            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <span>✏️</span> CHỈNH SỬA BÀI VIẾT #{post.id}
                            </h3>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4 overflow-y-auto pr-1">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6]"
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
                                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6]"
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
                                        <option value="BUSINESS">Kinh doanh (Business)</option>
                                        <option value="POLITICS">Chính trị (Politics)</option>
                                        <option value="TRAVEL">Du lịch (Travel)</option>
                                        <option value="TECH">Công nghệ (Tech)</option>
                                        <option value="BOOKS">Sách & Tri thức (Books)</option>
                                        <option value="LIFESTYLE">Đời sống (Lifestyle)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Link ảnh bài viết (URL)
                                </label>
                                <input
                                    type="url"
                                    value={editImage}
                                    onChange={(e) => setEditImage(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6]"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Nội dung bài viết
                                </label>
                                <textarea
                                    rows={6}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#0073e6] leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5e5]">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                                >
                                    Huỷ
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatePostMutation.isPending}
                                    className="px-5 py-2 rounded-md bg-[#0073e6] hover:bg-[#0060c0] active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-sm"
                                >
                                    {updatePostMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
