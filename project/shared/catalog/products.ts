// Public product data only. Both applications load their own copy of this
// catalog; changing browser data cannot change the server's checkout prices.
export const CATALOG_CURRENCY = 'cad' as const;
export const MAX_QUANTITY = 99;

export const catalogProducts = [
  { id: 1, name: 'Lift Laptop Stand', priceInCents: 2399 },
  { id: 2, name: 'Nest Desk Organizer', priceInCents: 1199 },
  { id: 3, name: 'Halo Desk Lamp', priceInCents: 5499 },
  { id: 4, name: 'Rise Monitor Stand', priceInCents: 6999 },
  { id: 5, name: 'CableDock Organizer', priceInCents: 1099 },
  { id: 6, name: 'Quiet Ceramic Planter', priceInCents: 1399 },
] as const;

export type CatalogProduct = (typeof catalogProducts)[number];

export const productCatalog: ReadonlyMap<number, CatalogProduct> = new Map(
  catalogProducts.map((product) => [product.id, product]),
);
