import type { Category } from "./useCategories"
import type { ApiMeta, PaginationParam } from "~/types/types"

export interface Article {
  article_id: number
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string
  category_id: number
  category: Category
  author_name: string
  product_slugs: string[]
  is_verified: boolean
  verified_by: string | null
  verified_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ResponseGetArticles<T> {
    data: T;
    meta: ApiMeta;
}

export interface ArticleParam extends PaginationParam {
    categoryId?: number;
    search?: string;
}

export function useArticles() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiArticleUrl

  const getArticles = async (param: ArticleParam | null ) => {
    if (param == null) {
        return await $fetch<ResponseGetArticles<Article[]>>(`${baseURL}/articles`, { method: 'GET' })
    }

    let params: string[] = []
    if(param.categoryId) {
        params.push(`category_id=${param.categoryId}`)
    }

    if(param.search) {
      params.push(`search=${param.search}`)
    }

    if(param.page >= 0) params.push(`page=${param.page}`)
    if(param.page_size > 0) params.push(`page_size=${param.page_size}`)

    let stringParams: string = params.join("&")
    return await $fetch<ResponseGetArticles<Article[]>>(`${baseURL}/articles?${stringParams}`, { method: 'GET' })
  }

   const getArticleById = async (id: number | string) => {
    return await $fetch<ResponseGetArticles<Article>>(`${baseURL}/articles/${id}`, { method: 'GET' })
  }

  const getArticleBySlug = async (slug: string) => {
    return await $fetch<ResponseGetArticles<Article>>(`${baseURL}/articles/content/${slug}`, { method: 'GET' })
  }
  
  const getListByCategory = async (slug: string) => {
    return await $fetch<ResponseGetArticles<Article[]>>(`${baseURL}/articles/list/${slug}`, { method: 'GET' })
  }

    const formatArticleImage = (path: string): string => {
        return `${config.public.imageBaseUrl}/${path}`
    }

  return { getArticles, getArticleById, getArticleBySlug, getListByCategory, formatArticleImage }
}
