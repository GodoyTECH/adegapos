import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AuthResponse, CancelSaleBody, CashMovement, CashSession, Category, CategorySales, CloseCashBody, CompositeItem, CreateCashMovementBody, CreateCategoryBody, CreateProductBody, CreateSaleBody, CreateStockMovementBody, CreateUserBody, DashboardSummary, ErrorResponse, GetDashboardSummaryParams, GetPaymentMethodsSummaryParams, GetProductsReportParams, GetSalesByCategoryParams, GetSalesByHourParams, GetSalesReportParams, GetTopProductsParams, HealthStatus, ListCategoriesParams, ListProductsParams, ListSalesParams, ListStockParams, LoginBody, LowStockItem, MessageResponse, OpenCashBody, PaymentMethodSummary, Product, ProductReport, Sale, SaleDetail, SalesByHour, SalesReport, StockEntry, StockMovement, TopProduct, UpdateCompositeItemsBody, UpdateUserBody, User } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Login with email and password
 */
export declare const getLoginUrl: () => string;
export declare const login: (loginBody: LoginBody, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginBody>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Login with email and password
 */
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
/**
 * @summary Logout current user
 */
export declare const getLogoutUrl: () => string;
export declare const logout: (options?: RequestInit) => Promise<MessageResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
 * @summary Logout current user
 */
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
/**
 * @summary Get current authenticated user
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current authenticated user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all categories
 */
export declare const getListCategoriesUrl: (params?: ListCategoriesParams) => string;
export declare const listCategories: (params?: ListCategoriesParams, options?: RequestInit) => Promise<Category[]>;
export declare const getListCategoriesQueryKey: (params?: ListCategoriesParams) => readonly ["/api/categories", ...ListCategoriesParams[]];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(params?: ListCategoriesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List all categories
 */
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(params?: ListCategoriesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new category
 */
export declare const getCreateCategoryUrl: () => string;
export declare const createCategory: (createCategoryBody: CreateCategoryBody, options?: RequestInit) => Promise<Category>;
export declare const getCreateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CreateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CreateCategoryBody>;
}, TContext>;
export type CreateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof createCategory>>>;
export type CreateCategoryMutationBody = BodyType<CreateCategoryBody>;
export type CreateCategoryMutationError = ErrorType<unknown>;
/**
 * @summary Create a new category
 */
export declare const useCreateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CreateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CreateCategoryBody>;
}, TContext>;
/**
 * @summary Get category by ID
 */
export declare const getGetCategoryUrl: (id: number) => string;
export declare const getCategory: (id: number, options?: RequestInit) => Promise<Category>;
export declare const getGetCategoryQueryKey: (id: number) => readonly [`/api/categories/${number}`];
export declare const getGetCategoryQueryOptions: <TData = Awaited<ReturnType<typeof getCategory>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCategoryQueryResult = NonNullable<Awaited<ReturnType<typeof getCategory>>>;
export type GetCategoryQueryError = ErrorType<unknown>;
/**
 * @summary Get category by ID
 */
export declare function useGetCategory<TData = Awaited<ReturnType<typeof getCategory>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a category
 */
export declare const getUpdateCategoryUrl: (id: number) => string;
export declare const updateCategory: (id: number, createCategoryBody: CreateCategoryBody, options?: RequestInit) => Promise<Category>;
export declare const getUpdateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<CreateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<CreateCategoryBody>;
}, TContext>;
export type UpdateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof updateCategory>>>;
export type UpdateCategoryMutationBody = BodyType<CreateCategoryBody>;
export type UpdateCategoryMutationError = ErrorType<unknown>;
/**
 * @summary Update a category
 */
export declare const useUpdateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<CreateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<CreateCategoryBody>;
}, TContext>;
/**
 * @summary Delete/inactivate a category
 */
