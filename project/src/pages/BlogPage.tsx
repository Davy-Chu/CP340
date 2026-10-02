import { ArrowRight, ChevronRight, Leaf } from 'lucide-react';
import { images } from '@/data/products';

const articles = [
  {
    title: 'Welcome to WorkNest: Why Your Workspace Matters',
    category: 'Our story',
  },
  {
    title: 'How to Build a Productive Workspace on a Budget',
    category: 'Workspace tips',
  },
  {
    title: 'Cable Management Tips for a Cleaner Desk',
    category: 'Organization',
  },
];

export function BlogPage() {
  return (
    <section className="blog-page page-width">
      <div className="blog-heading">
        <p className="eyebrow">The WorkNest Journal</p>
        <h1>
          Ideas for a calmer,
          <br />
          more productive workspace.
        </h1>
        <p>Small thoughts and practical inspiration for your everyday setup.</p>
      </div>

      <article className="featured-article">
        <img
          src={images.journal}
          alt="Journal, cup of coffee, and plant on a desk"
        />
        <div>
          <span className="article-tag">Productivity</span>
          <h2>5 Simple Ways to Create a More Focused Workspace</h2>
          <p>
            Small changes can make a big difference in how you feel and get
            things done.
          </p>
          <button className="text-button" type="button">
            Read more <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </article>

      <div className="article-list">
        {articles.map((article) => (
          <Article key={article.title} {...article} />
        ))}
      </div>
    </section>
  );
}

interface ArticleProps {
  title: string;
  category: string;
}

function Article({ title, category }: ArticleProps) {
  return (
    <article className="article-row">
      <div className="article-placeholder" aria-hidden="true">
        <Leaf size={22} />
      </div>
      <div>
        <span className="article-tag">{category}</span>
        <h3>{title}</h3>
        <button className="text-button" type="button">
          Read more <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
      <ChevronRight size={18} aria-hidden="true" />
    </article>
  );
}
