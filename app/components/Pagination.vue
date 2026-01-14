<script setup lang="ts">
import type { ApiMeta } from "~/types/types";

const props = withDefaults(
  defineProps<{
    meta: ApiMeta;
    // how many pages to show around the current page
    siblingCount?: number;
    // show first/last buttons
    showEdges?: boolean;
    // disable interactions (e.g., while fetching)
    disabled?: boolean;
  }>(),
  {
    siblingCount: 1,
    showEdges: true,
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: "update:page", page: number): void;
  (e: "change", page: number): void;
}>();

const current = computed(() =>
  Math.max(1, Math.min(props.meta.page, props.meta.total_pages || 1))
);
const totalPages = computed(() => Math.max(1, props.meta.total_pages || 1));

const canPrev = computed(() => current.value > 1 && !props.disabled);
const canNext = computed(
  () => current.value < totalPages.value && !props.disabled
);

function go(page: number) {
  const next = Math.max(1, Math.min(page, totalPages.value));
  if (next === current.value) return;
  emit("update:page", next);
  emit("change", next);
}

type PageItem = number | "ellipsis";

const items = computed<PageItem[]>(() => {
  const total = totalPages.value;
  const page = current.value;
  const siblings = Math.max(0, props.siblingCount);

  const showEdges = props.showEdges;
  const firstPage = 1;
  const lastPage = total;

  // Small totals: show all
  const maxVisible = showEdges
    ? 2 + 1 + siblings * 2 + 2
    : 1 + siblings * 2 + 1; // rough bound
  if (total <= Math.max(7, maxVisible)) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);

  const result: PageItem[] = [];

  // Always include first if edges
  if (showEdges) result.push(firstPage);

  // Left ellipsis?
  if (left > 2) result.push("ellipsis");

  // Middle range
  for (let p = left; p <= right; p++) result.push(p);

  // Right ellipsis?
  if (right < total - 1) result.push("ellipsis");

  // Always include last if edges
  if (showEdges) result.push(lastPage);

  // If not showing edges, ensure current window is still sane
  if (!showEdges) {
    const start = Math.max(1, page - siblings);
    const end = Math.min(total, page + siblings);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  return result;
});

const fromItem = computed(() => {
  if (props.meta.total_items === 0) return 0;
  return (current.value - 1) * props.meta.page_size + 1;
});

const toItem = computed(() => {
  return Math.min(current.value * props.meta.page_size, props.meta.total_items);
});
</script>

<template>
  <nav class="flex items-center" aria-label="Pagination">
    <!-- Controls -->
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
        :disabled="!canPrev"
        @click="go(current - 1)"
        aria-label="Previous page"
      >
        Prev
      </button>

      <!-- Page buttons -->
      <div class="mx-1 flex items-center gap-1">
        <template v-for="(it, idx) in items" :key="`${it}-${idx}`">
          <span
            v-if="it === 'ellipsis'"
            class="px-2 py-2 text-sm text-zinc-500 dark:text-zinc-400"
            aria-hidden="true"
          >
            …
          </span>

          <button
            v-else
            type="button"
            class="min-w-10 inline-flex items-center justify-center rounded-md border px-1 py-1 text-sm font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-none cursor-pointer"
            :class="
              it === current
                ? 'border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200'
                : 'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900'
            "
            :disabled="disabled"
            :aria-current="it === current ? 'page' : undefined"
            :aria-label="`Go to page ${it}`"
            @click="go(it)"
          >
            {{ it }}
          </button>
        </template>
      </div>

      <button
        type="button"
        class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
        :disabled="!canNext"
        @click="go(current + 1)"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  </nav>
</template>
