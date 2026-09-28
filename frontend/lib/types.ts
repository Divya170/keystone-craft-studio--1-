// Mirrors the NestJS entities / response shapes.

export interface SocialLink {
  label: string;
  url: string;
}

export interface Settings {
  id: number;
  businessName: string | null;
  city: string | null;
  address: string | null;
  hours: string | null;
  email: string | null;
  phone: string | null;
  studioSummary: string | null;
  story: string | null;
  philosophyQuote: string | null;
  philosophyText: string | null;
  mapImage: string | null;
  mapUrl: string | null;
  socialLinks: SocialLink[];
  heroLayout: 'split' | 'layered';
  updatedAt: string;
}

export type ContentType = 'hero_slide' | 'site_image' | 'gallery_image' | 'about_image' | 'faq_item' | 'team_member';

export interface ContentBlock {
  id: string;
  type: ContentType;
  fields: Record<string, any>;
  sortOrder: number;
  published: boolean;
}

export type SiteImages = Record<string, { image: string | null; alt: string }>;

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  pending: boolean;
  showOnHome: boolean;
}

export interface FaqResponse {
  items: FaqItem[];
  categories: string[];
  total: number;
  approved: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  imageAlt: string | null;
  published: boolean;
  sortOrder: number;
  productCount: number;
}

export type Availability = 'Available' | 'Made to order' | 'Sold';
export const AVAILABILITIES: Availability[] = ['Available', 'Made to order', 'Sold'];

export interface ProductImage {
  url: string;
  alt: string;
  label?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string | null;
  category: Pick<Category, 'id' | 'slug' | 'name'> | null;
  description: string | null;
  price: number | null;
  availability: Availability | null;
  materials: string | null;
  images: ProductImage[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
}

export interface ShopResponse {
  items: Product[];
  total: number;
  categories: { slug: string; name: string; count: number }[];
  allCount: number;
  availabilityOptions: Availability[];
  catalogueSize: number;
}

export interface ProductDetail {
  product: Product;
  related: Product[];
}

export type WorkshopStatus = 'Registration Open' | 'Coming Soon' | 'Registration Closed' | 'Date To Be Announced';
export const WORKSHOP_STATUSES: WorkshopStatus[] = ['Registration Open', 'Coming Soon', 'Registration Closed', 'Date To Be Announced'];

export interface Workshop {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  details: string | null;
  image: string | null;
  imageAlt: string | null;
  status: WorkshopStatus;
  startsAt: string | null;
  duration: string | null;
  price: number | null;
  capacity: number | null;
  materials: string | null;
  location: string | null;
  published: boolean;
  sortOrder: number;
  booked: number;
  spotsLeft: number | null;
  full: boolean;
  canRegister: boolean;
}

export type RegistrationStatus = 'new' | 'confirmed' | 'waitlisted' | 'cancelled';
export const REGISTRATION_STATUSES: RegistrationStatus[] = ['new', 'confirmed', 'waitlisted', 'cancelled'];

export interface Registration {
  id: string;
  reference: string;
  workshopId: string | null;
  workshopTitle: string;
  name: string;
  email: string;
  attendees: number;
  message: string | null;
  status: RegistrationStatus;
  adminNotes: string | null;
  createdAt: string;
}

export type InquiryType = 'product' | 'workshop' | 'general';
export type InquiryStatus = 'new' | 'responded' | 'archived';
export const INQUIRY_STATUSES: InquiryStatus[] = ['new', 'responded', 'archived'];

export interface Inquiry {
  id: string;
  reference: string;
  name: string;
  email: string;
  type: InquiryType;
  subject: string | null;
  message: string;
  status: InquiryStatus;
  adminNotes: string | null;
  createdAt: string;
}

export interface InquiryReceipt {
  success: true;
  reference: string;
  name: string;
  email: string;
}

export interface RegistrationReceipt extends InquiryReceipt {
  workshopTitle: string;
  attendees: number;
}

export type Tone = 'good' | 'warn' | 'off';

export interface Dashboard {
  metrics: { key: string; value: number; href: string }[];
  recentInquiries: Inquiry[];
  recentRegistrations: Registration[];
  checklist: { name: string; status: string; tone: Tone; href: string }[];
}
