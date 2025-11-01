export interface User {
  id: number
  username: string
  email: string
  full_name: string
  first_name: string
  last_name: string
  profile_picture: string | null
  is_active: boolean
  is_verified: boolean
  is_staff: boolean
  current_semester: string | null
  date_joined: string
  posts_count: number
  materials_count: number
  news_count: number
  successful_donations_count: number
}

export interface UserDetail extends User {
  bio: string | null
  date_of_birth: string | null
  phone_number: string
  address: string
  city: string
  country: string
  postal_code: string
  latitude: number | null
  longitude: number | null
  is_superuser: boolean
  facebook_url: string | null
  twitter_url: string | null
  linkedin_url: string | null
  last_login: string | null
}

export interface News {
  id: number
  title: string
  slug: string
  summary: string
  content?: string
  author: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    profile_picture: string | null
  }
  category: {
    id: number
    name: string
    slug: string
    description: string
  } | null
  featured_image: string | null
  featured_image_url: string | null
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  views_count: number
  tags: string
  tags_list: string[]
  meta_description: string
  created_at: string
  updated_at: string
  published_at: string | null
  valid_from: string | null
  valid_until: string | null
  comments_count?: number
}

export interface NewsCategory {
  id: number
  name: string
  slug: string
  description: string
  created_at: string
  news_count: number
}

export interface UserStatistics {
  total_users: number
  verified_users: number
  active_users: number
  staff_users: number
  unverified_users: number
  inactive_users: number
}

export interface Admin {
  id: number
  username: string
  email: string
  full_name: string
  first_name: string
  last_name: string
  profile_picture: string | null
  is_active: boolean
  phone_number: string
  date_joined: string
  last_login: string | null
}

export interface AdminStatistics {
  total_admins: number
  active_admins: number
  inactive_admins: number
}
