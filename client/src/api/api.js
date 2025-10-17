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

export const updateDailyTask = async (taskId, updates) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const response = await fetch(`http://localhost:4000/api/dailytasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update daily task');
  }
  
  return response.json();
};

// ===== AI TASK GENERATION =====
export const generateTasksFromPrompt = async (prompt, existingTasks) => {
  const response = await fetch(`${API_URL}/ai/generate-tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, existingTasks })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate tasks');
  }
  
  return response.json();
};
