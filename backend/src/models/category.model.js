import { SYSTEM_USER_ID } from "../config/constants.js";
import pool from "../config/db.js";

export async function getAllCategories(userId){
    const [rows] = await pool.query(
        'SELECT id, name, (user_id = ?) as is_custom FROM categories WHERE user_id = ? OR user_id = ? ORDER BY is_custom, name',
        [userId, userId, SYSTEM_USER_ID]
    )
    return rows
}

export async function createCategory(categoryName, userId){
    const [result] = await pool.query(
        'INSERT INTO categories (name, user_id) VALUES (?, ?)',
        [categoryName, userId]
    )
    return result.insertId
}

export async function deleteCategory(categoryId, userId) {
    const connection = await pool.getConnection();
    try{
        await connection.beginTransaction()

        const [owned] = await connection.query(
            'SELECT name FROM categories WHERE id = ? AND user_id = ?',
            [categoryId, userId]
        )

        if(owned.length === 0){
            await connection.rollback()
            return false
        }
        
        const [rows] = await connection.query(
            'SELECT id FROM categories WHERE name = ? AND user_id = ?',
            ["Uncategorized", SYSTEM_USER_ID]
        )

        const uncategorized_id = rows[0]?.id

        await connection.query(
            'UPDATE expenses SET category_id = ? WHERE category_id = ? AND user_id = ?', [uncategorized_id, categoryId, userId]
        )

        const [result] = await connection.query(
            'DELETE FROM categories WHERE id = ? AND user_id = ?', [categoryId, userId]
        )

        if(result.affectedRows === 0){
            await connection.rollback()
            return false
        }

        await connection.commit()
        return true
    }catch(err){
        await connection.rollback();
        throw err
    }finally{
        connection.release()
    }
}

export async function renameCategory(categoryId, categoryNewName, userId) {
    const [result] = await pool.query(
        'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
        [categoryNewName, categoryId, userId]
    )
    return result.affectedRows
}

export async function findVisibleCategoryByName(name, userId) {
    const [rows] = await pool.query(
        'SELECT id, name, user_id FROM categories WHERE name = ? AND user_id IN (?, ?)',
        [name, userId, SYSTEM_USER_ID]
    )
    return rows[0] || null
}