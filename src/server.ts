import "dotenv/config"
import app from "./app.js"

const PORT = Number(process.env.PORT) || 5000

const server = app.listen(PORT,()=>{
    console.log(`Backend is running on port ${PORT}`);
});