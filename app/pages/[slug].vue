<script lang="ts" setup>
import { useArticles } from "~/composables/articles/useArticles";
import type { Article } from "~/composables/articles/useArticles";
import { useProducts } from "~/composables/products/useProducts";
import type { Product } from "~/composables/products/useProducts";
import { parseHTML } from "linkedom";
import { formatCurrency } from "~/utils/helpers";

const { getArticleBySlug } = useArticles();
const { getProductBySlug, formatProductImage } = useProducts();

const processContent = async (html: string) => {
  const { document } = parseHTML(html);

  const paragraphs = Array.from(document.querySelectorAll("p"));

  for (const p of paragraphs) {
    const link = p.querySelector('a[href*="captainfauna.co.id"]');
    if (!link) continue;

    const slug = extractSlug(link.getAttribute("href")!);
    if (!slug) continue;

    try {
      const product = await (await getProductBySlug(slug)).data;
      if (!product) continue;

      const price = formatCurrency(Number(product.variations[0]?.price || 0));

      const card = document.createElement("div");
      card.innerHTML = `
        <a href="https://captainfauna.co.id/${slug}" target="blank" class="flex my-6 rounded-xl border-4 border-gray-100 bg-white overflow-hidden gap-4 no-underline">
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

      p.after(card);
    } catch {
      // ignore fetch error
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

const processedContent = ref<string>("");
processedContent.value = await processContent(res.data.content);

function extractSlug(url: string) {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/|\/$/g, "");
  } catch {
    return null;
  }
}
</script>

<template>
  <main class="min-h-dvh bg-gray-50">
    <section class="md:min-h-72 bg-linear-170 from-[#00B8DB] to-cf-blue w-full">
      <div
        class="container mx-auto max-w-7xl py-10 md:py-24 flex flex-col px-5 2xl:px-0"
      >
        <div
          v-if="res.data.verified_by"
          class="flex items-center gap-2 text-white bg-white/20 w-fit px-4 rounded-full py-2"
        >
          <Icon name="mynaui:check-waves-solid" size="1.5rem" />
          <div class="text-sm md:text-base">
            Verified by
            <span class="font-semibold">{{ res.data.verified_by }}</span>
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
          v-html="processedContent"
        ></div>
      </div>
    </section>
  </main>
</template>
