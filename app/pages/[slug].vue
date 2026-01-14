<script lang="ts" setup>
import { useArticles } from "~/composables/articles/useArticles";
import type { Article } from "~/composables/articles/useArticles";

const { getArticleBySlug } = useArticles();

const route = useRoute();
const slug =
  typeof route.params.slug == "object"
    ? route.params.slug[0]
    : route.params.slug;
const res = await getArticleBySlug(slug ? slug : "");
</script>

<template>
  <main class="min-h-dvh bg-gray-50">
    <section class="md:min-h-72 bg-linear-170 from-[#00B8DB] to-cf-blue w-full">
      <div
        class="container mx-auto max-w-7xl py-10 md:py-24 flex flex-col px-5 2xl:px-0"
      >
        <div
          class="flex items-center gap-2 text-white bg-white/20 w-fit px-4 rounded-full py-2"
        >
          <Icon name="mynaui:check-waves-solid" size="1.5rem" />
          <div class="text-sm md:text-base">
            Verified by
            <span class="font-semibold">Victoria Schade, CPDT-KA.</span>
          </div>
        </div>
        <p
          class="mt-6 text-2xl md:text-5xl text-white font-serif font-semibold max-w-155 tracking-wide md:leading-16"
        >
          {{ res.data.title }}
        </p>
        <span class="text-white/60 mt-4"
          >Updated at {{ formatDate(res.data.updated_at, "ddMMyyyy") }}</span
        >
      </div>
    </section>
    <section class="w-full">
      <div
        class="container mx-auto max-w-7xl py-10 md:py-24 flex flex-col px-5 2xl:px-0"
      >
        <div
          class="prose max-w-3xl prose-slate prose-headings:font-serif prose-h1:text-2xl prose-h1:md:text-4xl prose-h2:text-3xl"
          v-html="res.data.content"
        ></div>
      </div>
    </section>
  </main>
</template>
