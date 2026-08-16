const db = require('../config/db');

// 1. CREATE CATEGORY (Admin Only)
async function createCategory(req, res) {
    try {
        const { name, description } = req.body || {};
        if (!name) {
            return res.status(400).json({ status: 'FAIL', message: 'Category name is required.' });
        }

        const existing = await db.query('SELECT id FROM categories WHERE name = $1', [name]);
        if (existing.rows && existing.rows.length > 0) {
            return res.status(400).json({ status: 'FAIL', message: 'Category name already exists.' });
        }

        const result = await db.query(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
            [name, description || '']
        );

        return res.status(201).json({
            status: 'SUCCESS',
            message: 'Category created successfully',
            data: { category: result.rows[0] }
        });
    } catch (error) {
        console.error('Create Category Error:', error);
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

// 2. GET ALL CATEGORIES (Public / Logged-in Users)
async function getAllCategories(req, res) {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
        return res.status(200).json({ status: 'SUCCESS', data: { categories: result.rows } });
    } catch (error) {
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

// 3. DELETE CATEGORY (Admin Only)
async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM categories WHERE id = $1', [id]);
        return res.status(200).json({ status: 'SUCCESS', message: 'Category deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

module.exports = {
    createCategory,
    getAllCategories,
    deleteCategory
};