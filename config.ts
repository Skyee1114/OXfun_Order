import dotenv from 'dotenv';
dotenv.config();  

export const OXFUN_API_URL = "https://api.ox.fun";
export const OXFUN_API_KEY = process.env.OXFUN_API_KEY || '';
export const OXFUN_API_SECRET = process.env.OXFUN_API_SECRET || '';