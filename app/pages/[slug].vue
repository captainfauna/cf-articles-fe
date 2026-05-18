<script lang="ts" setup>
import { useArticles } from "~/composables/articles/useArticles";
import type { Article } from "~/composables/articles/useArticles";
import { useProducts } from "~/composables/products/useProducts";
import type { Product } from "~/composables/products/useProducts";
import { parseHTML } from "linkedom";
import { formatCurrency } from "~/utils/helpers";

const config = useRuntimeConfig();
const { getArticleBySlug, formatArticleImage } = useArticles();
const { getProductBySlug, formatProductImage } = useProducts();

const processContent = async (html: string) => {
  const { document } = parseHTML(html);

  const paragraphs = Array.from(document.querySelectorAll("p"));

  for (const p of paragraphs) {
    const links = Array.from(p.querySelectorAll('a[href*="captainfauna.co.id"]'));
    if (links.length === 0) continue;

    let insertAfterEl: Element = p;
    let cardsInserted = 0;

    for (const link of links) {
      const slug = extractSlug(link.getAttribute("href")!);
      if (!slug) continue;

      try {
        const product = await (await getProductBySlug(slug)).data;
        if (!product) continue;

        const price = formatCurrency(Number(product.variations[0]?.price || 0));

        const card = document.createElement("div");
        card.innerHTML = `
          <a href="https://captainfauna.co.id/products/${slug}" target="blank" class="flex my-6 rounded-xl border-4 border-gray-100 bg-white overflow-hidden gap-4 no-underline">
            <div class="overflow-hidden w-full max-w-1/4 md:aspect-square">
              <img src="${formatProductImage(product.image)}" class="w-full h-full object-cover" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm text-gray-500 mt-4">
                Mentioned in this article
              </span>
              <span class="font-semibold mt-3">${product.name}</span>
              <span class="text-sm text-gray-600 mt-1">Rp${price}</span>
              <span class="text-sm text-indigo-500 mt-1 underline mt-4">Shop on Captain Fauna</span>
            </div>
          </a>
        `;

        insertAfterEl.after(card);
        insertAfterEl = card;
        cardsInserted++;
      } catch {
        // ignore fetch error
      }
    }

    // If paragraph only contained product links (raw slugs as text), remove it
    if (cardsInserted > 0) {
      const pClone = p.cloneNode(true) as Element;
      Array.from(pClone.querySelectorAll("a")).forEach(a => a.remove());
      if (!pClone.textContent?.trim()) {
        p.remove();
      }
    }
  }

  return document.toString();
};

const route = useRoute();
const slug =
  typeof route.params.slug == "object"
    ? route.params.slug[0]
    : route.params.slug;
const res = await getArticleBySlug(slug ? slug : "");
const article = res.data;

const processedContent = ref<string>("");
processedContent.value = await processContent(article.content);

function extractSlug(url: string) {
  try {
    const u = new URL(url);
    // URL is like https://captainfauna.co.id/products/kaizoo-slug
    // Extract only the last path segment (the actual product slug)
    const segments = u.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || null;
  } catch {
    return null;
  }
}

// --- SEO ---
const siteUrl = "https://article.captainfauna.co.id";
const canonicalUrl = `${siteUrl}/${article.slug}`;
const imageUrl = article.featured_image
  ? formatArticleImage(article.featured_image)
  : `${siteUrl}/img/og-default.jpg`;

const metaTitle = `${article.title} | Captain Fauna`;
const metaDescription = article.excerpt || `Baca artikel ${article.title} di Captain Fauna — tips perawatan hewan peliharaan terpercaya.`;

useSeoMeta({
  title: metaTitle,
  description: metaDescription,
  ogTitle: metaTitle,
  ogDescription: metaDescription,
  ogImage: imageUrl,
  ogUrl: canonicalUrl,
  ogType: "article",
  ogSiteName: "Captain Fauna",
  twitterCard: "summary_large_image",
  twitterTitle: metaTitle,
  twitterDescription: metaDescription,
  twitterImage: imageUrl,
  robots: "index, follow",
});

const jsonLd: Record<string, any> = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: metaDescription,
  image: imageUrl,
  url: canonicalUrl,
  datePublished: article.published_at || article.created_at,
  dateModified: article.updated_at,
  author: {
    "@type": "Person",
    name: article.author_name,
  },
  publisher: {
    "@type": "Organization",
    name: "Captain Fauna",
    url: "https://captainfauna.co.id",
    logo: {
      "@type": "ImageObject",
      url: "https://captainfauna.co.id/favicon.ico",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": canonicalUrl,
  },
};

if (article.is_verified && article.verified_by) {
  jsonLd["reviewedBy"] = {
    "@type": "Person",
    name: article.verified_by,
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Dokter Hewan (drh.)",
    },
  };
}

useHead({
  title: metaTitle,
  link: [{ rel: "canonical", href: canonicalUrl }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify(jsonLd),
    },
  ],
});
</script>

<template>
  <main class="min-h-dvh bg-gray-50">
    <section class="md:min-h-72 bg-linear-170 from-[#00B8DB] to-cf-blue w-full">
      <div
        class="container mx-auto max-w-7xl py-10 md:py-24 flex flex-col px-5 2xl:px-0"
      >
        <div
          v-if="article.verified_by"
          class="flex items-center gap-2 text-white bg-white/20 w-fit px-4 rounded-full py-2"
        >
          <Icon name="mynaui:check-waves-solid" size="1.5rem" />
          <div class="text-sm md:text-base">
            Verified by
            <span class="font-semibold">{{ article.verified_by }}</span>
          </div>
        </div>
        <p
          class="mt-6 text-2xl md:text-5xl text-white font-serif font-semibold max-w-155 tracking-wide md:leading-16"
        >
          {{ article.title }}
        </p>
        <span class="text-white/60 mt-4"
          >Updated at {{ formatDate(article.updated_at, "ddMMyyyy") }}</span
        >
      </div>
    </section>
    <section class="w-full">
      <div
        class="container mx-auto max-w-7xl py-10 md:py-24 flex flex-col px-5 2xl:px-0"
      >
        <div
          class="prose max-w-3xl prose-slate prose-headings:font-serif prose-h1:text-2xl prose-h1:md:text-4xl prose-h2:text-3xl"
          v-html="processedContent"
        ></div>
      </div>
    </section>
  </main>
</template>
