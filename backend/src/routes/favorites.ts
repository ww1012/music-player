import express from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById((req as any).userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = (req as any).userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.favorites.includes(songId)) {
      user.favorites.push(songId);
      await user.save();
    }

    res.json({ success: true, message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.favorites = user.favorites.filter(fav => fav !== id);
    await user.save();

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
