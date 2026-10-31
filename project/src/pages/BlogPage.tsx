import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';
import type { BlogPost } from '@/data/blogPosts';
import { useSeo } from '@/utils/seo';

const orderedBlogPosts = [...blogPosts].sort((firstPost, secondPost) =>
  secondPost.publishedAt.localeCompare(firstPost.publishedAt),
);

export function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useSeo({
    title: selectedPost
      ? `${selectedPost.title} | WorkNest`
      : 'Workspace Organization & Productivity Blog | WorkNest',
    description: selectedPost
      ? selectedPost.excerpt
      : 'Read practical WorkNest guides about desk organization, workspace productivity, comfort, and creating a better home office.',
  });

  const openPost = (post: BlogPost) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const returnToFeed = () => {
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedPost) {
    return <BlogArticle post={selectedPost} onBack={returnToFeed} />;
  }

  return (
    <section className="blog-page page-width">
      <header className="blog-feed-header">
        <p className="eyebrow">The WorkNest Journal</p>
        <h1>Ideas for a better workspace.</h1>
        <p>
          Practical guides to desk organization, workspace productivity, and
          home office improvements for a more comfortable place to work.
        </p>
      </header>

      <section className="blog-feed" aria-label="WorkNest blog articles">
        {orderedBlogPosts.map((post, index) => (
          <article
            className={`blog-card${index === 0 ? ' blog-card-featured' : ''}`}
            key={post.slug}
          >
            <div className="blog-card-image">
              <img src={post.image} alt={post.imageAlt} />
            </div>
            <div className="blog-card-content">
              <div className="blog-card-meta">
                <span className="article-tag">{post.category}</span>
                <time dateTime={post.publishedAt}>{post.publishedLabel}</time>
              </div>
              <h2 className="blog-card-title">
                <button type="button" onClick={() => openPost(post)}>{post.title}</button>
              </h2>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <span className="blog-card-link" aria-hidden="true">
                Read article <ArrowRight size={15} aria-hidden="true" />
              </span>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

interface BlogArticleProps {
  post: BlogPost;
  onBack: () => void;
}

function BlogArticle({ post, onBack }: BlogArticleProps) {
  return (
    <section className="blog-page page-width">
      <article className="blog-article">
        <button className="blog-back-button" type="button" onClick={onBack}>
          <ArrowLeft size={15} aria-hidden="true" /> Back to all articles
        </button>

        <header className="blog-article-header">
          <div className="blog-article-meta">
            <span className="article-tag">{post.category}</span>
            <time dateTime={post.publishedAt}>{post.publishedLabel}</time>
          </div>
          <h1>{post.title}</h1>
          <p className="article-lead">{post.lead}</p>
        </header>

        <img
          className="blog-article-image"
          src={post.image}
          alt={post.imageAlt}
        />

        <div className="article-content">
          {post.introduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </section>
  );
}
