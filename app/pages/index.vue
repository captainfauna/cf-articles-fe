<script lang="ts" setup>
import { useArticles } from "~/composables/articles/useArticles";
import type { Article, ArticleParam } from "~/composables/articles/useArticles";
import type { ApiMeta } from "~/types/types";

const { getArticles } = useArticles();

const articles = ref<Article[]>([]);
const articleMeta = ref<ApiMeta | null>(null);

const articleParam = ref<ArticleParam>({
  page: 1,
  page_size: 12,
});

const loadArticles = async () => {
  try {
    const res = await getArticles(articleParam.value);
    articles.value = res.data;
    articleMeta.value = res.meta;

    articleParam.value.page = res.meta.page;
    articleParam.value.page_size = res.meta.page_size;
  } catch (err) {
    console.error(err);
  }
};

watch(
  () => [articleParam.value.page, articleParam.value.page_size],
  () => {
    loadArticles();
  },
  { immediate: true },
);

const keyword = ref<string>("");
const router = useRouter();
const searchArticles = () => {
  router.push(`/search/${keyword.value}`);
};

// --- SEO ---
const siteUrl = "https://article.captainfauna.co.id";
const metaTitle = "Artikel Perawatan Hewan Peliharaan | Captain Fauna";
const metaDescription =
  "Temukan artikel terpercaya tentang perawatan kucing, anjing, dan hewan peliharaan lainnya. Ditulis dan diverifikasi oleh dokter hewan berpengalaman.";

useSeoMeta({
  title: metaTitle,
  description: metaDescription,
  ogTitle: metaTitle,
  ogDescription: metaDescription,
  ogImage: `${siteUrl}/img/og-default.jpg`,
  ogUrl: siteUrl,
  ogType: "website",
  ogSiteName: "Captain Fauna",
  twitterCard: "summary_large_image",
  twitterTitle: metaTitle,
  twitterDescription: metaDescription,
  twitterImage: `${siteUrl}/img/og-default.jpg`,
  robots: "index, follow",
});

useHead({
  title: metaTitle,
  link: [{ rel: "canonical", href: siteUrl }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Captain Fauna Artikel",
        url: siteUrl,
        description: metaDescription,
        publisher: {
          "@type": "Organization",
          name: "Captain Fauna",
          url: "https://captainfauna.co.id",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search/{search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }),
    },
  ],
});
</script>

<template>
  <main class="min-h-dvh bg-gray-50">
    <section
      class="md:min-h-150 bg-linear-170 from-[#00B8DB] to-cf-blue w-full"
    >
      <div
        class="container mx-auto max-w-7xl py-10 md:py-24 flex flex-col md:flex-row items-center gap-12 md:gap-32 px-5 2xl:px-0"
      >
        <div class="flex flex-col text-white w-full">
          <span
            class="flex items-center gap-2 text-white bg-white/20 w-fit px-4 rounded-full py-2"
            ><Icon name="mynaui:check-waves-solid" /> Verified articles by
            licensed vets</span
          >
          <h1 class="text-lg md:text-xl mt-6 md:mt-8">
            Get reliable, vet-approved advice for your beloved pets. From
            nutrition to behavior, we've got you covered.
          </h1>
          <div class="relative mt-8">
            <span
              class="absolute left-5 top-7 -translate-y-1/2 text-gray-400 hover:text-cf-blue transition-colors inline-flex items-center"
              aria-label="Search"
            >
              <Icon name="mynaui:search" size="1.25rem" />
            </span>
            <input
              v-model="keyword"
              type="text"
              placeholder="Search pet care topics..."
              class="w-full bg-white text-black py-4 pl-12 pr-10 rounded-full focus:outline-none"
              @keyup.enter="searchArticles()"
            />
            <button
              type="button"
              class="px-4 py-2 rounded-full cursor-pointer absolute right-2.5 top-7 -translate-y-1/2 text-white hover:opacity-90 transition-colors inline-flex items-center bg-linear-to-r from-[#00B8DB] to-[#155DFC]"
              @click="searchArticles()"
            >
              Search
            </button>

            <div class="flex flex-col md:flex-row mt-8 md:items-center gap-4">
              <span>Popular:</span>
              <div class="flex gap-2">
                <NuxtLink
                  class="bg-white/10 text-white px-4 rounded-full py-1 text-nowrap"
                  >Cat Diets</NuxtLink
                >
                <NuxtLink
                  class="bg-white/10 text-white px-4 rounded-full py-1 text-nowrap"
                  >Cat Breeds</NuxtLink
                >
                <NuxtLink
                  class="bg-white/10 text-white px-4 rounded-full py-1 text-nowrap"
                  >Dog Allergies</NuxtLink
                >
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl md:h-90 w-full hidden md:block">
          <img
            src="assets/img/banner.jpg"
            alt="cats"
            class="object-cover top md:h-90"
          />
        </div>
      </div>
    </section>

    <section class="w-full">
      <div class="container mx-auto max-w-7xl py-10 md:py-20 px-5 2xl:px-0">
        <h2 class="font-bold tracking-wide text-xl md:text-3xl font-bitter">
          Latest Articles
        </h2>

        <ul
          class="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4"
        >
          <ArticleCard v-for="x in articles" :key="x.article_id" :data="x" />
        </ul>

        <div class="flex items-center justify-center mt-16">
          <Pagination
            v-if="articleMeta"
            :meta="articleMeta"
            v-model:page="articleParam.page"
          />
        </div>
      </div>
    </section>
  </main>
</template>
