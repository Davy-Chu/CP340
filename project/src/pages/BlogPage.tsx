import { images } from '@/data/products';

export function BlogPage() {
  return (
    <main className="blog-page page-width">
      <article className="blog-article">
        <header className="blog-article-header">
          <span className="article-tag">Our story</span>
          <h1>Welcome to WorkNest: Building a Better Workspace</h1>
          <p className="article-lead">
            WorkNest was created with one simple idea in mind: a better
            workspace can make everyday work and studying easier.
          </p>
        </header>

        <img
          className="blog-article-image"
          src={images.monitor_stand}
          alt="Journal, cup of coffee, and plant on an organized desk"
        />

        <div className="article-content">
          <p>
            Many students, remote workers, and young professionals spend hours
            each day working at a desk. That desk might be in a bedroom, dorm
            room, apartment, or small home office. Even though the space may be
            limited, it still plays an important role in how comfortable,
            organized, and focused we feel while working.
          </p>
          <p>
            The purpose of WorkNest is to provide simple and affordable products
            that help improve everyday workspaces without making them
            complicated or expensive.
          </p>

          <section>
            <h2>Why WorkNest Exists</h2>
            <p>
              A workspace can quickly become cluttered with cables, notebooks,
              chargers, pens, and other everyday items. Laptops may also sit too
              low, while limited desk space can make it difficult to keep
              everything organized.
            </p>
            <p>
              These may seem like small problems, but they can make a workspace
              less comfortable and harder to use.
            </p>
            <p>
              WorkNest focuses on products that solve these common problems in
              simple ways. The goal is not to fill a desk with unnecessary
              accessories. Instead, each product is meant to serve a clear
              purpose and contribute to a cleaner and more functional workspace.
            </p>
          </section>

          <section>
            <h2>Simple Products with a Purpose</h2>
            <p>
              The WorkNest product range includes items designed to improve
              organization, comfort, and productivity.
            </p>
            <p>
              For example, a laptop stand can raise a screen to a more
              comfortable height while creating additional space underneath it.
              Cable organizers can help keep cords from becoming tangled or
              falling behind a desk. Desk mats can create a cleaner working
              surface, while planners and organizers can help keep tasks and
              everyday items in order.
            </p>
            <p>
              Each product is intended to make small improvements that
              contribute to a better overall setup.
            </p>
          </section>

          <section>
            <h2>Designed for Everyday Workspaces</h2>
            <p>
              WorkNest is designed for people who may not have a large office or
              an expensive desk setup.
            </p>
            <p>
              A student working from a dorm room, a remote worker using a small
              apartment desk, or someone completing personal projects from home
              may all face similar challenges when it comes to organization and
              comfort.
            </p>
            <p>
              The purpose of the website is to make practical workspace products
              easy to find and understand while keeping the shopping experience
              simple and organized.
            </p>
          </section>

          <section>
            <h2>More Than Just Desk Accessories</h2>
            <p>
              WorkNest is not meant to be a collection of random desk products.
            </p>
            <p>
              The main idea behind the website is to help people build a
              workspace that works better for them. A cleaner desk, better
              organization, and a more comfortable setup can make it easier to
              focus on the work that matters.
            </p>
            <p>
              As WorkNest develops, this blog will also share simple ideas about
              workspace organization, productivity, comfort, and making the most
              of smaller work areas.
            </p>
            <p>
              The goal is simple: help people create a workspace that feels
              organized, comfortable, and ready for whatever they need to
              accomplish.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
