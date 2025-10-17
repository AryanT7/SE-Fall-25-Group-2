// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface TokenPayload {
  sub: string;
  uid: number;
  role: 'USER' | 'OWNER' | 'STAFF' | 'ADMIN';
  exp: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'OWNER' | 'STAFF' | 'ADMIN';
  is_active: boolean;
  height_cm?: number;
  weight_kg?: number;
  sex?: string;
  dob?: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

// Cafe Types
export interface Cafe {
  id: number;
  name: string;
  address?: string;
  active: boolean;
}

export interface CafeCreateRequest {
  name: string;
  address?: string;
}

// Item Types
export interface MenuItem {
  id: number;
  cafe_id: number;
  name: string;
  description?: string;
  ingredients?: string;
  calories: number;
  price: number;
  quantity?: string;
  servings?: number;
  veg_flag: boolean;
  kind?: string;
  active: boolean;
}

export interface ItemCreateRequest {
  name: string;
  description?: string;
  ingredients?: string;
  calories: number;
  price: number;
  quantity?: string;
  servings?: number;
  veg_flag?: boolean;
  kind?: string;
}

// Cart Types
export interface CartItem {
  id: number;
  cart_id: number;
  item_id: number;
  quantity: number;
  assignee_user_id?: number;
}

export interface CartAddRequest {
  item_id: number;
  quantity?: number;
  assignee_email?: string;
}

export interface CartSummary {
  by_person: Record<string, Record<string, number>>;
  total_calories: number;
  total_price: number;
}

// Order Types
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'READY' | 'PICKED_UP' | 'CANCELLED' | 'REFUNDED';

export interface Order {
  id: number;
  cafe_id: number;
  status: OrderStatus;
  created_at: string;
  total_price: number;
  total_calories: number;
  can_cancel_until: string;
}

export interface PlaceOrderRequest {
  cafe_id: number;
}

// Goal Types
export interface CalorieGoal {
  id: number;
  period: string;
  target_calories: number;
  start_date: string;
}

export interface GoalSetRequest {
  period: string;
  target_calories: number;
  start_date: string;
}

export interface GoalRecommendationRequest {
  height_cm: number;
  weight_kg: number;
  sex?: string;
  age_years?: number;
  activity?: string;
}

// API Error Types
export interface ApiError {
  detail: string;
  status_code?: number;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request Options
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

