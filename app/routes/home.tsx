import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { templateList } from "~/templates/manifest";

export const meta: MetaFunction = () => {
  const title = "Print Template";
  const description =
    "Print onto envelopes, labels, and more — straight from your browser.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:card", content: "summary" },
  ];
};

export default function Home() {
  const categories = [...new Set(templateList.map((t) => t.category))];

  return (
    <main className="container">
      <header className="site-header">
        <h1 className="site-header__title">Print Template</h1>
        <p className="intro">
          Print onto envelopes, labels, and more — straight from your browser.
          Your addresses are saved only on this device.
        </p>
      </header>

      {categories.map((category) => (
        <section key={category} className="gallery">
          <h2 className="gallery__heading">{category}</h2>
          <div className="gallery__grid">
            {templateList
              .filter((t) => t.category === category)
              .map((t) => (
                <Link key={t.id} to={`/template/${t.id}`} className="card">
                  <h3 className="card__title">{t.name}</h3>
                  <p className="card__desc">{t.description}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
