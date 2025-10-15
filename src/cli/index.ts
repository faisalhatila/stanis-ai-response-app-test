#!/usr/bin/env node

import readline from 'readline';
import { AIService } from '../services/aiService';
import { DatabaseService } from '../database/schema';
import { TaskRequest } from '../types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class AICLInterface {
  private rl: readline.Interface;
  private aiService: AIService;
  private dbService: DatabaseService;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.aiService = new AIService(process.env.OPENAI_API_KEY || '');
    this.dbService = DatabaseService.getInstance();
  }

  public async start(): Promise<void> {
    console.log('\n🤖 AI Assistant Module - CLI Interface');
    console.log('=====================================');
    console.log('Type your tasks or use commands:');
    console.log('- help: Show available commands');
    console.log('- logs: View interaction logs');
    console.log('- stats: Show statistics');
    console.log('- delete <id>: Delete specific log by ID');
    console.log('- clear-all: Delete all logs');
    console.log('- clear: Clear screen');
    console.log('- exit: Quit the application');
    console.log('\nExample tasks:');
    console.log('- "analyze leads"');
    console.log('- "summarize calls"');
    console.log('- "update client report"');
    console.log('=====================================\n');

    this.promptUser();
  }

  private promptUser(): void {
    this.rl.question('> ', async (input) => {
      const command = input.trim().toLowerCase();

      switch (command) {
        case 'exit':
        case 'quit':
          console.log('👋 Goodbye!');
          this.rl.close();
          process.exit(0);
          break;

        case 'help':
          this.showHelp();
          break;

        case 'logs':
          await this.showLogs();
          break;

        case 'stats':
          await this.showStats();
          break;

        case 'clear':
          console.clear();
          break;

        case 'clear-all':
          await this.clearAllLogs();
          break;

        case '':
          // Empty input, just prompt again
          break;

        default:
          if (command.startsWith('delete ')) {
            const id = input.substring(7).trim();
            await this.deleteLog(id);
          } else {
            await this.processTask(input);
          }
          break;
      }

      this.promptUser();
    });
  }

  private showHelp(): void {
    console.log('\n📚 Available Commands:');
    console.log('====================');
    console.log('help        - Show this help message');
    console.log('logs        - View recent interaction logs');
    console.log('stats       - Show task processing statistics');
    console.log('delete <id> - Delete specific log by ID');
    console.log('clear-all   - Delete all interaction logs');
    console.log('clear       - Clear the screen');
    console.log('exit        - Quit the application');
    console.log('\n💡 Task Examples:');
    console.log('================');
    console.log('• "analyze leads"');
    console.log('• "summarize calls"');
    console.log('• "update client report"');
    console.log('• "create marketing strategy"');
    console.log('• "review sales performance"');
    console.log('\n');
  }

  private async processTask(taskInput: string): Promise<void> {
    console.log('\n🔄 Processing task...\n');

    try {
      const taskRequest: TaskRequest = {
        task: taskInput,
        priority: 'medium'
      };

      const startTime = Date.now();
      
      // Use simulation mode if no OpenAI API key is provided
      const response = process.env.OPENAI_API_KEY 
        ? await this.aiService.processTask(taskRequest)
        : await this.aiService.simulateTaskProcessing(taskRequest);

      const totalTime = Date.now() - startTime;

      console.log('✅ Task Completed!');
      console.log('==================');
      console.log(`📋 Task: ${response.task}`);
      console.log(`⏱️  Processing Time: ${response.processingTime}ms`);
      console.log(`📅 Timestamp: ${new Date(response.timestamp).toLocaleString()}`);
      console.log(`🎯 Status: ${response.status.toUpperCase()}`);
      console.log('\n📝 Response:');
      console.log('============');
      console.log(response.response);
      console.log('\n');

      // Save to database
      this.dbService.saveInteractionLog({
        id: response.id,
        task: response.task,
        response: response.response,
        status: response.status,
        timestamp: response.timestamp,
        processingTime: response.processingTime,
        metadata: response.metadata
      });

    } catch (error) {
      console.error('❌ Error processing task:', error);
      console.log('\n');
    }
  }

  private async showLogs(): Promise<void> {
    console.log('\n📊 Recent Interaction Logs');
    console.log('==========================');

    try {
      const logs = this.dbService.getInteractionLogs(10, 0);

      if (logs.length === 0) {
        console.log('No interaction logs found.');
        console.log('\n');
        return;
      }

      logs.forEach((log, index) => {
        console.log(`\n${index + 1}. ${log.task}`);
        console.log(`   Status: ${log.status.toUpperCase()}`);
        console.log(`   Time: ${new Date(log.timestamp).toLocaleString()}`);
        console.log(`   Duration: ${log.processingTime}ms`);
        console.log(`   ID: ${log.id}`);
      });

      console.log('\n');
    } catch (error) {
      console.error('❌ Error retrieving logs:', error);
      console.log('\n');
    }
  }

  private async showStats(): Promise<void> {
    console.log('\n📈 Task Processing Statistics');
    console.log('=============================');

    try {
      const stats = this.dbService.getStats();

      console.log(`📊 Total Interactions: ${stats.totalInteractions}`);
      console.log(`✅ Success Rate: ${stats.successRate.toFixed(1)}%`);
      console.log(`⏱️  Average Processing Time: ${stats.averageProcessingTime.toFixed(0)}ms`);
      console.log('\n');
    } catch (error) {
      console.error('❌ Error retrieving statistics:', error);
      console.log('\n');
    }
  }

  private async deleteLog(id: string): Promise<void> {
    console.log('\n🗑️  Deleting Interaction Log');
    console.log('============================');

    if (!id || id.trim().length === 0) {
      console.log('❌ Please provide a valid log ID');
      console.log('Usage: delete <log-id>');
      console.log('\n');
      return;
    }

    try {
      const deleted = this.dbService.deleteInteractionLog(id.trim());

      if (deleted) {
        console.log(`✅ Successfully deleted log with ID: ${id}`);
      } else {
        console.log(`❌ Log with ID "${id}" not found`);
      }
      console.log('\n');
    } catch (error) {
      console.error('❌ Error deleting log:', error);
      console.log('\n');
    }
  }

  private async clearAllLogs(): Promise<void> {
    console.log('\n🗑️  Clear All Interaction Logs');
    console.log('==============================');

    try {
      const deletedCount = this.dbService.deleteAllInteractionLogs();

      if (deletedCount > 0) {
        console.log(`✅ Successfully deleted ${deletedCount} interaction logs`);
      } else {
        console.log('ℹ️  No logs found to delete');
      }
      console.log('\n');
    } catch (error) {
      console.error('❌ Error clearing logs:', error);
      console.log('\n');
    }
  }
}

// Start the CLI if this file is run directly
if (require.main === module) {
  const cli = new AICLInterface();
  cli.start().catch(console.error);
}

export default AICLInterface;
