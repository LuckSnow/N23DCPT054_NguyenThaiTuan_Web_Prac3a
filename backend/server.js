const express = require('express');
const cors = require('cors');

const app = express();

// Middleware CORS - cho phép Next.js tại localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Tăng giới hạn payload để nhận ảnh base64 tải lên từ máy tính
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware hỗ trợ debug
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Dữ liệu mẫu chuẩn báo chí toà soạn, nội dung thực tế theo đúng chuyên mục
let posts = [
  // 1. HERO MAIN - TECH
  {
    id: 1,
    title: 'Làn Sóng Trí Tuệ Nhân Tạo Tái Định Hình Nền Kinh Tế Toàn Cầu Năm 2026',
    content: 'Sự bùng nổ của các mô hình trí tuệ nhân tạo thế hệ mới và robot tự hành đang mở ra cuộc cách mạng công nghiệp sâu sắc. Các tập đoàn công nghệ lớn liên tục tích hợp AI vào chuỗi sản xuất, tự động hoá quy trình và thay đổi toàn diện diện mạo thị trường lao động số.',
    author: 'Nguyễn Thái Tuấn',
    category: 'TECH',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T08:00:00.000Z'
  },
  // 2. HERO LEFT 1 - BOOKS
  {
    id: 2,
    title: 'Hành Trình Tri Thức: Những Tác Phẩm Kinh Điển Về Tư Duy Đương Đại',
    content: 'Tuyển tập những cuốn sách triết học và tâm lý học xuất sắc nhất giúp độc giả xây dựng tư duy phản biện và khả năng thích ứng linh hoạt trong kỷ nguyên số.',
    author: 'Trần Minh Quân',
    category: 'BOOKS',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T08:15:00.000Z'
  },
  // 3. HERO LEFT 2 - POLITICS
  {
    id: 3,
    title: 'Hội Nghị Thượng Đỉnh Toàn Cầu Về Cam Kết Giảm Phát Thải Và Phát Triển Xanh',
    content: 'Đại diện hơn 150 quốc gia đã cùng ký kết thoả ước hành động chung về chuyển dịch năng lượng sạch, bảo vệ các hệ sinh thái rừng nhiệt đới và tài trợ khí hậu.',
    author: 'Lê Hoàng Yến',
    category: 'POLITICS',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T08:30:00.000Z'
  },
  // 4. LATEST 1 - LIFESTYLE
  {
    id: 4,
    title: 'Xu Hướng Đô Thị Xanh: Không Gian Sống Bền Vững Giữa Lòng Các Đại Đô Thị',
    content: 'Mô hình căn hộ xanh tiết kiệm năng lượng và các khu vườn cộng đồng trên cao đang trở thành tiêu chuẩn sống mới của cư dân hiện đại.',
    author: 'Ban Biên Tập Đô Thị',
    category: 'LIFESTYLE',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=300&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T08:45:00.000Z'
  },
  // 5. LATEST 2 - BUSINESS
  {
    id: 5,
    title: 'Thị Trường Khởi Nghiệp Công Nghệ Tài Chính: Cơ Hội Mới Cho Các Kỳ Lân Mới Nổi',
    content: 'Dòng vốn đầu tư mạo hiểm đang đổ mạnh vào các giải pháp thanh toán số không biên giới và quản lý tài chính cá nhân thông minh.',
    author: 'Vũ Hải Đăng',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T09:00:00.000Z'
  },
  // 6. LATEST 3 - TRAVEL
  {
    id: 6,
    title: 'Khám Phá Di Sản Hang Động Kỳ Vĩ Sơn Đoòng Cùng Các Chuyên Gia Thám Hiểm',
    content: 'Trải nghiệm hành trình băng rừng vượt suối để chiêm ngưỡng một trong những kỳ quan thiên nhiên ngầm tráng lệ nhất hành tinh.',
    author: 'Phạm Quốc Tuấn',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T09:15:00.000Z'
  },
  // 7. LATEST 4 - TECH
  {
    id: 7,
    title: 'Cuộc Đua Bán Dẫn Thế Hệ Mới: Tương Lai Của Chip Tiến Trình 2nm',
    content: 'Các nhà sản xuất vi mạch hàng đầu đạt được bước đột phá trong công nghệ khắc tia cực tím giúp chip xử lý nhanh hơn 40% và tiết kiệm pin vượt trội.',
    author: 'Kỹ Thuật Số',
    category: 'TECH',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T09:30:00.000Z'
  },
  // 8. LATEST 5 - BOOKS
  {
    id: 8,
    title: 'Nghệ Thuật Đọc Sách Sâu Trong Thời Đại Của Mạng Xã Hội Ngắn',
    content: 'Làm thế nào để duy trì sự tập trung dài hạn và tận hưởng trọn vẹn giá trị tinh thần từ những cuốn sách giấy truyền thống.',
    author: 'Ngô Diệu Linh',
    category: 'BOOKS',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=300&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T09:45:00.000Z'
  },
  // 9. BUSINESS 1
  {
    id: 9,
    title: 'Chiến Lược Tái Cơ Cấu Tài Chính Doanh Nghiệp Trong Thời Kỳ Biến Động Lãi Suất',
    content: 'Các chuyên gia tài chính khuyến nghị doanh nghiệp cần đa dạng hoá nguồn vốn lưu động, giảm áp lực nợ ngắn hạn và ưu tiên đầu tư vào công nghệ cốt lõi.',
    author: 'Nguyễn Văn Nam',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T10:00:00.000Z'
  },
  // 10. BUSINESS 2
  {
    id: 10,
    title: 'Thương Mại Điện Tử Xuyên Biên Giới: Đòn Bẩy Cho Doanh Nghiệp Xuất Khẩu',
    content: 'Nhờ các nền tảng logistics số và thanh toán tự động, nông sản và hàng thủ công mỹ nghệ Việt Nam đang tiếp cận trực tiếp hàng triệu người tiêu dùng thế giới.',
    author: 'Đỗ Thảo Vy',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T10:15:00.000Z'
  },
  // 11. BUSINESS 3
  {
    id: 11,
    title: 'Đầu Tư Mạo Hiểm Vào Năng Lượng Tái Tạo Đạt Kỷ Lục Mới Tại Châu Á',
    content: 'Các dự án điện mặt trời áp mái và trang trại điện gió ngoài khơi thu hút dòng vốn quốc tế kỷ lục hơn 12 tỷ USD trong nửa đầu năm nay.',
    author: 'Alex Morgan',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T10:30:00.000Z'
  },
  // 12. BUSINESS 4
  {
    id: 12,
    title: 'Chuyển Đổi Số Chuỗi Cung Ứng: Bài Học Thành Công Từ Các Tập Đoàn Bán Lẻ',
    content: 'Ứng dụng cảm biến IoT và phân tích dữ liệu lớn giúp cắt giảm thời gian vận chuyển hàng hoá và giảm thiểu tỷ lệ thất thoát kho bãi đáng kể.',
    author: 'Hoàng Bách',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T10:45:00.000Z'
  },
  // 13. TRAVEL 1
  {
    id: 13,
    title: 'Hành Trình Chinh Phục Vẻ Đẹp Hoang Sơ Của Vịnh Hạ Long Mùa Thu',
    content: 'Cảnh sắc làn nước ngọc bích hòa cùng những vách đá vôi hàng triệu năm tuổi tạo nên bức tranh thuỷ mặc tuyệt mỹ của thiên nhiên vùng biển bắc.',
    author: 'Hà Linh Chi',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T11:00:00.000Z'
  },
  // 14. TRAVEL 2
  {
    id: 14,
    title: 'Trải Nghiệm Văn Hoá Trà Đạo Cổ Truyền Tại Cố Đô Kyoto Nhật Bản',
    content: 'Tìm về sự an nhiên tĩnh lặng giữa những khu vườn rêu cổ kính và ngôi đền gỗ ngàn năm tuổi trong lòng nước Nhật đương đại.',
    author: 'Kenji Sato',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T11:15:00.000Z'
  },
  // 15. TRAVEL 3
  {
    id: 15,
    title: 'Cung Đường Băng Tuyết Bắc Âu: Săn Ánh Sáng Cực Quang Kỳ Ảo Tại Na Uy',
    content: 'Cảm giác nghẹt thở khi chiêm ngưỡng những dải sáng xanh lục nhảy múa trên bầu trời đêm bắc cực giữa cái lạnh âm 15 độ C.',
    author: 'Erik Olsen',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T11:30:00.000Z'
  },
  // 16. TRAVEL 4
  {
    id: 16,
    title: 'Hương Vị Ẩm Thực Đường Phố Sài Gòn: Bản Giao Hưởng Của Những Nét Đẹp Đời Thường',
    content: 'Từ ổ bánh mì giòn rụm đến bát hủ tiếu nghi ngút khói thơm lừng, ẩm thực hè phố chứa đựng tâm hồn phóng khoáng của đất phương Nam.',
    author: 'Võ Minh Luân',
    category: 'TRAVEL',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T11:45:00.000Z'
  },
  // 17. POLITICS 1 (Chính sách & Quốc tế)
  {
    id: 17,
    title: 'Kỷ Nguyên Đa Cực: Tái Định Hình Bản Đồ Hợp Tác Kinh Tế Và Ngoại Giao Toàn Cầu',
    content: 'Sự gia tăng đối thoại giữa các nền kinh tế mới nổi đang tạo lập các hành lang kinh tế mới, thúc đẩy sự cân bằng quyền lực và thương mại đa phương.',
    author: 'Viện Nghiên Cứu Chiến Lược',
    category: 'POLITICS',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T12:00:00.000Z'
  },
  // 18. POLITICS 2
  {
    id: 18,
    title: 'Chính Sách Chuyển Đổi Số Quốc Gia: Hướng Tới Chính Phủ Điện Tử Toàn Diện',
    content: 'Triển khai đồng bộ dữ liệu dân cư và dịch vụ công trực tuyến mức độ 4 giúp tiết kiệm hàng ngàn tỷ đồng và nâng cao độ hài lòng của công dân.',
    author: 'Ban Cải Cách Hành Chính',
    category: 'POLITICS',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T12:15:00.000Z'
  },
  // 19. POLITICS 3
  {
    id: 19,
    title: 'Bảo Vệ Đa Dạng Sinh Học Biển Theo Hiệp Định Mới Của Liên Hợp Quốc',
    content: 'Quy định pháp lý quốc tế mang tính ràng buộc đầu tiên nhằm thiết lập các khu bảo tồn biển tại các vùng biển quốc tế nằm ngoài quyền tài phán.',
    author: 'Cố Vấn Môi Trường LHQ',
    category: 'POLITICS',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T12:30:00.000Z'
  },
  // 20. POLITICS 4
  {
    id: 20,
    title: 'Hợp Tác An Ninh Mạng Xuyên Biên Giới Để Chống Tội Phạm Công Nghệ Cao',
    content: 'Các cơ quan thực thi pháp luật quốc tế thiết lập cơ chế chia sẻ cảnh báo sớm về các chiến dịch mã độc tống tiền nhắm vào hạ tầng trọng yếu.',
    author: 'Trung Tâm An Toàn Không Gian Mạng',
    category: 'POLITICS',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-10-04T12:45:00.000Z'
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

  const defaultImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80';

  const newPost = {
    id: Date.now(),
    title,
    content,
    author,
    category: category ? category.toUpperCase() : 'BUSINESS',
    image: image && image.trim() !== '' ? image : defaultImage,
    createdAt: new Date().toISOString()
  };

  posts.unshift(newPost); // Thêm lên đầu danh sách
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