import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { DatabaseService } from '../database/schema';
import { TaskRequest, ApiResponse, InteractionLog } from '../types';

const router = Router();

// Initialize services
const aiService = new AIService(process.env.OPENAI_API_KEY || '');
const dbService = DatabaseService.getInstance();

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskRequest:
 *       type: object
 *       required:
 *         - task
 *       properties:
 *         task:
 *           type: string
 *           description: The task description
 *           example: "analyze leads"
 *         context:
 *           type: string
 *           description: Additional context for the task
 *           example: "Q4 sales data"
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Task priority level
 *           example: "high"
 *     
 *     TaskResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique task ID
 *         task:
 *           type: string
 *           description: Original task description
 *         response:
 *           type: string
 *           description: AI-generated response
 *         status:
 *           type: string
 *           enum: [success, error]
 *           description: Task processing status
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the task was processed
 *         processingTime:
 *           type: number
 *           description: Processing time in milliseconds
 *         metadata:
 *           type: object
 *           description: Additional task metadata
 *     
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the request was successful
 *         data:
 *           type: object
 *           description: Response data
 *         error:
 *           type: string
 *           description: Error message if any
 *         message:
 *           type: string
 *           description: Additional message
 */

/**
 * @swagger
 * /api/tasks/process:
 *   post:
 *     summary: Process a new task
 *     description: Submit a task to the AI assistant for processing
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskRequest'
 *     responses:
 *       200:
 *         description: Task processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { task, context, priority }: TaskRequest = req.body;

    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Task is required and must be a non-empty string'
      });
    }

    // Process the task
    const taskRequest: TaskRequest = { task: task.trim(), context, priority };
    
    // Use simulation mode if no OpenAI API key is provided
    const response = process.env.OPENAI_API_KEY 
      ? await aiService.processTask(taskRequest)
      : await aiService.simulateTaskProcessing(taskRequest);

    // Save interaction log
    const interactionLog: InteractionLog = {
      id: response.id,
      task: response.task,
      response: response.response,
      status: response.status,
      timestamp: response.timestamp,
      processingTime: response.processingTime,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      metadata: response.metadata
    };

    dbService.saveInteractionLog(interactionLog);

    res.json({
      success: true,
      data: response,
      message: 'Task processed successfully'
    });

  } catch (error) {
    console.error('Error processing task:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while processing task'
    });
  }
});

/**
 * @swagger
 * /api/tasks/logs:
 *   get:
 *     summary: Get interaction logs
 *     description: Retrieve a list of interaction logs with pagination
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of logs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of logs to skip
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskResponse'
 */
router.get('/logs', (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    const logs = dbService.getInteractionLogs(limit, offset);

    res.json({
      success: true,
      data: logs,
      message: `Retrieved ${logs.length} interaction logs`
    });

  } catch (error) {
    console.error('Error retrieving logs:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving logs'
    });
  }
});

/**
 * @swagger
 * /api/tasks/logs/{id}:
 *   get:
 *     summary: Get specific interaction log
 *     description: Retrieve a specific interaction log by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interaction log ID
 *     responses:
 *       200:
 *         description: Log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/logs/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const log = dbService.getInteractionLogById(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Interaction log not found'
      });
    }

    res.json({
      success: true,
      data: log,
      message: 'Interaction log retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving log:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving log'
    });
  }
});

/**
 * @swagger
 * /api/tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     description: Retrieve statistics about processed tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalInteractions:
 *                           type: number
 *                           description: Total number of interactions
 *                         successRate:
 *                           type: number
 *                           description: Success rate percentage
 *                         averageProcessingTime:
 *                           type: number
 *                           description: Average processing time in milliseconds
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = dbService.getStats();

    res.json({
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving statistics'
    });
  }
});

/**
 * @swagger
 * /api/tasks/logs/{id}:
 *   delete:
 *     summary: Delete specific interaction log
 *     description: Delete a specific interaction log by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interaction log ID to delete
 *     responses:
 *       200:
 *         description: Log deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/logs/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid ID is required'
      });
    }

    const deleted = dbService.deleteInteractionLog(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Interaction log not found'
      });
    }

    res.json({
      success: true,
      message: 'Interaction log deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting log'
    });
  }
});

/**
 * @swagger
 * /api/tasks/logs:
 *   delete:
 *     summary: Delete all interaction logs
 *     description: Delete all interaction logs from the database
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: All logs deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         deletedCount:
 *                           type: number
 *                           description: Number of logs deleted
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/logs', (req: Request, res: Response) => {
  try {
    const deletedCount = dbService.deleteAllInteractionLogs();

    res.json({
      success: true,
      data: { deletedCount },
      message: `Successfully deleted ${deletedCount} interaction logs`
    });

  } catch (error) {
    console.error('Error deleting all logs:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting logs'
    });
  }
});

export default router;
