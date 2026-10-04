const express = require('express');
const cors = require('cors');

const app = express();

// Middleware CORS - cho phép Next.js tại localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware hỗ trợ debug
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Dữ liệu mẫu chuẩn 100% khớp với toà soạn báo Hague trong ảnh thiết kế
let posts = [
  // 1. HERO - CENTER (OPINION)
  {
    id: 1,
    title: 'When you tell them the truth',
    content: 'Ei mei scripta intellegat. Verear voluptaria eam at, consul putent eu vel. Pro saepe maluisset ne, audire maiorum forensibus eos et. Diceret detraxit vis at. Eum et idque tollit assentior, ullum soleat usu id.',
    author: 'Isabella and Lucas',
    category: 'OPINION',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 2. HERO - LEFT TOP (BOOKS)
  {
    id: 2,
    title: 'Hero-Half Post Example',
    content: 'Labores incorrupte vim an. Id augue populo alienum usu, has harum consectetuer ne, ne clita fuisset dignissim quo. Khám phá những trải nghiệm văn học độc đáo.',
    author: 'Editorial Desk',
    category: 'BOOKS',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 3. HERO - LEFT BOTTOM (BOOKS · POLITICS)
  {
    id: 3,
    title: 'I decided to move out of the house',
    content: 'Labores incorrupte vim an. Id augue populo alienum usu, has harum consectetuer ne, ne clita fuisset dignissim quo. Quo natum nemore putant in, his te case habemus.',
    author: 'Lucas',
    category: 'BOOKS · POLITICS',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 4. HERO - LATEST 1
  {
    id: 4,
    title: 'This is my 2024 unwrapped',
    content: 'Tổng kết những khoảnh khắc đáng nhớ nhất trong năm qua cùng những chuyển biến văn hoá đương đại.',
    author: 'Lifestyle Editor',
    category: 'LIFESTYLE',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 5. HERO - LATEST 2
  {
    id: 5,
    title: "Rebel Wilson weds Ramona Agruma in Sydney - and this time it's for real",
    content: 'Đám cưới lãng mạn tại Sydney thu hút sự quan tâm của truyền thông quốc tế.',
    author: 'Celebrity News',
    category: 'PEOPLE',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 6. HERO - LATEST 3
  {
    id: 6,
    title: 'When you tell them the truth',
    content: 'Góc nhìn chân thực về câu chuyện minh bạch thông tin trong đời sống.',
    author: 'Correspondent',
    category: 'MEDIA',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 7. HERO - LATEST 4
  {
    id: 7,
    title: 'Hero-Half Post Example',
    content: 'Một góc nhìn sâu sắc từ các nhà phê bình hàng đầu về nghệ thuật sáng tác đương đại.',
    author: 'Literary Circle',
    category: 'BOOKS',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 8. HERO - LATEST 5
  {
    id: 8,
    title: 'Welcome To The Finest WordPress Theme For Writers',
    content: 'Chào mừng các tác giả đến với nền tảng xuất bản chuyên nghiệp hàng đầu.',
    author: 'Hague Team',
    category: 'DESIGN',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 9. BUSINESS 1
  {
    id: 9,
    title: "I'm a high school graduate",
    content: 'Quo natum nemore putant in, his te case habemus. Nulla detraxit explicari in vim. Id eam magna omnesque.',
    author: 'Graduate Story',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 10. BUSINESS 2
  {
    id: 10,
    title: 'My entrance exam was on a book of matches',
    content: 'Ei mei scripta intellegat. Verear voluptaria eam at, consul putent eu vel. Pro saepe maluisset ne, audire maiorum.',
    author: 'Education Desk',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 11. BUSINESS 3
  {
    id: 11,
    title: 'My name is Rhoda Morgenstern',
    content: 'Lorem ipsum dolor sit amet, ei officiis assueverit pri, duo volumus commune molestiae ad, cum at clita latine. Phỏng vấn độc quyền nhân vật của năm.',
    author: 'Alex Morgan',
    category: 'BUSINESS · INTERVIEW',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 12. BUSINESS 4
  {
    id: 12,
    title: "Tonight what heights we'll hit, on with the show this is it",
    content: 'Labores incorrupte vim an. Id augue populo alienum usu, has harum consectetuer ne, ne clita fuisset dignissim quo.',
    author: 'Entertainment Desk',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 13. TRAVEL 1
  {
    id: 13,
    title: 'The first thing I remember liking that liked me back was food',
    content: 'Ius ea rebum nostrum offendit. Per in recusabo facilisis, est ei choro veritus gloriatur. Has ut dicant fuisset.',
    author: 'Culinary Journey',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 14. TRAVEL 2
  {
    id: 14,
    title: 'Last Trip to Pakistan',
    content: 'Justo fabulas singulis at pri, saepe luptatum mei an. Duo idque solet scribentur eu, natum iudico labore te.',
    author: 'Traveler Log',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 15. TRAVEL 3
  {
    id: 15,
    title: 'Post Gallery - Slider',
    content: 'Patrioque assentior ea vim. Volutpat salutandi ex his, cu sea soluta melius gubergren, has latine reprehendunt ea. Has',
    author: 'Photo Expedition',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 16. TRAVEL 4
  {
    id: 16,
    title: 'We vote for our rights',
    content: 'Hey there. This is an excerpt. Quyền công dân và trách nhiệm cộng đồng trong thời đại hội nhập.',
    author: 'Civic Journal',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 17. POLITICS 1
  {
    id: 17,
    title: 'New York, this is your last chance',
    content: 'Quo natum nemore putant in, his te case habemus. Nulla detraxit explicari in vim.',
    author: 'Metro Bureau',
    category: 'POLITICS',
    image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 18. POLITICS 2
  {
    id: 18,
    title: 'Helping to Protect the Okavango Basin',
    content: 'Labore nonumes te vel, vis id errem tantas tempor. Solet quidam salutatus.',
    author: 'Global Envoy',
    category: 'POLITICS',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 19. POLITICS 3
  {
    id: 19,
    title: 'An Old Man Telling Me about Wars',
    content: 'Ius ea rebum nostrum offendit. Per in recusabo facilisis, est ei choro.',
    author: 'Historical Archives',
    category: 'POLITICS',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
  },
  // 20. POLITICS 4
  {
    id: 20,
    title: 'Enter at your peril, past the vault door',
    content: 'Duo dolorum mandamus mnesarchum te. Sit ridens persius ex. Vel noluisse perpetua.',
    author: 'Special Report',
    category: 'OPINION · POLITICS',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-08T08:00:00.000Z'
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

  const defaultImage = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=80';

  const newPost = {
    id: Date.now(),
    title,
    content,
    author,
    category: category ? category.toUpperCase() : 'BÀI VIẾT MỚI',
    image: image && image.trim() !== '' ? image : defaultImage,
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