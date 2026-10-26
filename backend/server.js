import "dotenv/config"
import app from './src/app.js'
import pool from './src/config/db.js'


app.get('/health', async (req, res)=>{
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});