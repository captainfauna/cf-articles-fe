<script lang="ts" setup>
import type { Article } from "~/composables/articles/useArticles";

const props = defineProps<{
  data: Article;
}>();
</script>

<template>
  <li :key="data.article_id" class="flex flex-col">
    <NuxtLink :to="`/${data.slug}`">
      <div class="rounded-lg overflow-hidden aspect-16/10">
        <img
          src="assets/img/articles1.jpg"
          :alt="data.title"
          class="h-full w-full object-cover"
        />
      </div>
      <div class="text-black/40 text-sm mt-4 flex gap-2 items-center">
        <span class="px-2 bg-green-500 rounded text-white">{{
          data.category.name
        }}</span>
        <span>{{ formatDate(data.updated_at, "ddMMyyyy") }}</span>
      </div>
      <h3 class="mt-2 text-lg line-clamp-3">{{ data.title }}</h3>
      <p class="text-sm text-black/40 line-clamp-2 mt-2">
        {{ data.excerpt }}
      </p>
    </NuxtLink>
  </li>
</template>
