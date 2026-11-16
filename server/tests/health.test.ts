import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../src/app';

describe('health endpoints', () => {
  it('reports liveness', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok' });
    expect(typeof response.body.uptime).toBe('number');
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('reports degraded readiness when MongoDB is not connected', async () => {
    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ status: 'degraded', db: 'disconnected' });
  });
});

describe('api conventions', () => {
  it('advertises the foundation API version', async () => {
    const response = await request(app).get('/api/v1');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      name: 'SMS',
      apiVersion: 'v1',
      status: 'foundation',
    });
  });

  it('returns the shared error envelope for unknown routes', async () => {
    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.error).toMatchObject({ code: 'NOT_FOUND' });
    expect(response.body.error.requestId).toBeTruthy();
  });
});
