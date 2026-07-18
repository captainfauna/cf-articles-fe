<script lang="ts" setup>
import type { ArticleParam, Article } from "~/composables/articles/useArticles";
import type { Category } from "~/composables/articles/useCategories";
import { useArticleCategories } from "~/composables/articles/useCategories";
import { useArticles } from "~/composables/articles/useArticles";

const route = useRoute();
const catSlug =
  typeof route.params.slug == "object"
    ? route.params.slug[0]
    : route.params.slug;

const { getBySlug } = useArticleCategories();
const category = ref<Category>();

try {
  const res = await getBySlug(catSlug || "");
  category.value = res.data;
} catch (err: any) {
  console.log(err);
}

const { getArticles } = useArticles();
const articles = ref<Article[]>([]);
const articleParam = ref<ArticleParam>({
  categoryId: category.value?.category_id,
  page: 1,
  page_size: 12,
});

const loadArticles = async () => {
  try {
    const res = await getArticles(articleParam.value);
    articles.value = res.data;
  } catch (err: any) {
    console.log(err);
  }
};

loadArticles();

watch(
  articleParam,
  async (p) => {
    loadArticles();
  },
  { immediate: true }
);

// --- SEO ---
const siteUrl = "https://article.captainfauna.co.id";
const canonicalUrl = `${siteUrl}/category/${catSlug}`;
const catName = category.value?.name ?? catSlug;
const animalName = category.value?.animal?.name ?? "Hewan";
const metaTitle = `${catName} — Artikel ${animalName} | Captain Fauna`;
const metaDescription = `Kumpulan artikel terpercaya tentang ${catName} untuk ${animalName} peliharaan Anda. Tips dan panduan dari dokter hewan Captain Fauna.`;

useSeoMeta({
  title: metaTitle,
  description: metaDescription,
  ogTitle: metaTitle,
  ogDescription: metaDescription,
  ogUrl: canonicalUrl,
  ogType: "website",
  ogSiteName: "Captain Fauna",
  twitterCard: "summary_large_image",
  twitterTitle: metaTitle,
  twitterDescription: metaDescription,
  robots: "index, follow",
});

useHead({
  title: metaTitle,
  link: [{ rel: "canonical", href: canonicalUrl }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Artikel",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: animalName,
            item: `${siteUrl}/category/${catSlug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: catName,
            item: canonicalUrl,
          },
        ],
      }),
    },
  ],
});
</script>

<template>
  <main class="min-h-[70dvh] bg-gray-50">
    <section class="w-full md:pt-12">
      <div
        class="bg-linear-170 from-[#00B8DB] to-cf-blue md:rounded-2xl container mx-auto max-w-7xl px-5 pt-8 pb-12 md:p-10 flex flex-col justify-center"
      >
        <p class="text-white flex gap-2">
          <NuxtLink to="/" class="underline">Home</NuxtLink>
          <span>/</span>
          <span>{{ category?.animal.name }}</span>
        </p>
        <p
          class="mt-6 text-4xl md:text-5xl text-white font-serif font-semibold max-w-155 tracking-wide md:leading-16"
        >
          {{ category?.name }} Articles
        </p>
      </div>
    </section>

    <section class="w-full">
      <div class="container mx-auto max-w-7xl py-10 px-5 2xl:px-0">
        <ul
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4"
        >
          <ArticleCard v-for="x in articles" :key="x.article_id" :data="x" />
        </ul>
      </div>
    </section>
  </main>
</template>
