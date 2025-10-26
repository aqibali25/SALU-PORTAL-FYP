// hash.js
import bcrypt from "bcryptjs";

const plainPassword = "Admin123";  // ← your actual password
const hash = await bcrypt.hash(plainPassword, 10);
console.log("Hashed password:", hash);
