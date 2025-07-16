import { app } from '../src/index';
import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';

const sqlite = new Database(':memory:');

describe('OpenAPI Specification Error Handling', () => {
  
  const getSpec = async () => {
    const testEnv = { VITEST_DB: sqlite };
    const req = new Request('http://localhost/api/openapi.json');
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(200);
    return res.json();
  };

  it('should have ErrorResponse schema in components.schemas', async () => {
    const json = await getSpec();
    const errorSchema = json.components.schemas.ErrorResponse;
    expect(errorSchema).toBeDefined();
    expect(errorSchema.type).toBe('object');
    expect(errorSchema.properties.statusCode).toBeDefined();
    expect(errorSchema.properties.error).toBeDefined();
    expect(errorSchema.properties.message).toBeDefined();
  });

  it('should have reusable error responses in components.responses', async () => {
    const json = await getSpec();
    const badRequest = json.components.responses.BadRequest;
    expect(badRequest).toBeDefined();
    expect(badRequest.description).toBe('Bad Request');
    expect(badRequest.content['application/json'].schema.$ref).toBe('#/components/schemas/ErrorResponse');
    
    const unauthorized = json.components.responses.Unauthorized;
    expect(unauthorized).toBeDefined();
    expect(unauthorized.description).toBe('Unauthorized');
    expect(unauthorized.content['application/json'].schema.$ref).toBe('#/components/schemas/ErrorResponse');
  });

  it('should have a specific example for the 401 Unauthorized response', async () => {
    const json = await getSpec();
    const unauthorized = json.components.responses.Unauthorized;
    const example = unauthorized.content['application/json'].example;
    
    expect(example).toBeDefined();
    expect(example.statusCode).toBe(401);
    expect(example.error).toBe('Unauthorized');
  });

  it('should use $ref for error responses in /api/auth/register', async () => {
    const json = await getSpec();
    const responses = json.paths['/api/auth/register'].post.responses;
    
    expect(responses['400'].$ref).toBe('#/components/responses/BadRequest');
    expect(responses['409'].$ref).toBe('#/components/responses/Conflict');
  });

  it('should use $ref for error responses in /api/admin', async () => {
    const json = await getSpec();
    const responses = json.paths['/api/admin'].get.responses;

    expect(responses['401'].$ref).toBe('#/components/responses/Unauthorized');
    expect(responses['403'].$ref).toBe('#/components/responses/Forbidden');
  });
});
