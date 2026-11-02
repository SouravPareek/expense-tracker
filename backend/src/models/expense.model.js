import pool from "../config/db.js";

export async function createExpense(categoryId, amount, description, expense_date, payment_method, userId){
    const [result] = await pool.query(
        'INSERT INTO expenses (user_id, category_id, amount, description, expense_date, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, categoryId, amount, description, expense_date, payment_method]
    )

    return result.insertId
}

// export async function listExpense(userId) {
    
// }

// export async function updateExpense(){
    
// }

// export async function deleteExpense(expenseId, userId) {
//     const [result] = await pool.query(
//         'DELETE FROM expenses WHERE user_id = ? AND id = ?',
//         [userId, expenseId]
//     )

//     return result.affectedRows > 0
// }