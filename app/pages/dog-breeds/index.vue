<script lang="ts" setup>
import type { Article } from "~/composables/articles/useArticles";
import { useArticles } from "~/composables/articles/useArticles";

const { getListByCategory } = useArticles();

const articles = ref<Article[]>([]);

try {
  const res = await getListByCategory("dog-breeds");
  articles.value = res.data;
} catch (err: any) {
  console.log(err);
}

const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);

const categoriesByLetter = computed<Record<string, Article[]>>(() => {
  const map: Record<string, Article[]> = {};

  alphabet.forEach((letter) => {
    map[letter] = [];
  });

  articles.value.forEach((x) => {
    const firstLetter = x.title.charAt(0).toUpperCase();
    if (map[firstLetter]) {
      map[firstLetter].push(x);
    }
  });

  return map;
});
</script>

<template>
  <main class="min-h-[70dvh] bg-gray-50">
    <section class="w-full md:py-12">
      <div
        class="bg-linear-170 from-[#00B8DB] to-cf-blue md:rounded-2xl container mx-auto max-w-7xl px-5 pt-8 pb-12 md:p-10 flex flex-col justify-center"
      >
        <p class="text-white flex gap-2">
          <NuxtLink to="/" class="underline">Home</NuxtLink>
          <span>/</span>
          <span>Dog Breeds</span>
        </p>
        <p
          class="mt-6 text-4xl md:text-5xl text-white font-serif font-semibold max-w-155 tracking-wide md:leading-16"
        >
          Dog Breeds
        </p>

        <ul class="flex gap-4 mt-4 flex-wrap">
          <li v-for="letter in alphabet">
            <NuxtLink
              :key="letter"
              :to="
                categoriesByLetter[letter]?.length ? `#${letter}` : undefined
              "
              class=""
              :class="
                categoriesByLetter[letter]?.length
                  ? 'text-white underline'
                  : 'text-gray-300 cursor-default'
              "
            >
              {{ letter }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <section class="container mx-auto max-w-7xl px-6 pb-12">
      <template v-for="letter in alphabet" :key="letter">
        <div
          v-if="categoriesByLetter[letter]?.length"
          :id="letter"
          class="py-8 md:first:pt-0 not-last:border-b border-gray-300"
        >
          <span class="text-4xl font-bold block mb-4 font-serif">
            {{ letter }}
          </span>

          <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2">
            <li v-for="x in categoriesByLetter[letter]" :key="x.category_id">
              <NuxtLink :to="`/${x.slug}`" class="hover:text-cf-blue underline">
                {{ x.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </template>
    </section>
  </main>
</template>
