import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';

const docRoutes = new OpenAPIHono();

// --- Swagger UI ---
docRoutes.get(
  '/doc',
  swaggerUI({
    url: '/api/openapi.json',
  }),
);

export default docRoutes;
