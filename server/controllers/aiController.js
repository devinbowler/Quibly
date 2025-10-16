const OpenAI = require('openai');

const generateTasksFromPrompt = async (req, res) => {
  const { prompt, existingTasks } = req.body;
  
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured on server' 
    });
  }
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful task planning assistant. Create a structured task list based on user goals.
          
CRITICAL: You MUST respond with ONLY a valid JSON array. No other text before or after.
The array must contain task objects with this EXACT structure:
[
  {
    "title": "Task title (keep it concise)",
    "details": "Brief description of what needs to be done",
    "dueDate": "YYYY-MM-DD",
    "color": "#hexcolor"
  }
]

Color guide:
- Work/Professional tasks: #495BFA (blue)
- Health/Fitness tasks: #10B981 (green)
- Personal/Life tasks: #F59E0B (orange)
- Creative/Learning: #8B5CF6 (purple)
- Urgent/Important: #EF4444 (red)

Make tasks specific and actionable. Include 2-5 tasks based on the user's input.`
        },
        {
          role: 'user',
          content: `Today's date: ${new Date().toISOString().split('T')[0]}
Existing tasks: ${existingTasks?.map(t => t.title).join(', ') || 'None'}

User request: ${prompt}

Generate tasks for today or near future. Respond with ONLY the JSON array, nothing else.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    let content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any leading/trailing text that's not part of the JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    // Try to parse the JSON
    let tasks;
    try {
      tasks = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('AI response was not valid JSON. Please try again.');
    }
    
    // Validate and normalize the tasks
    if (!Array.isArray(tasks)) {
      throw new Error('AI response was not an array of tasks.');
    }
    
    // Normalize each task
    const normalizedTasks = tasks.map(task => {
      const title = task.title || task.name || task.task || 'Untitled Task';
      const details = task.details || task.description || task.desc || '';
      const dueDate = task.dueDate || task.due_date || task.date || new Date().toISOString().split('T')[0];
      const color = task.color || '#495BFA';
      
      return {
        title: title.substring(0, 100),
        details: details.substring(0, 500),
        dueDate,
        color: color.startsWith('#') ? color : `#${color}`
      };
    });
    
    if (normalizedTasks.length === 0) {
      throw new Error('No tasks were generated. Please try again with a different prompt.');
    }
    
    res.status(200).json(normalizedTasks);
    
  } catch (error) {
    console.error('Error generating tasks:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate tasks' 
    });
  }
};

module.exports = {
  generateTasksFromPrompt
};
