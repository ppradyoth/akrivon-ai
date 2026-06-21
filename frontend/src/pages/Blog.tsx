import { Link } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";

const postFiles = import.meta.glob("../blog/posts/*.md", { as: "raw", eager: true });

type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
};

function extractMeta(markdown: string) {
  const match = markdown.match(/---([\s\S]*?)---/);
  if (!match) return {};
  const meta: Record<string, string> = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) meta[key.trim()] = rest.join(":").trim().replace(/"/g, "");
  });
  return meta;
}

function getAllPosts(): Post[] {
  return Object.entries(postFiles)
    .map(([path, content]) => {
      const slug = path.split("/").pop()?.replace(/\.md$/, "") ?? "";
      const meta = extractMeta(content as string);
      return {
        slug,
        title: meta.title || slug,
        date: meta.date || "",
        excerpt: meta.excerpt || "",
        content: content as string,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function readingTime(text: string) {
  return `${Math.ceil(text.trim().split(/\s+/).length / 200)} min read`;
}

export default function Blog() {
  const posts = getAllPosts();

  return (
    <>
      <SEO
        title="Blog"
        description="Perspectives on AI security, prompt injection, agent hijacking, and how AI systems break in production."
        path="/blog"
      />
      <Section
        eyebrow="Blog"
        title="Thinking on AI safety and behavior"
        description="Perspectives on how AI systems break, drift, and how to keep them in bounds."
      />

      <section className="section">
        <div className="blog-list">
          {posts.map((post) => (
            <article key={post.slug} className="blog-card">
              <Link to={`/blog/${post.slug}`} className="blog-card-link">
                <h2 className="blog-card-title">{post.title}</h2>
              </Link>
              <p className="blog-card-meta">
                {post.date} &bull; {readingTime(post.content)}
              </p>
              {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
              <Link to={`/blog/${post.slug}`} className="blog-read-more">
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
