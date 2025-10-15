import { Router, Request, Response } from 'express';
import { DatabaseService } from '../database/schema';
import { HealthCheck, ApiResponse } from '../types';

const router = Router();
const dbService = DatabaseService.getInstance();

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthCheck:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, unhealthy]
 *           description: Overall health status
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Health check timestamp
 *         uptime:
 *           type: number
 *           description: Server uptime in seconds
 *         version:
 *           type: string
 *           description: Application version
 *         database:
 *           type: string
 *           enum: [connected, disconnected]
 *           description: Database connection status
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the AI assistant module
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Service unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    let databaseStatus: 'connected' | 'disconnected' = 'connected';
    try {
      // Simple query to test database connectivity
      const stats = dbService.getStats();
      if (typeof stats.totalInteractions !== 'number') {
        throw new Error('Invalid database response');
      }
    } catch (error) {
      console.error('Database health check failed:', error);
      databaseStatus = 'disconnected';
    }

    const healthCheck: HealthCheck = {
      status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      database: databaseStatus
    };

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      success: healthCheck.status === 'healthy',
      data: healthCheck,
      message: healthCheck.status === 'healthy' 
        ? 'Service is healthy' 
        : 'Service is unhealthy'
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      error: 'Health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        version: process.env.npm_package_version || '1.0.0',
        database: 'disconnected'
      }
    });
  }
});

export default router;
