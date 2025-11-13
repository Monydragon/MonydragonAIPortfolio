import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string; // Markdown content
  excerpt?: string;
  author: mongoose.Types.ObjectId;
  published: boolean;
  featured: boolean;
  tags: string[];
  category: string;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      default: 'General',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      maxlength: [60, 'SEO title should not exceed 60 characters'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description should not exceed 160 characters'],
    },
    coverImage: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search and filtering
BlogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
BlogPostSchema.index({ published: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1, published: 1 });
BlogPostSchema.index({ tags: 1, published: 1 });

// Auto-set publishedAt when published becomes true
BlogPostSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Auto-generate excerpt from content if not provided
BlogPostSchema.pre('save', function (next) {
  if (!this.excerpt && this.content) {
    const plainText = this.content.replace(/[#*`_~\[\]()]/g, '').trim();
    this.excerpt = plainText.substring(0, 300) + (plainText.length > 300 ? '...' : '');
  }
  next();
});

const BlogPost: Model<IBlogPost> = mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPost;

