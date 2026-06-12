import express from 'express';

const router = express.Router();

const mockLyrics: Record<string, string> = {
  'test-song': `[00:00.00] 这是测试歌词
[00:05.00] 第一句歌词
[00:10.00] 第二句歌词
[00:15.00] 第三句歌词
[00:20.00] 第四句歌词`,
  'default': `[00:00.00] 暂无歌词
[00:05.00] 请搜索其他歌曲`
};

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const lyrics = mockLyrics[q as string] || mockLyrics['default'];
    
    res.json({ success: true, lyrics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
