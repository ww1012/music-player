import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('MongoDB 连接已关闭');
  } catch (error) {
    console.error('关闭 MongoDB 连接时出错:', error);
  }
}

// 连接事件监听
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 连接断开');
});

// 应用关闭时断开连接
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});
