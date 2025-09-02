const express = require('express');
const router = express.Router();

// TODO: Add auth routes
router.get('/', (req, res) => {
    res.json({ message: 'Formations routes coming soon!' });
});

module.exports = router;