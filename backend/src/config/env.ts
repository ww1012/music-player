import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  // 服务器配置
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/music-player',
  
  // JWT 配置
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS 配置
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // 前端 URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// 验证必要的环境变量
export function validateEnv(): void {
  const required = ['JWT_SECRET'];
  
  for (const key of required) {
    if (!process.env[key]) {
      console.warn(`警告: 环境变量 ${key} 未设置，使用默认值`);
    }
  }
}
