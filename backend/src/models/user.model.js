import pool from "../config/db.js";

export async function findByEmail(email) {
    const [rows] = await pool.query(
        "SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?",
        [email],
    );
    return rows[0] || null;
}

export async function findById(id) {
    const [rows] = await pool.query(
        "SELECT id, name, email, created_at FROM users WHERE id = ?",//created at to show something like member since october 2026 on frontend..
        [id]
    );
    return rows[0] || null;
}

export async function createUser(name, email, password_hash) {
    const [result] = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        [name, email, password_hash],
    );

    return result.insertId;
}