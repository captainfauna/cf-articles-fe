<script lang="ts" setup>
import type { ArticleParam, Article } from "~/composables/articles/useArticles";
import { useArticles } from "~/composables/articles/useArticles";
import type { ApiMeta } from "~/types/types";

const route = useRoute();
const keyword =
  typeof route.params.slug == "object"
    ? route.params.slug[0]
    : route.params.slug;

const { getArticles } = useArticles();
const articles = ref<Article[]>([]);
const articleMeta = ref<ApiMeta | null>(null);

const articleParam = ref<ArticleParam>({
  search: keyword,
  page: 1,
  page_size: 12,
});

const loadArticles = async () => {
  try {
    const res = await getArticles(articleParam.value);
    articles.value = res.data;
    articleMeta.value = res.meta;
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
  { immediate: true },
);
</script>

<template>
  <main class="min-h-[70dvh] bg-gray-50">
    <section class="w-full md:pt-12">
      <div
        class="bg-linear-170 from-[#00B8DB] to-cf-blue md:rounded-2xl container mx-auto max-w-7xl px-5 pt-8 pb-12 md:p-10 flex flex-col justify-center"
      >
        <p class="text-white flex gap-2">Search results of</p>
        <p
          class="mt-6 text-4xl md:text-5xl text-white font-serif font-semibold max-w-155 tracking-wide md:leading-16"
        >
          {{ keyword }}
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
