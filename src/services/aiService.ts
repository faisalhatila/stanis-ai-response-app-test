import OpenAI from 'openai';
import { TaskRequest, TaskResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  public async processTask(request: TaskRequest): Promise<TaskResponse> {
    const startTime = Date.now();
    const taskId = uuidv4();

    try {
      // Generate AI response based on task type
      const response = await this.generateResponse(request);
      const processingTime = Date.now() - startTime;

      return {
        id: taskId,
        task: request.task,
        response: response,
        status: 'success',
        timestamp: new Date().toISOString(),
        processingTime: processingTime,
        metadata: {
          priority: request.priority || 'medium',
          context: request.context,
          model: 'gpt-3.5-turbo'
        }
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        id: taskId,
        task: request.task,
        response: `Error processing task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        timestamp: new Date().toISOString(),
        processingTime: processingTime,
        metadata: {
          priority: request.priority || 'medium',
          context: request.context,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private async generateResponse(request: TaskRequest): Promise<string> {
    const systemPrompt = this.getSystemPrompt(request.task);
    const userPrompt = this.buildUserPrompt(request);

    const completion = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'No response generated';
  }

  private getSystemPrompt(task: string): string {
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('analyze') || taskLower.includes('analysis')) {
      return `You are a data analysis assistant. Provide clear, structured analysis with actionable insights. 
      Format your response with bullet points and include key metrics when relevant.`;
    }
    
    if (taskLower.includes('summarize') || taskLower.includes('summary')) {
      return `You are a summarization expert. Create concise, well-structured summaries that capture the key points. 
      Use clear headings and bullet points for better readability.`;
    }
    
    if (taskLower.includes('report') || taskLower.includes('update')) {
      return `You are a professional report writer. Create structured, professional reports with clear sections. 
      Include relevant details and maintain a formal tone.`;
    }
    
    if (taskLower.includes('lead') || taskLower.includes('client')) {
      return `You are a business development assistant. Focus on actionable insights for lead management and client relations. 
      Provide specific recommendations and next steps.`;
    }
    
    // Default system prompt
    return `You are a helpful AI assistant. Provide clear, accurate, and actionable responses. 
    Structure your answers logically and include relevant details.`;
  }

  private buildUserPrompt(request: TaskRequest): string {
    let prompt = `Task: ${request.task}`;
    
    if (request.context) {
      prompt += `\n\nContext: ${request.context}`;
    }
    
    if (request.priority) {
      prompt += `\n\nPriority: ${request.priority}`;
    }
    
    return prompt;
  }

  // Simulate different task types for demo purposes
  public async simulateTaskProcessing(request: TaskRequest): Promise<TaskResponse> {
    const startTime = Date.now();
    const taskId = uuidv4();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const taskLower = request.task.toLowerCase();
    let response: string;

    if (taskLower.includes('analyze leads')) {
      response = `Lead Analysis Report:
      
📊 **Summary**
- Total leads: 150
- Qualified leads: 45 (30%)
- Hot prospects: 12 (8%)

🎯 **Top Performing Sources**
1. LinkedIn (35% conversion)
2. Website referrals (28% conversion)
3. Email campaigns (22% conversion)

📈 **Recommendations**
- Focus on LinkedIn lead nurturing
- Optimize website conversion funnel
- Implement lead scoring system

⏰ **Next Steps**
- Schedule follow-up calls for hot prospects
- Create targeted content for qualified leads
- Review and update lead qualification criteria`;
    } else if (taskLower.includes('summarize calls')) {
      response = `Call Summary Report:

📞 **Call Overview**
- Total calls: 25
- Average duration: 12 minutes
- Follow-up required: 8 calls

🎯 **Key Outcomes**
- 5 new qualified leads identified
- 3 product demos scheduled
- 2 pricing discussions initiated

📝 **Action Items**
- Follow up with 3 prospects by Friday
- Send product information to 5 leads
- Schedule technical demo for enterprise client

⚠️ **Issues Identified**
- 2 prospects mentioned budget constraints
- 1 lead needs additional technical validation`;
    } else if (taskLower.includes('update client report')) {
      response = `Client Report Update:

📋 **Report Status: Updated**

📊 **Key Metrics**
- Client satisfaction: 4.8/5
- Project completion: 85%
- On-time delivery: 92%

🎯 **Recent Achievements**
- Completed Phase 2 deliverables
- Resolved 3 critical issues
- Implemented requested feature updates

📈 **Progress Summary**
- Milestone 1: ✅ Completed
- Milestone 2: ✅ Completed  
- Milestone 3: 🔄 In Progress (85% complete)
- Milestone 4: ⏳ Pending

📅 **Next Steps**
- Complete final testing phase
- Prepare final deliverables
- Schedule project review meeting`;
    } else {
      response = `Task completed successfully: "${request.task}"

✅ **Status**: Completed
📅 **Timestamp**: ${new Date().toLocaleString()}
🎯 **Priority**: ${request.priority || 'medium'}

${request.context ? `📝 **Context**: ${request.context}` : ''}

The task has been processed and is ready for review.`;
    }

    const processingTime = Date.now() - startTime;

    return {
      id: taskId,
      task: request.task,
      response: response,
      status: 'success',
      timestamp: new Date().toISOString(),
      processingTime: processingTime,
      metadata: {
        priority: request.priority || 'medium',
        context: request.context,
        simulated: true
      }
    };
  }
}
