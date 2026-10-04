const express = require('express');
const cors = require('cors');

const app = express();

// Middleware CORS - cho phép Next.js tại localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Logging middleware hỗ trợ debug
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Dữ liệu mẫu ban đầu
let posts = [
  {
    id: 1,
    title: 'Bài viết đầu tiên',
    content: 'Nội dung bài 1: Chào mừng đến với bài thực hành Fullstack Next.js và Express!',
    author: 'Admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Hướng dẫn NextJS & CORS',
    content: 'Nội dung bài 2: Tìm hiểu về cơ chế CORS, cấu hình Proxy rewrites và kết nối API.',
    author: 'Admin',
    createdAt: new Date().toISOString()
  },
];

// 1. GET /api/posts - Lấy danh sách bài viết
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// 2. POST /api/posts - Thêm bài viết mới
app.post('/api/posts', (req, res) => {
  const { title, content, author } = req.body;

  // Validation đơn giản
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Thiếu dữ liệu: Vui lòng nhập đủ tiêu đề, nội dung và tác giả' });
  }

  const newPost = {
    id: Date.now(),
    title,
    content,
    author,
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  res.status(201).json(newPost);
});

// 3. PUT /api/posts/:id - Chỉnh sửa bài viết (Nâng cao 1)
app.put('/api/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  }

  const { title, content, author } = req.body;
  posts[index] = {
    ...posts[index],
    ...(title && { title }),
    ...(content && { content }),
    ...(author && { author }),
    updatedAt: new Date().toISOString()
  };

  res.json(posts[index]);
});

// 4. DELETE /api/posts/:id - Xóa bài viết
app.delete('/api/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  }

  posts.splice(index, 1);
  res.json({ message: 'Đã xoá thành công' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend chạy tại port :${PORT}`);
});