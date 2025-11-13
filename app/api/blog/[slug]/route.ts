import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";

// GET /api/blog/[slug] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await params;
    const session = await auth();
    const isAdmin = session?.user && (session.user as any).role === 'admin';

    const query: any = { slug };
    if (!isAdmin) {
      query.published = true;
    }

    const post = await BlogPost.findOne(query).populate('author', 'name email').lean();

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment views for published posts
    if (post.published && !isAdmin) {
      await BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[slug] - Update post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { slug } = await params;
    const body = await request.json();
    
    const post = await BlogPost.findOne({ slug });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (body.title !== undefined) post.title = body.title;
    if (body.content !== undefined) post.content = body.content;
    if (body.category !== undefined) post.category = body.category;
    if (body.tags !== undefined) post.tags = body.tags;
    if (body.published !== undefined) post.published = body.published;
    if (body.featured !== undefined) post.featured = body.featured;
    if (body.seoTitle !== undefined) post.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) post.seoDescription = body.seoDescription;
    if (body.coverImage !== undefined) post.coverImage = body.coverImage;
    if (body.order !== undefined) post.order = body.order;

    await post.save();
    await post.populate('author', 'name email');

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[slug] - Delete post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { slug } = await params;
    
    const post = await BlogPost.findOneAndDelete({ slug });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