export declare const getDeleteCategoryUrl: (id: number) => string;
export declare const deleteCategory: (id: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getDeleteCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export type DeleteCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCategory>>>;
export type DeleteCategoryMutationError = ErrorType<unknown>;
/**
 * @summary Delete/inactivate a category
 */
export declare const useDeleteCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List products with optional filters
 */
export declare const getListProductsUrl: (params?: ListProductsParams) => string;
export declare const listProducts: (params?: ListProductsParams, options?: RequestInit) => Promise<Product[]>;
export declare const getListProductsQueryKey: (params?: ListProductsParams) => readonly ["/api/products", ...ListProductsParams[]];
export declare const getListProductsQueryOptions: <TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(params?: ListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof listProducts>>>;
export type ListProductsQueryError = ErrorType<unknown>;
/**
 * @summary List products with optional filters
 */
export declare function useListProducts<TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(params?: ListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new product
 */
export declare const getCreateProductUrl: () => string;
export declare const createProduct: (createProductBody: CreateProductBody, options?: RequestInit) => Promise<Product>;
export declare const getCreateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<CreateProductBody>;
}, TContext>;
export type CreateProductMutationResult = NonNullable<Awaited<ReturnType<typeof createProduct>>>;
export type CreateProductMutationBody = BodyType<CreateProductBody>;
export type CreateProductMutationError = ErrorType<unknown>;
/**
 * @summary Create a new product
 */
export declare const useCreateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<CreateProductBody>;
}, TContext>;
/**
 * @summary Find product by barcode
 */
export declare const getGetProductByBarcodeUrl: (barcode: string) => string;
export declare const getProductByBarcode: (barcode: string, options?: RequestInit) => Promise<Product>;
export declare const getGetProductByBarcodeQueryKey: (barcode: string) => readonly [`/api/products/barcode/${string}`];
export declare const getGetProductByBarcodeQueryOptions: <TData = Awaited<ReturnType<typeof getProductByBarcode>>, TError = ErrorType<ErrorResponse>>(barcode: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProductByBarcode>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProductByBarcode>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductByBarcodeQueryResult = NonNullable<Awaited<ReturnType<typeof getProductByBarcode>>>;
export type GetProductByBarcodeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Find product by barcode
 */
export declare function useGetProductByBarcode<TData = Awaited<ReturnType<typeof getProductByBarcode>>, TError = ErrorType<ErrorResponse>>(barcode: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProductByBarcode>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get product by ID
 */
export declare const getGetProductUrl: (id: number) => string;
export declare const getProduct: (id: number, options?: RequestInit) => Promise<Product>;
export declare const getGetProductQueryKey: (id: number) => readonly [`/api/products/${number}`];
export declare const getGetProductQueryOptions: <TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductQueryResult = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type GetProductQueryError = ErrorType<unknown>;
/**
 * @summary Get product by ID
 */
export declare function useGetProduct<TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a product
 */
export declare const getUpdateProductUrl: (id: number) => string;
export declare const updateProduct: (id: number, createProductBody: CreateProductBody, options?: RequestInit) => Promise<Product>;
export declare const getUpdateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<CreateProductBody>;
}, TContext>;
export type UpdateProductMutationResult = NonNullable<Awaited<ReturnType<typeof updateProduct>>>;
export type UpdateProductMutationBody = BodyType<CreateProductBody>;
export type UpdateProductMutationError = ErrorType<unknown>;
/**
 * @summary Update a product
 */
export declare const useUpdateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<CreateProductBody>;
}, TContext>;
/**
 * @summary Inactivate a product
 */
export declare const getDeleteProductUrl: (id: number) => string;
export declare const deleteProduct: (id: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getDeleteProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
export type DeleteProductMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProduct>>>;
export type DeleteProductMutationError = ErrorType<unknown>;
/**
 * @summary Inactivate a product
 */
export declare const useDeleteProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get ingredients/items for a composite product
 */
export declare const getGetCompositeItemsUrl: (id: number) => string;
export declare const getCompositeItems: (id: number, options?: RequestInit) => Promise<CompositeItem[]>;
export declare const getGetCompositeItemsQueryKey: (id: number) => readonly [`/api/products/${number}/composite-items`];
export declare const getGetCompositeItemsQueryOptions: <TData = Awaited<ReturnType<typeof getCompositeItems>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCompositeItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCompositeItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCompositeItemsQueryResult = NonNullable<Awaited<ReturnType<typeof getCompositeItems>>>;
export type GetCompositeItemsQueryError = ErrorType<unknown>;
/**
 * @summary Get ingredients/items for a composite product
 */
export declare function useGetCompositeItems<TData = Awaited<ReturnType<typeof getCompositeItems>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCompositeItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Replace all ingredients for a composite product
 */
export declare const getUpdateCompositeItemsUrl: (id: number) => string;
export declare const updateCompositeItems: (id: number, updateCompositeItemsBody: UpdateCompositeItemsBody, options?: RequestInit) => Promise<CompositeItem[]>;
export declare const getUpdateCompositeItemsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCompositeItems>>, TError, {
        id: number;
        data: BodyType<UpdateCompositeItemsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCompositeItems>>, TError, {
    id: number;
    data: BodyType<UpdateCompositeItemsBody>;
}, TContext>;
export type UpdateCompositeItemsMutationResult = NonNullable<Awaited<ReturnType<typeof updateCompositeItems>>>;
export type UpdateCompositeItemsMutationBody = BodyType<UpdateCompositeItemsBody>;
export type UpdateCompositeItemsMutationError = ErrorType<unknown>;
/**
 * @summary Replace all ingredients for a composite product
 */
export declare const useUpdateCompositeItems: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCompositeItems>>, TError, {
        id: number;
        data: BodyType<UpdateCompositeItemsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCompositeItems>>, TError, {
    id: number;
    data: BodyType<UpdateCompositeItemsBody>;
}, TContext>;
/**
 * @summary Get stock movement history for a product
 */
export declare const getGetProductStockHistoryUrl: (id: number) => string;
export declare const getProductStockHistory: (id: number, options?: RequestInit) => Promise<StockMovement[]>;
export declare const getGetProductStockHistoryQueryKey: (id: number) => readonly [`/api/products/${number}/stock-history`];
export declare const getGetProductStockHistoryQueryOptions: <TData = Awaited<ReturnType<typeof getProductStockHistory>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProductStockHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProductStockHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductStockHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof getProductStockHistory>>>;
export type GetProductStockHistoryQueryError = ErrorType<unknown>;
/**
 * @summary Get stock movement history for a product
 */
export declare function useGetProductStockHistory<TData = Awaited<ReturnType<typeof getProductStockHistory>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProductStockHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List sales with optional filters
 */
export declare const getListSalesUrl: (params?: ListSalesParams) => string;
export declare const listSales: (params?: ListSalesParams, options?: RequestInit) => Promise<Sale[]>;
export declare const getListSalesQueryKey: (params?: ListSalesParams) => readonly ["/api/sales", ...ListSalesParams[]];
export declare const getListSalesQueryOptions: <TData = Awaited<ReturnType<typeof listSales>>, TError = ErrorType<unknown>>(params?: ListSalesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSales>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSales>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSalesQueryResult = NonNullable<Awaited<ReturnType<typeof listSales>>>;
export type ListSalesQueryError = ErrorType<unknown>;
/**
 * @summary List sales with optional filters
 */
export declare function useListSales<TData = Awaited<ReturnType<typeof listSales>>, TError = ErrorType<unknown>>(params?: ListSalesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSales>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new sale
 */
export declare const getCreateSaleUrl: () => string;
export declare const createSale: (createSaleBody: CreateSaleBody, options?: RequestInit) => Promise<Sale>;
export declare const getCreateSaleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSale>>, TError, {
        data: BodyType<CreateSaleBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSale>>, TError, {
    data: BodyType<CreateSaleBody>;
}, TContext>;
export type CreateSaleMutationResult = NonNullable<Awaited<ReturnType<typeof createSale>>>;
export type CreateSaleMutationBody = BodyType<CreateSaleBody>;
export type CreateSaleMutationError = ErrorType<unknown>;
/**
 * @summary Create a new sale
 */
export declare const useCreateSale: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSale>>, TError, {
        data: BodyType<CreateSaleBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSale>>, TError, {
    data: BodyType<CreateSaleBody>;
}, TContext>;
/**
 * @summary Get sale detail
 */
export declare const getGetSaleUrl: (id: number) => string;
export declare const getSale: (id: number, options?: RequestInit) => Promise<SaleDetail>;
export declare const getGetSaleQueryKey: (id: number) => readonly [`/api/sales/${number}`];
export declare const getGetSaleQueryOptions: <TData = Awaited<ReturnType<typeof getSale>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSale>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSale>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSaleQueryResult = NonNullable<Awaited<ReturnType<typeof getSale>>>;
export type GetSaleQueryError = ErrorType<unknown>;
/**
 * @summary Get sale detail
 */
export declare function useGetSale<TData = Awaited<ReturnType<typeof getSale>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSale>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Cancel a sale
 */
export declare const getCancelSaleUrl: (id: number) => string;
export declare const cancelSale: (id: number, cancelSaleBody: CancelSaleBody, options?: RequestInit) => Promise<Sale>;
export declare const getCancelSaleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cancelSale>>, TError, {
        id: number;
        data: BodyType<CancelSaleBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof cancelSale>>, TError, {
    id: number;
    data: BodyType<CancelSaleBody>;
}, TContext>;
export type CancelSaleMutationResult = NonNullable<Awaited<ReturnType<typeof cancelSale>>>;
export type CancelSaleMutationBody = BodyType<CancelSaleBody>;
export type CancelSaleMutationError = ErrorType<unknown>;
/**
 * @summary Cancel a sale
 */
export declare const useCancelSale: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cancelSale>>, TError, {
        id: number;
        data: BodyType<CancelSaleBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof cancelSale>>, TError, {
    id: number;
    data: BodyType<CancelSaleBody>;
}, TContext>;
/**
 * @summary List stock status for all products
 */
export declare const getListStockUrl: (params?: ListStockParams) => string;
export declare const listStock: (params?: ListStockParams, options?: RequestInit) => Promise<StockEntry[]>;
export declare const getListStockQueryKey: (params?: ListStockParams) => readonly ["/api/stock", ...ListStockParams[]];
export declare const getListStockQueryOptions: <TData = Awaited<ReturnType<typeof listStock>>, TError = ErrorType<unknown>>(params?: ListStockParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listStock>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listStock>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListStockQueryResult = NonNullable<Awaited<ReturnType<typeof listStock>>>;
export type ListStockQueryError = ErrorType<unknown>;
/**
 * @summary List stock status for all products
 */
export declare function useListStock<TData = Awaited<ReturnType<typeof listStock>>, TError = ErrorType<unknown>>(params?: ListStockParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listStock>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a manual stock movement
 */
export declare const getCreateStockMovementUrl: () => string;
export declare const createStockMovement: (createStockMovementBody: CreateStockMovementBody, options?: RequestInit) => Promise<StockMovement>;
export declare const getCreateStockMovementMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStockMovement>>, TError, {
        data: BodyType<CreateStockMovementBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createStockMovement>>, TError, {
    data: BodyType<CreateStockMovementBody>;
}, TContext>;
export type CreateStockMovementMutationResult = NonNullable<Awaited<ReturnType<typeof createStockMovement>>>;
export type CreateStockMovementMutationBody = BodyType<CreateStockMovementBody>;
export type CreateStockMovementMutationError = ErrorType<unknown>;
/**
 * @summary Create a manual stock movement
 */
export declare const useCreateStockMovement: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStockMovement>>, TError, {
        data: BodyType<CreateStockMovementBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createStockMovement>>, TError, {
    data: BodyType<CreateStockMovementBody>;
}, TContext>;
/**
 * @summary Get the current open cash session
 */
export declare const getGetCurrentCashSessionUrl: () => string;
export declare const getCurrentCashSession: (options?: RequestInit) => Promise<CashSession>;
export declare const getGetCurrentCashSessionQueryKey: () => readonly ["/api/cash/current"];
export declare const getGetCurrentCashSessionQueryOptions: <TData = Awaited<ReturnType<typeof getCurrentCashSession>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentCashSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCurrentCashSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCurrentCashSessionQueryResult = NonNullable<Awaited<ReturnType<typeof getCurrentCashSession>>>;
export type GetCurrentCashSessionQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get the current open cash session
 */
export declare function useGetCurrentCashSession<TData = Awaited<ReturnType<typeof getCurrentCashSession>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentCashSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Open a new cash session
 */
export declare const getOpenCashSessionUrl: () => string;
export declare const openCashSession: (openCashBody: OpenCashBody, options?: RequestInit) => Promise<CashSession>;
export declare const getOpenCashSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof openCashSession>>, TError, {
        data: BodyType<OpenCashBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof openCashSession>>, TError, {
    data: BodyType<OpenCashBody>;
}, TContext>;
export type OpenCashSessionMutationResult = NonNullable<Awaited<ReturnType<typeof openCashSession>>>;
export type OpenCashSessionMutationBody = BodyType<OpenCashBody>;
export type OpenCashSessionMutationError = ErrorType<unknown>;
/**
 * @summary Open a new cash session
 */
export declare const useOpenCashSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof openCashSession>>, TError, {
        data: BodyType<OpenCashBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof openCashSession>>, TError, {
    data: BodyType<OpenCashBody>;
}, TContext>;
/**
 * @summary Close a cash session
 */
export declare const getCloseCashSessionUrl: (id: number) => string;
export declare const closeCashSession: (id: number, closeCashBody: CloseCashBody, options?: RequestInit) => Promise<CashSession>;
export declare const getCloseCashSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof closeCashSession>>, TError, {
        id: number;
        data: BodyType<CloseCashBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof closeCashSession>>, TError, {
    id: number;
    data: BodyType<CloseCashBody>;
}, TContext>;
export type CloseCashSessionMutationResult = NonNullable<Awaited<ReturnType<typeof closeCashSession>>>;
export type CloseCashSessionMutationBody = BodyType<CloseCashBody>;
export type CloseCashSessionMutationError = ErrorType<unknown>;
/**
 * @summary Close a cash session
 */
export declare const useCloseCashSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof closeCashSession>>, TError, {
        id: number;
        data: BodyType<CloseCashBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof closeCashSession>>, TError, {
    id: number;
    data: BodyType<CloseCashBody>;
}, TContext>;
/**
 * @summary Create a cash movement (sangria or suprimento)
 */
export declare const getCreateCashMovementUrl: (id: number) => string;
export declare const createCashMovement: (id: number, createCashMovementBody: CreateCashMovementBody, options?: RequestInit) => Promise<CashMovement>;
export declare const getCreateCashMovementMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCashMovement>>, TError, {
        id: number;
        data: BodyType<CreateCashMovementBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCashMovement>>, TError, {
    id: number;
    data: BodyType<CreateCashMovementBody>;
}, TContext>;
export type CreateCashMovementMutationResult = NonNullable<Awaited<ReturnType<typeof createCashMovement>>>;
export type CreateCashMovementMutationBody = BodyType<CreateCashMovementBody>;
export type CreateCashMovementMutationError = ErrorType<unknown>;
/**
 * @summary Create a cash movement (sangria or suprimento)
 */
export declare const useCreateCashMovement: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCashMovement>>, TError, {
        id: number;
        data: BodyType<CreateCashMovementBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCashMovement>>, TError, {
    id: number;
    data: BodyType<CreateCashMovementBody>;
}, TContext>;
/**
 * @summary List all cash sessions
 */
export declare const getListCashSessionsUrl: () => string;
export declare const listCashSessions: (options?: RequestInit) => Promise<CashSession[]>;
export declare const getListCashSessionsQueryKey: () => readonly ["/api/cash/sessions"];
export declare const getListCashSessionsQueryOptions: <TData = Awaited<ReturnType<typeof listCashSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCashSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCashSessions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCashSessionsQueryResult = NonNullable<Awaited<ReturnType<typeof listCashSessions>>>;
export type ListCashSessionsQueryError = ErrorType<unknown>;
/**
 * @summary List all cash sessions
 */
export declare function useListCashSessions<TData = Awaited<ReturnType<typeof listCashSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCashSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get daily summary (revenue, sales count, avg ticket, profit)
 */
export declare const getGetDashboardSummaryUrl: (params?: GetDashboardSummaryParams) => string;
export declare const getDashboardSummary: (params?: GetDashboardSummaryParams, options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: (params?: GetDashboardSummaryParams) => readonly ["/api/dashboard/summary", ...GetDashboardSummaryParams[]];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(params?: GetDashboardSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get daily summary (revenue, sales count, avg ticket, profit)
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(params?: GetDashboardSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get sales grouped by hour for the day
 */
export declare const getGetSalesByHourUrl: (params?: GetSalesByHourParams) => string;
export declare const getSalesByHour: (params?: GetSalesByHourParams, options?: RequestInit) => Promise<SalesByHour[]>;
export declare const getGetSalesByHourQueryKey: (params?: GetSalesByHourParams) => readonly ["/api/dashboard/sales-by-hour", ...GetSalesByHourParams[]];
export declare const getGetSalesByHourQueryOptions: <TData = Awaited<ReturnType<typeof getSalesByHour>>, TError = ErrorType<unknown>>(params?: GetSalesByHourParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesByHour>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSalesByHour>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSalesByHourQueryResult = NonNullable<Awaited<ReturnType<typeof getSalesByHour>>>;
export type GetSalesByHourQueryError = ErrorType<unknown>;
/**
 * @summary Get sales grouped by hour for the day
 */
export declare function useGetSalesByHour<TData = Awaited<ReturnType<typeof getSalesByHour>>, TError = ErrorType<unknown>>(params?: GetSalesByHourParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesByHour>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get top selling products
 */
export declare const getGetTopProductsUrl: (params?: GetTopProductsParams) => string;
export declare const getTopProducts: (params?: GetTopProductsParams, options?: RequestInit) => Promise<TopProduct[]>;
export declare const getGetTopProductsQueryKey: (params?: GetTopProductsParams) => readonly ["/api/dashboard/top-products", ...GetTopProductsParams[]];
export declare const getGetTopProductsQueryOptions: <TData = Awaited<ReturnType<typeof getTopProducts>>, TError = ErrorType<unknown>>(params?: GetTopProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTopProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTopProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getTopProducts>>>;
export type GetTopProductsQueryError = ErrorType<unknown>;
/**
 * @summary Get top selling products
 */
export declare function useGetTopProducts<TData = Awaited<ReturnType<typeof getTopProducts>>, TError = ErrorType<unknown>>(params?: GetTopProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get sales breakdown by payment method
 */
export declare const getGetPaymentMethodsSummaryUrl: (params?: GetPaymentMethodsSummaryParams) => string;
export declare const getPaymentMethodsSummary: (params?: GetPaymentMethodsSummaryParams, options?: RequestInit) => Promise<PaymentMethodSummary[]>;
export declare const getGetPaymentMethodsSummaryQueryKey: (params?: GetPaymentMethodsSummaryParams) => readonly ["/api/dashboard/payment-methods", ...GetPaymentMethodsSummaryParams[]];
export declare const getGetPaymentMethodsSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getPaymentMethodsSummary>>, TError = ErrorType<unknown>>(params?: GetPaymentMethodsSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPaymentMethodsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPaymentMethodsSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPaymentMethodsSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getPaymentMethodsSummary>>>;
export type GetPaymentMethodsSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get sales breakdown by payment method
 */
export declare function useGetPaymentMethodsSummary<TData = Awaited<ReturnType<typeof getPaymentMethodsSummary>>, TError = ErrorType<unknown>>(params?: GetPaymentMethodsSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPaymentMethodsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get sales grouped by category
 */
export declare const getGetSalesByCategoryUrl: (params?: GetSalesByCategoryParams) => string;
export declare const getSalesByCategory: (params?: GetSalesByCategoryParams, options?: RequestInit) => Promise<CategorySales[]>;
export declare const getGetSalesByCategoryQueryKey: (params?: GetSalesByCategoryParams) => readonly ["/api/dashboard/sales-by-category", ...GetSalesByCategoryParams[]];
export declare const getGetSalesByCategoryQueryOptions: <TData = Awaited<ReturnType<typeof getSalesByCategory>>, TError = ErrorType<unknown>>(params?: GetSalesByCategoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesByCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSalesByCategory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSalesByCategoryQueryResult = NonNullable<Awaited<ReturnType<typeof getSalesByCategory>>>;
export type GetSalesByCategoryQueryError = ErrorType<unknown>;
/**
 * @summary Get sales grouped by category
 */
export declare function useGetSalesByCategory<TData = Awaited<ReturnType<typeof getSalesByCategory>>, TError = ErrorType<unknown>>(params?: GetSalesByCategoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesByCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get products with low or zero stock
 */
export declare const getGetLowStockSummaryUrl: () => string;
export declare const getLowStockSummary: (options?: RequestInit) => Promise<LowStockItem[]>;
export declare const getGetLowStockSummaryQueryKey: () => readonly ["/api/dashboard/low-stock"];
export declare const getGetLowStockSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getLowStockSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLowStockSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLowStockSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLowStockSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getLowStockSummary>>>;
export type GetLowStockSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get products with low or zero stock
 */
export declare function useGetLowStockSummary<TData = Awaited<ReturnType<typeof getLowStockSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLowStockSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all users
 */
export declare const getListUsersUrl: () => string;
export declare const listUsers: (options?: RequestInit) => Promise<User[]>;
export declare const getListUsersQueryKey: () => readonly ["/api/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new user
 */
export declare const getCreateUserUrl: () => string;
export declare const createUser: (createUserBody: CreateUserBody, options?: RequestInit) => Promise<User>;
export declare const getCreateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<CreateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<CreateUserBody>;
}, TContext>;
export type CreateUserMutationResult = NonNullable<Awaited<ReturnType<typeof createUser>>>;
export type CreateUserMutationBody = BodyType<CreateUserBody>;
export type CreateUserMutationError = ErrorType<unknown>;
/**
 * @summary Create a new user
 */
export declare const useCreateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<CreateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<CreateUserBody>;
}, TContext>;
/**
 * @summary Update a user
 */
export declare const getUpdateUserUrl: (id: number) => string;
export declare const updateUser: (id: number, updateUserBody: UpdateUserBody, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UpdateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UpdateUserBody>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UpdateUserBody>;
export type UpdateUserMutationError = ErrorType<unknown>;
/**
 * @summary Update a user
 */
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UpdateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UpdateUserBody>;
}, TContext>;
/**
 * @summary Disable a user
 */
export declare const getDisableUserUrl: (id: number) => string;
export declare const disableUser: (id: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getDisableUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof disableUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof disableUser>>, TError, {
    id: number;
}, TContext>;
export type DisableUserMutationResult = NonNullable<Awaited<ReturnType<typeof disableUser>>>;
export type DisableUserMutationError = ErrorType<unknown>;
/**
 * @summary Disable a user
 */
export declare const useDisableUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof disableUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof disableUser>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Sales report by period
 */
export declare const getGetSalesReportUrl: (params: GetSalesReportParams) => string;
export declare const getSalesReport: (params: GetSalesReportParams, options?: RequestInit) => Promise<SalesReport>;
export declare const getGetSalesReportQueryKey: (params?: GetSalesReportParams) => readonly ["/api/reports/sales", ...GetSalesReportParams[]];
export declare const getGetSalesReportQueryOptions: <TData = Awaited<ReturnType<typeof getSalesReport>>, TError = ErrorType<unknown>>(params: GetSalesReportParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSalesReport>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSalesReportQueryResult = NonNullable<Awaited<ReturnType<typeof getSalesReport>>>;
export type GetSalesReportQueryError = ErrorType<unknown>;
/**
 * @summary Sales report by period
 */
export declare function useGetSalesReport<TData = Awaited<ReturnType<typeof getSalesReport>>, TError = ErrorType<unknown>>(params: GetSalesReportParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Products performance report
 */
export declare const getGetProductsReportUrl: (params: GetProductsReportParams) => string;
export declare const getProductsReport: (params: GetProductsReportParams, options?: RequestInit) => Promise<ProductReport[]>;
export declare const getGetProductsReportQueryKey: (params?: GetProductsReportParams) => readonly ["/api/reports/products", ...GetProductsReportParams[]];
export declare const getGetProductsReportQueryOptions: <TData = Awaited<ReturnType<typeof getProductsReport>>, TError = ErrorType<unknown>>(params: GetProductsReportParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProductsReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProductsReport>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductsReportQueryResult = NonNullable<Awaited<ReturnType<typeof getProductsReport>>>;
export type GetProductsReportQueryError = ErrorType<unknown>;
/**
 * @summary Products performance report
 */
export declare function useGetProductsReport<TData = Awaited<ReturnType<typeof getProductsReport>>, TError = ErrorType<unknown>>(params: GetProductsReportParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProductsReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map