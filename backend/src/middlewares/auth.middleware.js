import jwt from 'jsonwebtoken'

function identifyUser(req, res, next) {
    const token = req.cookies?.token

    if(!token){
        return res.status(401).json({
            message: "Token not provided, Unauthorized acess",
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded;
        next()
    }catch(err){
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
}

export default identifyUser