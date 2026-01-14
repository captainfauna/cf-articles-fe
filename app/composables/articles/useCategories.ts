export interface Animal {
  animal_id: number;
  name: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  animal_id: number;
  animal: Animal;
  created_at: string;
  updated_at: string;
}


export interface ResponseGetCategories<T> {
    data: T
}

export function useArticleCategories() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiArticleUrl

  const getCategories = async () => {
    return await $fetch<ResponseGetCategories<Category[]>>(`${baseURL}/categories?page=1&page_size=100`, { method: 'GET' })
  }

  const getChildrenCategories = async (slug: string) => {
    return await $fetch<ResponseGetCategories<Category[]>>(`${baseURL}/categories/children/${slug}`, { method: 'GET' })
  }

  const getBySlug = async (slug: string) => {
    return await $fetch<ResponseGetCategories<Category>>(`${baseURL}/categories/slug/${slug}`, { method: 'GET' })
  }


  return { getCategories, getChildrenCategories, getBySlug }
}
