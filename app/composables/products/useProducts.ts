
export interface Product {
    product_id: number;
    name: string;
    slug: string;
    description: Record<string, string>;
    image: string;
    variations: ProductVariation[];
}

export interface ProductVariation {
    product_variation_id: number;
    product_id: number;
    sku: string;
    price: number;
    discount_price: number,
    stock: number;
    slug: string;
    image: string;
    weight: number;
    lenght: number;
    width: number;
    height: number;
    variation_details: Record<string, string>;
}

export interface ResponseGetProduct<T> {
    data: T;
}

export function useProducts() {

  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl

  const getProductBySlug = async (slug: string) => {
    return await $fetch<ResponseGetProduct<Product>>(`${baseURL}/products/${slug}`)
  }

  const formatProductImage = (path: string): string => {
        return `${config.public.imageBaseUrl}/${path}`
    }


  return { getProductBySlug, formatProductImage }
}