<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { Category } from "~/composables/articles/useCategories";
import { useArticleCategories } from "~/composables/articles/useCategories";

const searchKeyword = ref<string>("");

/** --- UI state --- */
const isMobileMenuOpen = ref(false);
const activeAnimalKey = ref<"cat" | "dog" | "other" | null>(null);

const isCategoryOpen = computed(() => activeAnimalKey.value !== null);

function toggleAnimal(key: "cat" | "dog" | "other") {
  activeAnimalKey.value = activeAnimalKey.value === key ? null : key;
}
function closeCategories() {
  activeAnimalKey.value = null;
}

/** --- Data fetch --- */
const categories = ref<Category[]>([]);
const isLoadingCategories = ref(false);

const { getCategories } = useArticleCategories();

async function loadCategories() {
  try {
    isLoadingCategories.value = true;
    const res = await getCategories();
    categories.value = res?.data ?? [];
  } finally {
    isLoadingCategories.value = false;
  }
}

// load once
onMounted(() => {
  void loadCategories();
});

/** --- Helpers: classify into cats/dogs/other --- */
function classifyAnimal(c: Category): "cat" | "dog" | "other" {
  const name = (c.animal?.name ?? "").toLowerCase();
  const realAnimalId = c.animal?.animal_id ?? c.animal_id;

  const isCat = name.includes("cat") || realAnimalId === 2;
  const isDog = name.includes("dog") || realAnimalId === 1;

  if (isCat) return "cat";
  if (isDog) return "dog";
  return "other";
}

/** --- Tabs: only show if there is category for it --- */
const animalTabs = computed(() => {
  const hasCats = categories.value.some((c) => classifyAnimal(c) === "cat");
  const hasDogs = categories.value.some((c) => classifyAnimal(c) === "dog");
  const hasOther = categories.value.some((c) => classifyAnimal(c) === "other");

  return [
    ...(hasCats ? [{ key: "cat" as const, label: "Cats" }] : []),
    ...(hasDogs ? [{ key: "dog" as const, label: "Dogs" }] : []),
    ...(hasOther ? [{ key: "other" as const, label: "Other Pets" }] : []),
  ];
});

/** --- Category tree --- */
type CategoryTree = {
  parents: Category[];
  childrenByParentId: Record<number, Category[]>;
};

const categoryTreeByKey = computed(() => {
  const result: Record<"cat" | "dog" | "other", CategoryTree> = {
    cat: { parents: [], childrenByParentId: {} },
    dog: { parents: [], childrenByParentId: {} },
    other: { parents: [], childrenByParentId: {} },
  };

  for (const c of categories.value) {
    const key = classifyAnimal(c);
    const tree = result[key];

    if (c.parent_id === null) {
      tree.parents.push(c);
    } else {
      (tree.childrenByParentId[c.parent_id] ||= []).push(c);
    }
  }

  // sort nicely
  for (const tree of Object.values(result)) {
    tree.parents.sort((a, b) => a.name.localeCompare(b.name));
    for (const children of Object.values(tree.childrenByParentId)) {
      children.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return result;
});

const activeCategoryTree = computed<CategoryTree>(() => {
  const key = activeAnimalKey.value ?? animalTabs.value[0]?.key ?? "cat";
  return categoryTreeByKey.value[key];
});

/** --- Close on ESC + outside click --- */
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    closeCategories();
    isMobileMenuOpen.value = false;
  }
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  // If click is inside header OR inside category panel → keep open
  if (
    target.closest("[data-header-root]") ||
    target.closest("[data-category-panel]")
  )
    return;

  closeCategories();
}

type OtherGroup = {
  animal_id: number;
  animal_name: string;
  tree: CategoryTree;
};

