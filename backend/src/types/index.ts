import { Request } from 'express';
import { Document } from 'mongoose';

// 用户接口
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 收藏接口
export interface IFavorite extends Document {
  userId: string;
  audioId: string;
  createdAt: Date;
}

// 歌词接口
export interface ILyric extends Document {
  audioId: string;
  lyrics: Array<{
    time: number;
    text: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
}

// 认证请求
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// API 响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 登录请求体
export interface LoginBody {
  email: string;
  password: string;
}

// 注册请求体
export interface RegisterBody {
  username: string;
  email: string;
  password: string;
}
