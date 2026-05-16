import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import DocumentModel from '../models/Document';
import UserModel from '../models/user';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all documents for current user
router.get('/', protect, async (req: AuthRequest, res: Response) => {
    const docs = await DocumentModel.find({ owner: req.userId }).sort({ updatedAt: -1 });
    res.json(docs);
});

// Create new document
router.post('/', protect, async (req: AuthRequest, res: Response) => {
    const roomId = uuidv4();
    const doc = await DocumentModel.create({
        roomId,
        owner: req.userId,
        title: req.body.title || 'Untitled',
        language: req.body.language || 'javascript'
    });
    res.status(201).json(doc);
});

// Get recently joined rooms — MUST be before /:roomId
router.get('/recent', protect, async (req: AuthRequest, res: Response) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.recentRooms || !Array.isArray(user.recentRooms)) {
            return res.json([]);
        }

        const recentDocs = await Promise.all(
            user.recentRooms.map((roomId: string) =>
                DocumentModel.findOne({ roomId }).lean()
            )
        );

        const filtered = recentDocs.filter(doc => {
            if (!doc || !doc.owner) return false;
            return doc.owner.toString() !== req.userId;
        });

        res.json(filtered);
    } catch (err) {
        console.error('GET /recent error:', err);
        res.status(500).json({ error: 'Failed to fetch recent rooms' });
    }
});

// Track recently joined room — MUST be before /:roomId
router.post('/recent/:roomId', protect, async (req: AuthRequest, res: Response) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const recentRooms = Array.isArray(user.recentRooms) ? user.recentRooms : [];

        user.recentRooms = [
            req.params.roomId,
            ...recentRooms.filter((id: string) => id !== req.params.roomId)
        ] as string[];
        user.recentRooms = user.recentRooms.slice(0, 10);

        await user.save();
        res.json({ success: true });
    } catch (err) {
        console.error('POST /recent/:roomId error:', err);
        res.status(500).json({ error: 'Failed to update recent rooms' });
    }
});

// Get document by roomId
router.get('/:roomId', protect, async (req: AuthRequest, res: Response) => {
    const doc = await DocumentModel.findOne({ roomId: req.params.roomId });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
});

// Save document content
router.put('/:roomId', protect, async (req: AuthRequest, res: Response) => {
    const doc = await DocumentModel.findOneAndUpdate(
        { roomId: req.params.roomId },
        { content: req.body.content },
        { returnDocument: 'after' }
    );
    res.json(doc);
});

// Rename document
router.patch('/:roomId/title', protect, async (req: AuthRequest, res: Response) => {
    const doc = await DocumentModel.findOneAndUpdate(
        { roomId: req.params.roomId, owner: req.userId },
        { title: req.body.title },
        { returnDocument: 'after' }
    );
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
});

// Delete document
router.delete('/:roomId', protect, async (req: AuthRequest, res: Response) => {
    await DocumentModel.findOneAndDelete({ roomId: req.params.roomId, owner: req.userId });
    res.json({ success: true });
});

export default router;