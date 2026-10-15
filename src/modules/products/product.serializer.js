
export function serializeProduct(product) {
  const category = product.categoryId;
  const store = product.storeId;

  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    sku: product.sku,
    priceMinor: product.priceMinor,
    currency: product.currency,
    stock: product.stock,
    imageUrl: product.imageUrl,
    status: product.status,

    categoryId:
      category?._id?.toString() ?? category?.toString(),

    categoryName: category?.name ?? null,

    storeId:
      store?._id?.toString() ?? store?.toString(),

    storeName: store?.name ?? null,

    createdAt: product.createdAt,
  };
}
