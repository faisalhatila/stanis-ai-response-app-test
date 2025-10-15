import Database from 'better-sqlite3';
import { InteractionLog } from '../types';

export class DatabaseService {
  private db: Database.Database;
  private static instance: DatabaseService;

  constructor(databasePath: string = './data/assistant.db') {
    this.db = new Database(databasePath);
    this.initializeTables();
  }

  public static getInstance(databasePath?: string): DatabaseService {
    if (!DatabaseService.instance) {
      const path = databasePath || process.env.DATABASE_PATH || './data/assistant.db';
      DatabaseService.instance = new DatabaseService(path);
    }
    return DatabaseService.instance;
  }

  private initializeTables(): void {
    // Create interaction_logs table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS interaction_logs (
        id TEXT PRIMARY KEY,
        task TEXT NOT NULL,
        response TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('success', 'error')),
        timestamp TEXT NOT NULL,
        processing_time INTEGER NOT NULL,
        user_agent TEXT,
        ip_address TEXT,
        metadata TEXT
      )
    `;

    this.db.exec(createTableQuery);

    // Create index for better query performance
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_timestamp ON interaction_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_status ON interaction_logs(status);
    `;

    this.db.exec(createIndexQuery);
  }

  public saveInteractionLog(log: InteractionLog): void {
    const insertQuery = `
      INSERT INTO interaction_logs 
      (id, task, response, status, timestamp, processing_time, user_agent, ip_address, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const stmt = this.db.prepare(insertQuery);
    stmt.run(
      log.id,
      log.task,
      log.response,
      log.status,
      log.timestamp,
      log.processingTime,
      log.userAgent || null,
      log.ipAddress || null,
      log.metadata ? JSON.stringify(log.metadata) : null
    );
  }

  public getInteractionLogs(limit: number = 50, offset: number = 0): InteractionLog[] {
    const selectQuery = `
      SELECT * FROM interaction_logs 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `;

    const stmt = this.db.prepare(selectQuery);
    const rows = stmt.all(limit, offset) as any[];

    return rows.map(row => ({
      id: row.id,
      task: row.task,
      response: row.response,
      status: row.status,
      timestamp: row.timestamp,
      processingTime: row.processing_time,
      userAgent: row.user_agent,
      ipAddress: row.ip_address,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    }));
  }

  public getInteractionLogById(id: string): InteractionLog | null {
    const selectQuery = `
      SELECT * FROM interaction_logs WHERE id = ?
    `;

    const stmt = this.db.prepare(selectQuery);
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      task: row.task,
      response: row.response,
      status: row.status,
      timestamp: row.timestamp,
      processingTime: row.processing_time,
      userAgent: row.user_agent,
      ipAddress: row.ip_address,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    };
  }

  public getStats(): { totalInteractions: number; successRate: number; averageProcessingTime: number } {
    try {
      // Use a single query to get all stats
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
          AVG(processing_time) as avg_time
        FROM interaction_logs
      `;

      const result = this.db.prepare(statsQuery).get() as { total: number; success: number; avg_time: number };

      return {
        totalInteractions: result.total || 0,
        successRate: result.total > 0 ? (result.success / result.total) * 100 : 0,
        averageProcessingTime: result.avg_time || 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalInteractions: 0,
        successRate: 0,
        averageProcessingTime: 0
      };
    }
  }

  public deleteInteractionLog(id: string): boolean {
    try {
      const deleteQuery = 'DELETE FROM interaction_logs WHERE id = ?';
      const stmt = this.db.prepare(deleteQuery);
      const result = stmt.run(id);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting interaction log:', error);
      return false;
    }
  }

  public deleteAllInteractionLogs(): number {
    try {
      const deleteQuery = 'DELETE FROM interaction_logs';
      const stmt = this.db.prepare(deleteQuery);
      const result = stmt.run();
      
      return result.changes;
    } catch (error) {
      console.error('Error deleting all interaction logs:', error);
      return 0;
    }
  }

  public close(): void {
    this.db.close();
  }
}
