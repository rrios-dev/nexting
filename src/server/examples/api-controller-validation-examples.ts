import { z } from 'zod';
import makeApiController from '../helpers/make-api-controller';
import { ServerError } from '../errors/server-error';

/**
 * Ejemplos completos de validación para makeApiController
 * Estos ejemplos muestran todas las combinaciones posibles de esquemas
 */

// 1. Sin validación - Para endpoints simples que no requieren input
export const healthCheckController = makeApiController(async ({ request }) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
});

// 2. Solo Body - Para POST/PUT requests con payload
export const createProductController = makeApiController(
  async ({ body }, { request }) => {
    const product = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      product,
    };
  },
  {
    bodySchema: z.object({
      name: z.string().min(1, 'Product name is required'),
      description: z.string().optional(),
      price: z.number().positive('Price must be positive'),
      category: z.enum(['electronics', 'clothing', 'books', 'home']),
      tags: z.array(z.string()).default([]),
    }),
  },
);

// 3. Solo Query - Para GET requests con filtros/paginación
export const listProductsController = makeApiController(
  async ({ query }, { request }) => {
    // Simular filtrado y paginación
    const products = [
      { id: '1', name: 'Laptop', category: 'electronics', price: 999 },
      { id: '2', name: 'T-shirt', category: 'clothing', price: 29 },
    ];

    const filtered = products.filter((p) => 
      (!query.category || p.category === query.category) &&
      (!query.minPrice || p.price >= query.minPrice) &&
      (!query.maxPrice || p.price <= query.maxPrice),
    );

    return {
      products: filtered.slice(query.offset, query.offset + query.limit),
      pagination: {
        total: filtered.length,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < filtered.length,
      },
    };
  },
  {
    querySchema: z.object({
      category: z.enum(['electronics', 'clothing', 'books', 'home']).optional(),
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      limit: z.coerce.number().min(1).max(100).default(20),
      offset: z.coerce.number().min(0).default(0),
      sortBy: z.enum(['name', 'price', 'created']).default('name'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    }),
  },
);

// 4. Solo Params - Para endpoints que solo necesitan parámetros de ruta
export const getProductController = makeApiController(
  async ({ params }, { request }) => {
    // Simular búsqueda de producto
    if (params.productId === 'not-found') {
      throw new ServerError({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
        status: 404,
        uiMessage: 'The requested product does not exist.',
      });
    }

    return {
      product: {
        id: params.productId,
        name: 'Sample Product',
        description: 'A sample product',
        price: 99.99,
        category: 'electronics',
      },
    };
  },
  {
    paramsSchema: z.object({
      productId: z.string().uuid('Invalid product ID format'),
    }),
  },
);

// 5. Body + Query - Para búsquedas avanzadas con filtros complejos
export const advancedSearchController = makeApiController(
  async ({ body, query }, { request }) => {
    const searchCriteria = {
      textSearch: body.query,
      filters: body.filters,
      sorting: {
        field: query.sortBy,
        order: query.sortOrder,
      },
      pagination: {
        limit: query.limit,
        offset: query.offset,
      },
    };

    return {
      results: [],
      criteria: searchCriteria,
      totalResults: 0,
      executionTime: Math.random() * 100,
    };
  },
  {
    bodySchema: z.object({
      query: z.string().min(1, 'Search query is required'),
      filters: z.object({
        categories: z.array(z.string()).optional(),
        priceRange: z.object({
          min: z.number().min(0).optional(),
          max: z.number().min(0).optional(),
        }).optional(),
        availability: z.boolean().optional(),
      }),
    }),
    querySchema: z.object({
      sortBy: z.enum(['relevance', 'price', 'name', 'date']).default('relevance'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      limit: z.coerce.number().min(1).max(50).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
  },
);

// 6. Body + Params - Para actualizar entidades específicas
export const updateProductController = makeApiController(
  async ({ body, params }, { request }) => {
    const updatedProduct = {
      id: params.productId,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully',
    };
  },
  {
    bodySchema: z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      category: z.enum(['electronics', 'clothing', 'books', 'home']).optional(),
      tags: z.array(z.string()).optional(),
    }),
    paramsSchema: z.object({
      productId: z.string().uuid(),
    }),
  },
);

// 7. Query + Params - Para obtener datos relacionados con filtros
export const getProductReviewsController = makeApiController(
  async ({ query, params }, { request }) => {
    const reviews = [
      { id: '1', rating: 5, comment: 'Great product!', createdAt: '2024-01-01' },
      { id: '2', rating: 4, comment: 'Good value', createdAt: '2024-01-02' },
    ].filter((review) => 
      (!query.minRating || review.rating >= query.minRating) &&
      (!query.maxRating || review.rating <= query.maxRating),
    );

    return {
      productId: params.productId,
      reviews: reviews.slice(query.offset, query.offset + query.limit),
      statistics: {
        averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
        totalReviews: reviews.length,
      },
    };
  },
  {
    querySchema: z.object({
      minRating: z.coerce.number().min(1).max(5).optional(),
      maxRating: z.coerce.number().min(1).max(5).optional(),
      limit: z.coerce.number().min(1).max(50).default(10),
      offset: z.coerce.number().min(0).default(0),
      sortBy: z.enum(['date', 'rating']).default('date'),
    }),
    paramsSchema: z.object({
      productId: z.string().uuid(),
    }),
  },
);

// 8. Body + Query + Params - Validación completa para operaciones complejas
export const bulkUpdateProductsController = makeApiController(
  async ({ body, query, params }, { request }) => {
    // Verificar permisos si dry-run no está activado
    if (!query.dryRun) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.includes('admin')) {
        throw new ServerError({
          message: 'Admin privileges required',
          code: 'INSUFFICIENT_PERMISSIONS',
          status: 403,
          uiMessage: 'You need admin permissions to perform bulk updates.',
        });
      }
    }

    const affectedProducts = body.productIds.filter((id) => 
      id.startsWith(params.categoryPrefix),
    );

    const result = {
      dryRun: query.dryRun,
      category: params.categoryPrefix,
      requestedUpdates: body.productIds.length,
      applicableUpdates: affectedProducts.length,
      changes: body.updates,
      batchId: crypto.randomUUID(),
      estimatedTime: affectedProducts.length * 0.1, // seconds
    };

    if (!query.dryRun) {
      // En una implementación real, aquí se ejecutarían las actualizaciones
      Object.assign(result, {
        status: 'completed',
        processedAt: new Date().toISOString(),
      });
    }

    return result;
  },
  {
    bodySchema: z.object({
      productIds: z.array(z.string().uuid()).min(1, 'At least one product ID required'),
      updates: z.object({
        price: z.number().positive().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        discount: z.number().min(0).max(100).optional(),
      }),
      reason: z.string().min(10, 'Reason must be at least 10 characters'),
    }),
    querySchema: z.object({
      dryRun: z.coerce.boolean().default(true),
      batchSize: z.coerce.number().min(1).max(1000).default(100),
      notifyUsers: z.coerce.boolean().default(false),
    }),
    paramsSchema: z.object({
      categoryPrefix: z.string().min(1, 'Category prefix required'),
    }),
  },
);

export default {
  healthCheckController,
  createProductController,
  listProductsController,
  getProductController,
  advancedSearchController,
  updateProductController,
  getProductReviewsController,
  bulkUpdateProductsController,
};