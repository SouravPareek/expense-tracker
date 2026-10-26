import express from 'express'
import pool from '../config/db.js'

const healthRouter = express.Router()


/**
 * @route GET /api/health
 * @desc to check whether backend is working or not?
 * @access developer
 */
healthRouter.get('/', async (req, res)=>{
    try{
        await pool.query('SELECT 1')

        return res.json({
            status: "ok",
            db: "connected"
        })
    }catch (e){
        console.error(e);
        return res.status(503).json({
            status: "error",
            error: "Database Unavailable"
        })
    }
})

export default healthRouter