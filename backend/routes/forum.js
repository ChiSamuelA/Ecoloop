// Forum Discussion System API Routes
const express = require('express');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const database = require('../config/database');

const router = express.Router();

// Input validation helpers
const validatePostInput = (data) => {
    const errors = [];
    
    if (!data.title || data.title.trim().length < 5) {
        errors.push('Le titre doit contenir au moins 5 caractères');
    }
    
    if (!data.content || data.content.trim().length < 10) {
        errors.push('Le contenu doit contenir au moins 10 caractères');
    }
    
    if (data.category && !['general', 'technique', 'marketplace', 'questions'].includes(data.category)) {
        errors.push('Catégorie invalide');
    }
    
    return errors;
};

const validateCommentInput = (data) => {
    const errors = [];
    
    if (!data.content || data.content.trim().length < 3) {
        errors.push('Le commentaire doit contenir au moins 3 caractères');
    }
    
    return errors;
};

// @route   GET /api/forum/posts
// @desc    Get all forum posts with pagination and filtering
// @access  Private
router.get('/posts', verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, category, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Build query with filters
        let baseQuery = `
            FROM forum_posts fp
            JOIN users u ON fp.user_id = u.id
            WHERE 1=1
        `;
        
        let params = [];
        
        if (category && category !== 'all') {
            baseQuery += ' AND fp.category = ?';
            params.push(category);
        }
        
        if (search) {
            baseQuery += ' AND (fp.title LIKE ? OR fp.content LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        // Get posts with user info
        const postsQuery = `
            SELECT 
                fp.*,
                u.nom,
                u.prenom,
                u.avatar_url,
                (SELECT COUNT(*) FROM forum_comments WHERE post_id = fp.id) as comments_count,
                (SELECT MAX(created_at) FROM forum_comments WHERE post_id = fp.id) as last_comment_at
            ${baseQuery}
            ORDER BY fp.is_pinned DESC, fp.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const posts = await database.all(postsQuery, [...params, parseInt(limit), offset]);
        
        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
        const countResult = await database.get(countQuery, params);
        
        const totalPages = Math.ceil(countResult.total / parseInt(limit));
        
        res.status(200).json({
            success: true,
            message: 'Posts récupérés avec succès',
            data: {
                posts: posts,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_posts: countResult.total,
                    per_page: parseInt(limit),
                    has_next: parseInt(page) < totalPages,
                    has_prev: parseInt(page) > 1
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Get posts error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération des posts'
        });
    }
});

// @route   GET /api/forum/posts/:id
// @desc    Get specific post with comments
// @access  Private
router.get('/posts/:id', verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        
        // Get post with author info
        const post = await database.get(`
            SELECT 
                fp.*,
                u.nom,
                u.prenom,
                u.avatar_url
            FROM forum_posts fp
            JOIN users u ON fp.user_id = u.id
            WHERE fp.id = ?
        `, [postId]);
        
        if (!post) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Post non trouvé'
            });
        }
        
        // Increment view count
        await database.run(
            'UPDATE forum_posts SET views_count = views_count + 1 WHERE id = ?',
            [postId]
        );
        
        // Get comments with author info (including nested replies)
        const comments = await database.all(`
            SELECT 
                fc.*,
                u.nom,
                u.prenom,
                u.avatar_url,
                (SELECT COUNT(*) FROM forum_comments WHERE parent_comment_id = fc.id) as replies_count
            FROM forum_comments fc
            JOIN users u ON fc.user_id = u.id
            WHERE fc.post_id = ?
            ORDER BY fc.parent_comment_id ASC, fc.created_at ASC
        `, [postId]);
        
        // Organize comments with replies
        const topLevelComments = comments.filter(c => !c.parent_comment_id);
        const repliesMap = {};
        
        comments.filter(c => c.parent_comment_id).forEach(reply => {
            if (!repliesMap[reply.parent_comment_id]) {
                repliesMap[reply.parent_comment_id] = [];
            }
            repliesMap[reply.parent_comment_id].push(reply);
        });
        
        // Attach replies to top-level comments
        topLevelComments.forEach(comment => {
            comment.replies = repliesMap[comment.id] || [];
        });
        
        res.status(200).json({
            success: true,
            message: 'Post récupéré avec succès',
            data: {
                post: {
                    ...post,
                    views_count: post.views_count + 1
                },
                comments: topLevelComments,
                comments_count: comments.length
            }
        });
        
    } catch (error) {
        console.error('❌ Get post error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération du post'
        });
    }
});

// @route   POST /api/forum/posts
// @desc    Create a new forum post
// @access  Private
router.post('/posts', verifyToken, async (req, res) => {
    try {
        const { title, content, category = 'general' } = req.body;
        const userId = req.user.id;
        
        // Validation
        const validationErrors = validatePostInput({ title, content, category });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Données invalides',
                details: validationErrors
            });
        }
        
        // Create post
        const result = await database.run(`
            INSERT INTO forum_posts (user_id, title, content, category)
            VALUES (?, ?, ?, ?)
        `, [userId, title.trim(), content.trim(), category]);
        
        // Get created post with author info
        const newPost = await database.get(`
            SELECT 
                fp.*,
                u.nom,
                u.prenom,
                u.avatar_url
            FROM forum_posts fp
            JOIN users u ON fp.user_id = u.id
            WHERE fp.id = ?
        `, [result.id]);
        
        res.status(201).json({
            success: true,
            message: 'Post créé avec succès',
            data: {
                post: newPost
            }
        });
        
    } catch (error) {
        console.error('❌ Create post error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la création du post'
        });
    }
});

// @route   PUT /api/forum/posts/:id
// @desc    Update a forum post (only by author)
// @access  Private
router.put('/posts/:id', verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const { title, content, category } = req.body;
        
        // Check if post exists and belongs to user
        const existingPost = await database.get(
            'SELECT * FROM forum_posts WHERE id = ? AND user_id = ?',
            [postId, userId]
        );
        
        if (!existingPost) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Post non trouvé ou accès refusé'
            });
        }
        
        // Validation
        const validationErrors = validatePostInput({ 
            title: title || existingPost.title, 
            content: content || existingPost.content, 
            category: category || existingPost.category 
        });
        
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Données invalides',
                details: validationErrors
            });
        }
        
        // Update post
        await database.run(`
            UPDATE forum_posts 
            SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `, [
            title || existingPost.title,
            content || existingPost.content,
            category || existingPost.category,
            postId,
            userId
        ]);
        
        // Get updated post
        const updatedPost = await database.get(`
            SELECT 
                fp.*,
                u.nom,
                u.prenom,
                u.avatar_url
            FROM forum_posts fp
            JOIN users u ON fp.user_id = u.id
            WHERE fp.id = ?
        `, [postId]);
        
        res.status(200).json({
            success: true,
            message: 'Post mis à jour avec succès',
            data: {
                post: updatedPost
            }
        });
        
    } catch (error) {
        console.error('❌ Update post error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la mise à jour du post'
        });
    }
});

// @route   DELETE /api/forum/posts/:id
// @desc    Delete a forum post (only by author or admin)
// @access  Private
router.delete('/posts/:id', verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Check if post exists
        const existingPost = await database.get(
            'SELECT * FROM forum_posts WHERE id = ?',
            [postId]
        );
        
        if (!existingPost) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Post non trouvé'
            });
        }
        
        // Check permission (author or admin)
        if (existingPost.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Seul l\'auteur ou un administrateur peut supprimer ce post'
            });
        }
        
        // Delete post (will cascade delete comments)
        await database.run('DELETE FROM forum_posts WHERE id = ?', [postId]);
        
        res.status(200).json({
            success: true,
            message: 'Post supprimé avec succès'
        });
        
    } catch (error) {
        console.error('❌ Delete post error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la suppression du post'
        });
    }
});

// @route   POST /api/forum/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post('/posts/:id/comments', verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const { content, parent_comment_id } = req.body;
        
        // Validation
        const validationErrors = validateCommentInput({ content });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Données invalides',
                details: validationErrors
            });
        }
        
        // Check if post exists
        const post = await database.get('SELECT id FROM forum_posts WHERE id = ?', [postId]);
        if (!post) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Post non trouvé'
            });
        }
        
        // If replying to a comment, check if parent comment exists
        if (parent_comment_id) {
            const parentComment = await database.get(
                'SELECT id FROM forum_comments WHERE id = ? AND post_id = ?',
                [parent_comment_id, postId]
            );
            
            if (!parentComment) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Commentaire parent non trouvé'
                });
            }
        }
        
        // Create comment
        const result = await database.run(`
            INSERT INTO forum_comments (post_id, user_id, content, parent_comment_id)
            VALUES (?, ?, ?, ?)
        `, [postId, userId, content.trim(), parent_comment_id || null]);
        
        // Get created comment with author info
        const newComment = await database.get(`
            SELECT 
                fc.*,
                u.nom,
                u.prenom,
                u.avatar_url
            FROM forum_comments fc
            JOIN users u ON fc.user_id = u.id
            WHERE fc.id = ?
        `, [result.id]);
        
        res.status(201).json({
            success: true,
            message: parent_comment_id ? 'Réponse ajoutée avec succès' : 'Commentaire ajouté avec succès',
            data: {
                comment: newComment
            }
        });
        
    } catch (error) {
        console.error('❌ Create comment error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la création du commentaire'
        });
    }
});

// @route   PUT /api/forum/comments/:id
// @desc    Update a comment (only by author)
// @access  Private
router.put('/comments/:id', verifyToken, async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const { content } = req.body;
        
        // Check if comment exists and belongs to user
        const existingComment = await database.get(
            'SELECT * FROM forum_comments WHERE id = ? AND user_id = ?',
            [commentId, userId]
        );
        
        if (!existingComment) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Commentaire non trouvé ou accès refusé'
            });
        }
        
        // Validation
        const validationErrors = validateCommentInput({ content });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Données invalides',
                details: validationErrors
            });
        }
        
        // Update comment
        await database.run(`
            UPDATE forum_comments 
            SET content = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `, [content.trim(), commentId, userId]);
        
        // Get updated comment
        const updatedComment = await database.get(`
            SELECT 
                fc.*,
                u.nom,
                u.prenom,
                u.avatar_url
            FROM forum_comments fc
            JOIN users u ON fc.user_id = u.id
            WHERE fc.id = ?
        `, [commentId]);
        
        res.status(200).json({
            success: true,
            message: 'Commentaire mis à jour avec succès',
            data: {
                comment: updatedComment
            }
        });
        
    } catch (error) {
        console.error('❌ Update comment error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la mise à jour du commentaire'
        });
    }
});

// @route   DELETE /api/forum/comments/:id
// @desc    Delete a comment (only by author or admin)
// @access  Private
router.delete('/comments/:id', verifyToken, async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Check if comment exists
        const existingComment = await database.get(
            'SELECT * FROM forum_comments WHERE id = ?',
            [commentId]
        );
        
        if (!existingComment) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Commentaire non trouvé'
            });
        }
        
        // Check permission (author or admin)
        if (existingComment.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Seul l\'auteur ou un administrateur peut supprimer ce commentaire'
            });
        }
        
        // Delete comment (will cascade delete replies)
        await database.run('DELETE FROM forum_comments WHERE id = ?', [commentId]);
        
        res.status(200).json({
            success: true,
            message: 'Commentaire supprimé avec succès'
        });
        
    } catch (error) {
        console.error('❌ Delete comment error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la suppression du commentaire'
        });
    }
});

// @route   GET /api/forum/categories
// @desc    Get forum post categories with counts
// @access  Private
router.get('/categories', verifyToken, async (req, res) => {
    try {
        const categories = await database.all(`
            SELECT 
                category,
                COUNT(*) as posts_count,
                MAX(created_at) as last_post_at
            FROM forum_posts
            GROUP BY category
            ORDER BY category
        `);
        
        res.status(200).json({
            success: true,
            message: 'Catégories récupérées avec succès',
            data: {
                categories: categories
            }
        });
        
    } catch (error) {
        console.error('❌ Get categories error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération des catégories'
        });
    }
});

// @route   POST /api/forum/posts/:id/pin
// @desc    Pin/unpin a post (admin only)
// @access  Private + Admin
router.post('/posts/:id/pin', verifyToken, requireAdmin, async (req, res) => {
    try {
        const postId = req.params.id;
        
        // Get current pin status
        const post = await database.get('SELECT is_pinned FROM forum_posts WHERE id = ?', [postId]);
        
        if (!post) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Post non trouvé'
            });
        }
        
        const newPinStatus = !post.is_pinned;
        
        // Update pin status
        await database.run(
            'UPDATE forum_posts SET is_pinned = ? WHERE id = ?',
            [newPinStatus, postId]
        );
        
        res.status(200).json({
            success: true,
            message: newPinStatus ? 'Post épinglé avec succès' : 'Post désépinglé avec succès',
            data: {
                is_pinned: newPinStatus
            }
        });
        
    } catch (error) {
        console.error('❌ Pin post error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de l\'épinglage du post'
        });
    }
});

module.exports = router;