const otherGroups = computed<OtherGroup[]>(() => {
  const map = new Map<number, { animal_name: string; tree: CategoryTree }>();

  for (const c of categories.value) {
    if (classifyAnimal(c) !== "other") continue;

    // use embedded animal object as source of truth
    const realAnimalId = c.animal?.animal_id ?? c.animal_id;
    const incomingName = (c.animal?.name ?? "").trim();

    if (!map.has(realAnimalId)) {
      map.set(realAnimalId, {
        animal_name: incomingName || `Animal ${realAnimalId}`,
        tree: { parents: [], childrenByParentId: {} },
      });
    }

    const group = map.get(realAnimalId)!;

    if (incomingName && group.animal_name.startsWith("Animal ")) {
      group.animal_name = incomingName;
    }

    if (c.parent_id === null) {
      group.tree.parents.push(c);
    } else {
      (group.tree.childrenByParentId[c.parent_id] ||= []).push(c);
    }
  }

  // sort categories inside each animal
  for (const { tree } of map.values()) {
    tree.parents.sort((a, b) => a.name.localeCompare(b.name));
    for (const children of Object.values(tree.childrenByParentId)) {
      children.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return Array.from(map.entries())
    .map(([animal_id, v]) => ({
      animal_id,
      animal_name: v.animal_name,
      tree: v.tree,
    }))
    .sort((a, b) => a.animal_name.localeCompare(b.animal_name));
});

const createUrl = (slug: string, animal: string): string => {
  animal = animal.toLocaleLowerCase();

  if (animal == "cat" && slug == "cat-breeds") {
    return "/cat-breeds";
  } else if (animal == "cat") {
    return `/cat/${slug}`;
  }

  if (animal == "dog" && slug == "dog-breeds") {
    return "/dog-breeds";
  }

  return `/category/${slug}`;
};

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("click", onClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("click", onClickOutside);
});

const router = useRouter();
const searchArticles = () => {
  router.push(`/search/${searchKeyword.value}`);
};
</script>

<template>
  <header
    class="bg-white font-lato relative border-b border-black/10"
    data-header-root
  >
    <!-- TOP BAR -->
    <div class="container max-w-7xl mx-auto px-4 sm:px-5 2xl:px-0">
      <div class="flex items-center justify-between gap-3 sm:gap-12 py-4">
        <!-- Mobile hamburger -->
        <button
          class="lg:hidden inline-flex items-center justify-center rounded-xl border border-black/10 p-2 hover:bg-black/5"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          aria-label="Open menu"
        >
          <Icon
            :name="isMobileMenuOpen ? 'mynaui:x' : 'mynaui:menu'"
            size="1.25rem"
          />
        </button>

        <!-- Logo -->
        <NuxtLink to="/" class="shrink-0">
          <img
            src="@/assets/img/cf-header.jpg"
            height="40"
            width="101"
            class="h-8 sm:h-10 w-auto"
            alt="Captain Fauna"
          />
        </NuxtLink>

        <!-- Search -->
        <div class="relative w-full">
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cf-blue transition-colors inline-flex items-center"
            aria-label="Search"
            @click="searchArticles()"
          >
            <Icon name="mynaui:search" size="1.25rem" />
          </button>

          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Cari artikel tentang kucing, ..."
            class="w-full border border-black/20 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-[1.5px] focus:border-cf-blue text-sm sm:text-base"
            @keyup.enter="searchArticles()"
          />
        </div>

        <!-- CTA (desktop) -->
        <div class="flex whitespace-nowrap">
          <NuxtLink
            to="/"
            class="hidden lg:inline-flex py-2.5 px-6 border-2 text-white bg-linear-to-r from-[#00B8DB] to-[#155DFC] rounded-full font-medium hover:opacity-90 transition"
          >
            Contact us
          </NuxtLink>
        </div>
      </div>

      <!-- Desktop animal nav -->
      <div class="hidden lg:flex items-center gap-6 pb-4">
        <button
          v-for="a in animalTabs"
          :key="a.key"
          class="inline-flex items-center gap-2 cursor-pointer text-sm font-medium hover:text-cf-blue transition"
          @click.stop="toggleAnimal(a.key)"
          :aria-expanded="activeAnimalKey === a.key"
        >
          <span>{{ a.label }}</span>
          <Icon
            name="mynaui:chevron-down"
            class="transition-transform"
            :class="activeAnimalKey === a.key ? 'rotate-180' : ''"
          />
        </button>

        <span v-if="isLoadingCategories" class="text-xs text-gray-400 ml-2"
          >Loading...</span
        >
      </div>
    </div>

    <!-- MOBILE MENU -->
    <div
      v-if="isMobileMenuOpen"
      class="lg:hidden border-t border-black/10 bg-white"
    >
      <div class="container max-w-7xl mx-auto px-4 sm:px-5 py-3">
        <NuxtLink
          to="/daftar"
          class="block w-full text-center py-2.5 text-white bg-linear-to-r from-[#00B8DB] to-[#155DFC] rounded-xl font-medium"
          @click="isMobileMenuOpen = false"
        >
          Contact us
        </NuxtLink>

        <div class="grid grid-cols-2 gap-2 pt-3">
          <button
            v-for="a in animalTabs"
            :key="a.key"
            class="inline-flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
            @click.stop="toggleAnimal(a.key)"
          >
            <span class="truncate">{{ a.label }}</span>
            <Icon
              name="mynaui:chevron-down"
              class="transition-transform"
              :class="activeAnimalKey === a.key ? 'rotate-180' : ''"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- CATEGORY PANEL (Desktop dropdown) -->
    <div
      v-if="isCategoryOpen"
      class="hidden lg:block absolute left-0 right-0 z-30"
      style="top: 100%"
      data-category-panel
      @click.stop
    >
      <div class="container mx-auto max-w-7xl px-5 2xl:px-0 pt-3">
        <div class="bg-white rounded-2xl border border-black/10 p-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-black/30">Categories</p>
            <button
              class="text-sm text-gray-500 hover:text-gray-800"
              @click="closeCategories"
            >
              Close
            </button>
          </div>

          <div class="mt-4 grid grid-cols-6">
            <!-- OTHER PETS: show animal header first -->
            <template v-if="activeAnimalKey === 'other'">
              <div
                v-for="g in otherGroups"
                :key="g.animal_id"
                class="mb-8 last:mb-0"
              >
                <p class="text-sm font-semibold text-gray-900 mb-3">
                  {{ g.animal_name }}
                </p>

                <div class="grid grid-cols-1">
                  <div
                    v-for="parent in g.tree.parents"
                    :key="parent.category_id"
                    class="min-w-0"
                  >
                    <NuxtLink
                      :to="`/category/${parent.slug}`"
                      class="font-medium hover:text-cf-blue transition block truncate"
                      @click="closeCategories"
                    >
                      {{ parent.name }}
                    </NuxtLink>

                    <ul class="mt-2 space-y-1 text-sm text-gray-600">
                      <li
                        v-for="child in g.tree.childrenByParentId[
                          parent.category_id
                        ] || []"
                        :key="child.category_id"
                      >
                        <NuxtLink
                          :to="`/category/${child.slug}`"
                          class="hover:text-cf-blue transition block truncate"
                          @click="closeCategories"
                        >
                          {{ child.name }}
                        </NuxtLink>
                      </li>
                    </ul>
                  </div>

                  <div
                    v-if="g.tree.parents.length === 0"
                    class="col-span-3 text-sm text-gray-500"
                  >
                    No categories for {{ g.animal_name }}.
                  </div>
                </div>
              </div>

              <div
                v-if="otherGroups.length === 0"
                class="text-sm text-gray-500"
              >
                No categories available for Other Pets.
              </div>
            </template>

            <!-- CATS/DOGS: keep existing behavior -->
            <template v-else>
              <div
                v-for="parent in activeCategoryTree.parents"
                :key="parent.category_id"
                class="min-w-0"
              >
                <NuxtLink
                  :to="createUrl(parent.slug, parent.animal.name)"
                  class="font-medium hover:text-cf-blue transition block truncate"
                  @click="closeCategories"
                >
                  {{ parent.name }}
                </NuxtLink>

                <ul class="mt-2 space-y-1 text-sm text-gray-600">
                  <li
                    v-for="child in activeCategoryTree.childrenByParentId[
                      parent.category_id
                    ] || []"
                    :key="child.category_id"
                  >
                    <NuxtLink
                      :to="createUrl(child.slug, child.animal.name)"
                      class="hover:text-cf-blue transition block truncate"
                      @click="closeCategories"
                    >
                      {{ child.name }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <div
                v-if="activeCategoryTree.parents.length === 0"
                class="col-span-3 text-sm text-gray-500"
              >
                No categories available.
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- CATEGORY PANEL (Mobile bottom sheet) -->
    <div v-if="isCategoryOpen" class="lg:hidden fixed inset-0 z-40">
      <div class="absolute inset-0 bg-black/40" @click="closeCategories" />

      <div
        class="absolute inset-x-0 bottom-0 bg-white rounded-t-xl shadow-xl border-t border-black/10"
        @click.stop
      >
        <div class="px-4 py-3 flex items-center justify-between">
          <p class="font-semibold text-sm">Categories</p>
          <button
            class="text-sm text-gray-500 hover:text-gray-800"
            @click="closeCategories"
          >
            Close
          </button>
        </div>

        <div class="px-4 pb-5 max-h-[65vh] overflow-auto">
          <div class="space-y-6">
            <!-- OTHER PETS -->
            <template v-if="activeAnimalKey === 'other'">
              <div
                v-for="g in otherGroups"
                :key="g.animal_id"
                class="border-b border-black/5 pb-5 last:border-b-0"
              >
                <p class="text-sm font-semibold text-gray-900 mb-3">
                  {{ g.animal_name }}
                </p>

                <div class="space-y-4">
                  <div
                    v-for="parent in g.tree.parents"
                    :key="parent.category_id"
                    class="border-b border-black/5 pb-3 last:border-b-0"
                  >
                    <NuxtLink
                      :to="`/category/${parent.slug}`"
                      class="font-medium block"
                      @click="closeCategories"
                    >
                      {{ parent.name }}
                    </NuxtLink>

                    <div class="mt-2 flex flex-wrap gap-2">
                      <NuxtLink
                        v-for="child in g.tree.childrenByParentId[
                          parent.category_id
                        ] || []"
                        :key="child.category_id"
                        :to="`/category/${child.slug}`"
                        class="text-xs px-3 py-1 rounded-full border border-black/10 hover:border-cf-blue hover:text-cf-blue transition"
                        @click="closeCategories"
                      >
                        {{ child.name }}
                      </NuxtLink>
                    </div>
                  </div>

                  <div
                    v-if="g.tree.parents.length === 0"
                    class="text-sm text-gray-500"
                  >
                    No categories for {{ g.animal_name }}.
                  </div>
                </div>
              </div>

              <div
                v-if="otherGroups.length === 0"
                class="text-sm text-gray-500"
              >
                No categories available for Other Pets.
              </div>
            </template>

            <!-- CATS/DOGS -->
            <template v-else>
              <div
                v-for="parent in activeCategoryTree.parents"
                :key="parent.category_id"
                class="border-b border-black/5 pb-3"
              >
                <NuxtLink
                  :to="createUrl(parent.slug, parent.animal.name)"
                  class="font-medium block"
                  @click="closeCategories"
                >
                  {{ parent.name }}
                </NuxtLink>

                <div class="mt-2 flex flex-wrap gap-2">
                  <NuxtLink
                    v-for="child in activeCategoryTree.childrenByParentId[
                      parent.category_id
                    ] || []"
                    :key="child.category_id"
                    :to="createUrl(child.slug, child.animal.name)"
                    class="text-xs px-3 py-1 rounded-full border border-black/10 hover:border-cf-blue hover:text-cf-blue transition"
                    @click="closeCategories"
                  >
                    {{ child.name }}
                  </NuxtLink>
                </div>
              </div>

              <div
                v-if="activeCategoryTree.parents.length === 0"
                class="text-sm text-gray-500"
              >
                No categories available.
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
