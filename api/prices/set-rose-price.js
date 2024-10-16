import { authMiddleware } from '../auth/auth.js';
import { pricesKV } from '../../config.js';

export default authMiddleware(async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { price, timestamp } = req.body;

        if (price === undefined || !timestamp) {
            return res.status(400).json({ success: false, error: 'Missing price or timestamp values' });
        }

        if (isNaN(price)) {
            return res.status(400).json({ success: false, error: 'Invalid price value' });
        }

        // Create a value object containing both price and timestamp
        const priceEntry = JSON.stringify({
            price: parseFloat(price),
            timestamp: parseInt(timestamp)
        });

        // Store the entry in Vercel KV database
        await pricesKV.zadd('rose_prices', { score: parseInt(timestamp), member: priceEntry });

        res.status(200).json({ success: true, timestamp, price });
    } catch (error) {
        console.error('Error in setRosePrice:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
