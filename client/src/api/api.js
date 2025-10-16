// Use local backend for development
// const API_URL = 'http://localhost:4000/api';
// Production backend (commented out)
const API_URL = 'https://quibly.onrender.com/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token}`
  };
};

// ===== CALENDAR TASK API CALLS =====
export const fetchAllTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const fetchTasksByDateRange = async (startDate, endDate) => {
  const response = await fetch(
    `${API_URL}/tasks/range?startDate=${startDate}&endDate=${endDate}`,
    { headers: getAuthHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const createTask = async (taskData) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData)
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

export const createMultipleTasks = async (tasks) => {
  const response = await fetch(`${API_URL}/tasks/batch`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ tasks })
  });
  if (!response.ok) throw new Error('Failed to create tasks');
  return response.json();
};

export const updateTask = async (id, updates) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete task');
  return response.json();
};

export const toggleTaskCompletion = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to toggle task');
  return response.json();
};

// ===== DAILY TASK API CALLS =====
export const fetchAllDailyTasks = async () => {
  const response = await fetch(`${API_URL}/dailytasks`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch daily tasks');
  return response.json();
};

export const createMultipleDailyTasks = async (tasks) => {
  const response = await fetch(`${API_URL}/dailytasks/batch`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ tasks })
  });
  if (!response.ok) throw new Error('Failed to create daily tasks');
  return response.json();
};

export const toggleDailyTaskCompletion = async (id) => {
  const response = await fetch(`${API_URL}/dailytasks/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to toggle daily task');
  return response.json();
};

export const deleteAllDailyTasks = async () => {
  const response = await fetch(`${API_URL}/dailytasks/all`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete daily tasks');
  return response.json();
};

// ===== AI TASK GENERATION =====
export const generateTasksFromPrompt = async (prompt, existingTasks) => {
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please add it to your .env file.');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
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
Existing tasks: ${existingTasks.map(t => t.title).join(', ') || 'None'}

User request: ${prompt}

Generate tasks for today or near future. Respond with ONLY the JSON array, nothing else.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate tasks');
    }
    
    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    console.log('Raw AI response:', content);
    
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
    
    // Normalize each task to ensure it has all required fields
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
    
    console.log('Normalized tasks:', normalizedTasks);
    
    if (normalizedTasks.length === 0) {
      throw new Error('No tasks were generated. Please try again with a different prompt.');
    }
    
    return normalizedTasks;
    
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw error;
  }
};
