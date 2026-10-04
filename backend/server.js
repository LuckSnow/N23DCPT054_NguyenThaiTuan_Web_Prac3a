const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware CORS - hỗ trợ localhost và domain production từ Vercel
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Tăng giới hạn payload để nhận ảnh base64 tải lên từ máy tính
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware hỗ trợ debug (Tiết 3)
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Helper đọc và ghi file JSON (Nâng cao 3)
async function readData() {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

async function writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 0. GET / - Root Health Check cho Render & Vercel
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Fullstack Blog REST API (Toà soạn Hague) đang hoạt động!',
        endpoints: {
            getAllPosts: 'GET /api/posts',
            createPost: 'POST /api/posts',
            updatePost: 'PUT /api/posts/:id',
            deletePost: 'DELETE /api/posts/:id',
            getComments: 'GET /api/posts/:id/comments',
            addComment: 'POST /api/posts/:id/comments',
            deleteComment: 'DELETE /api/comments/:commentId'
        }
    });
});

// 1. GET /api/posts - Lấy danh sách bài viết
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await readData();
        res.json(posts);
    } catch {
        res.status(500).json({ error: 'Không thể đọc dữ liệu bài viết' });
    }
});

// 1.1. GET /api/posts/:id - Lấy chi tiết một bài viết kèm bình luận (Nâng cao 4)
app.get('/api/posts/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const posts = await readData();
        const post = posts.find((p) => p.id === id);
        if (!post) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        }
        res.json(post);
    } catch {
        res.status(500).json({ error: 'Không thể đọc dữ liệu bài viết' });
    }
});

// 2. POST /api/posts - Thêm bài viết mới
app.post('/api/posts', async (req, res) => {
    const { title, content, author, category, image } = req.body;

    if (!title || !content || !author) {
        return res.status(400).json({ error: 'Thiếu dữ liệu: Vui lòng nhập đủ tiêu đề, nội dung và tác giả' });
    }

    const defaultImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80';

    try {
        const posts = await readData();
        const newPost = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            author: author.trim(),
            category: category ? category.toUpperCase() : 'BUSINESS',
            image: image && image.trim() !== '' ? image : defaultImage,
            comments: [],
            createdAt: new Date().toISOString()
        };

        posts.unshift(newPost);
        await writeData(posts);
        res.status(201).json(newPost);
    } catch {
        res.status(500).json({ error: 'Không thể tạo bài viết mới' });
    }
});

// 3. PUT /api/posts/:id - Cập nhật bài viết (Nâng cao 1)
app.put('/api/posts/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { title, content, author, category, image } = req.body;

    try {
        const posts = await readData();
        const index = posts.findIndex((p) => p.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        }

        posts[index] = {
            ...posts[index],
            ...(title && { title: title.trim() }),
            ...(content && { content: content.trim() }),
            ...(author && { author: author.trim() }),
            ...(category && { category: category.toUpperCase() }),
            ...(image && { image }),
            updatedAt: new Date().toISOString()
        };

        await writeData(posts);
        res.json(posts[index]);
    } catch {
        res.status(500).json({ error: 'Không thể cập nhật bài viết' });
    }
});

// 4. DELETE /api/posts/:id - Xóa bài viết (Tiết 4-5)
app.delete('/api/posts/:id', async (req, res) => {
    const id = Number(req.params.id);

    try {
        const posts = await readData();
        const index = posts.findIndex((p) => p.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        }

        posts.splice(index, 1);
        await writeData(posts);
        res.json({ message: 'Đã xoá thành công' });
    } catch {
        res.status(500).json({ error: 'Không thể xoá bài viết' });
    }
});

// 5. GET /api/posts/:id/comments - Lấy danh sách bình luận của bài viết (Nâng cao 4)
app.get('/api/posts/:id/comments', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const posts = await readData();
        const post = posts.find(p => p.id === id);
        if (!post) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        }
        res.json(post.comments || []);
    } catch {
        res.status(500).json({ error: 'Không thể tải bình luận' });
    }
});

// 6. POST /api/posts/:id/comments - Thêm bình luận cho bài viết (Nâng cao 4)
app.post('/api/posts/:id/comments', async (req, res) => {
    const id = Number(req.params.id);
    const { author, content } = req.body;

    if (!author || !content) {
        return res.status(400).json({ error: 'Vui lòng nhập tên người bình luận và nội dung' });
    }

    try {
        const posts = await readData();
        const post = posts.find(p => p.id === id);
        if (!post) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        }

        if (!Array.isArray(post.comments)) {
            post.comments = [];
        }

        const newComment = {
            id: Date.now(),
            postId: id,
            author: author.trim(),
            content: content.trim(),
            createdAt: new Date().toISOString()
        };

        post.comments.push(newComment);
        await writeData(posts);
        res.status(201).json(newComment);
    } catch {
        res.status(500).json({ error: 'Không thể gửi bình luận' });
    }
});

// 7. DELETE /api/comments/:commentId - Xóa bình luận (Nâng cao 4)
app.delete('/api/comments/:commentId', async (req, res) => {
    const commentId = Number(req.params.commentId);

    try {
        const posts = await readData();
        let found = false;

        for (const post of posts) {
            if (Array.isArray(post.comments)) {
                const idx = post.comments.findIndex(c => c.id === commentId);
                if (idx !== -1) {
                    post.comments.splice(idx, 1);
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            return res.status(404).json({ error: 'Không tìm thấy bình luận' });
        }

        await writeData(posts);
        res.json({ message: 'Đã xoá bình luận thành công' });
    } catch {
        res.status(500).json({ error: 'Không thể xoá bình luận' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend chạy tại port :${PORT}`);
});