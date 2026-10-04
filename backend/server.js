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

// Dữ liệu mẫu ban đầu theo phong cách tạp chí Hague
let posts = [
  {
    id: 1,
    title: 'When you tell them the truth',
    content: 'Ei mei scripta intellegat. Verear voluptaria eam at, consul putent eu vel. Pro saepe maluisset ne, audire maiorum forensibus eos et. Diceret detraxit vis at. Eum et idque tollit assentior, ullum soleat usu id. Khám phá sự thật đằng sau những câu chuyện truyền cảm hứng đương đại.',
    author: 'Isabella and Lucas',
    category: 'OPINION',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T09:00:00.000Z'
  },
  {
    id: 2,
    title: 'Hero-Half Post Example',
    content: 'Khám phá thế giới sách và những trải nghiệm nghệ thuật đương đại mang tính bước ngoặt của các tác giả trẻ.',
    author: 'Admin',
    category: 'BOOKS',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:30:00.000Z'
  },
  {
    id: 3,
    title: 'I decided to move out of the house',
    content: 'Labores incorrupte vim an. Id augue populo alienum usu, has harum consectetuer ne, ne clita fuisset dignissim quo. Hành trình tìm kiếm không gian sống độc lập và tự do.',
    author: 'Lucas',
    category: 'BOOKS & POLITICS',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T07:15:00.000Z'
  },
  {
    id: 4,
    title: 'This is my 2024 unwrapped',
    content: 'Nhìn lại một năm với những cột mốc phát triển công nghệ và những bước chuyển mình đáng kinh ngạc.',
    author: 'Editorial Desk',
    category: 'LIFESTYLE',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T10:00:00.000Z'
  },
  {
    id: 5,
    title: 'Rebel Wilson weds Ramona Agruma in Sydney',
    content: 'Khoảnh khắc đáng nhớ và ý nghĩa tại Sydney trong sự chúc phúc của gia đình và người hâm mộ khắp thế giới.',
    author: 'Entertainment',
    category: 'PEOPLE',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T11:20:00.000Z'
  },
  {
    id: 6,
    title: 'When you tell them the truth',
    content: 'Góc nhìn chân thực từ phóng viên quốc tế về sự minh bạch thông tin trong kỷ nguyên số.',
    author: 'Media Lab',
    category: 'MEDIA',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T12:00:00.000Z'
  },
  {
    id: 7,
    title: "I'm a high school graduate",
    content: 'Quo natum nemore putant in, his te case habemus. Nulla detraxit explicari in vim. Hành trình của những người trẻ tự lập nghiệp sớm.',
    author: 'Sarah Chen',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T13:00:00.000Z'
  },
  {
    id: 8,
    title: 'My entrance exam was on a book of matches',
    content: 'Ei mei scripta intellegat. Verear voluptaria eam at, consul putent eu vel. Câu chuyện thi tuyển đại học kỳ lạ và đầy cảm xúc.',
    author: 'David Kim',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T13:30:00.000Z'
  },
  {
    id: 9,
    title: 'My name is Rhoda Morgenstern',
    content: 'Lorem ipsum dolor sit amet, ei officiis assueverit pri, duo volumus commune molestiae ad, cum at clita latine. Phỏng vấn độc quyền nhân vật của năm.',
    author: 'Alex Morgan',
    category: 'BUSINESS · INTERVIEW',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T14:00:00.000Z'
  },
  {
    id: 10,
    title: "Tonight what heights we'll hit, on with the show this is it",
    content: 'Labores incorrupte vim an. Id augue populo alienum usu, has harum consectetuer ne, ne clita fuisset dignissim quo. Sự kiện trình diễn công nghệ đêm nay.',
    author: 'Showbiz Desk',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T14:45:00.000Z'
  },
  {
    id: 11,
    title: 'The first thing I remember liking that liked me back was food',
    content: 'Ius ea rebum nostrum offendit. Per in recusabo facilisis, est ei choro veritus gloriatur. Khám phá văn hóa ẩm thực truyền thống địa phương.',
    author: 'Chef Gordon',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T15:00:00.000Z'
  },
  {
    id: 12,
    title: 'Last Trip to Pakistan',
    content: 'Justo fabulas singulis at pri, saepe luptatum mei an. Duo idque solet scribentur eu, natum iudico labore te. Trải nghiệm du lịch khám phá vùng đất huyền bí.',
    author: 'Elena Rostova',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T15:30:00.000Z'
  }
];

// 1. GET /api/posts - Lấy danh sách bài viết
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// 2. POST /api/posts - Thêm bài viết mới
app.post('/api/posts', (req, res) => {
  const { title, content, author, category, image } = req.body;

  // Validation đơn giản theo chuẩn Lab 3
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Thiếu dữ liệu: Vui lòng nhập đủ tiêu đề, nội dung và tác giả' });
  }

  const defaultImages = [
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80'
  ];

  const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];

  const newPost = {
    id: Date.now(),
    title,
    content,
    author,
    category: category ? category.toUpperCase() : 'BÀI VIẾT MỚI',
    image: image && image.trim() !== '' ? image : randomImage,
    createdAt: new Date().toISOString()
  };

  posts.unshift(newPost); // Thêm lên đầu danh sách để bài mới nhất luôn ở vị trí tiêu điểm
  res.status(201).json(newPost);
});

// 3. PUT /api/posts/:id - Chỉnh sửa bài viết (Nâng cao 1)
app.put('/api/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  }

  const { title, content, author, category, image } = req.body;
  posts[index] = {
    ...posts[index],
    ...(title && { title }),
    ...(content && { content }),
    ...(author && { author }),
    ...(category && { category: category.toUpperCase() }),
    ...(image && { image }),
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