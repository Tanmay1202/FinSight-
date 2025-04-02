// script.js
const API_BASE_URL = '/api'; // Use relative path for Vercel deployment

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    // Make sidebar visible by default
    document.getElementById('sidebar').classList.add('active');
    document.querySelector('.main-content').classList.add('active');
    
    loadExpenses();
    loadCategories();
    loadAnalytics();
    loadBudgetStatus();
    
    // Function to toggle sidebar
    const toggleSidebar = () => {
        document.getElementById('sidebar').classList.toggle('active');
        document.querySelector('.main-content').classList.toggle('active');
    };
    
    // Add click handlers for both toggle buttons
    document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);
    document.getElementById('mainToggleSidebar').addEventListener('click', toggleSidebar);
});

// --- Section Navigation ---
function showSection(sectionId) {
    // Hide all sections first
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        // Trigger reflow to ensure transition works
        selectedSection.offsetHeight;
        selectedSection.classList.add('active');
    }

    // Close sidebar on mobile after section change
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
        document.querySelector('.main-content').classList.remove('active');
    }
}

// --- Dark Mode Toggle ---
document.getElementById('toggleDarkMode').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// --- Expense Management ---
document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;

    try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, amount, category, description })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add expense');
        }
        document.getElementById('expenseForm').reset();
        loadExpenses();
        loadAnalytics();
        loadBudgetStatus();
    } catch (error) {
        console.error('Error adding expense:', error);
        alert('Failed to add expense: ' + error.message);
    }
});

async function loadExpenses() {
    const search = document.getElementById('search').value;
    const category = document.getElementById('categoryFilter').value;
    const sort = document.getElementById('sort').value;
    try {
        const response = await fetch(`${API_BASE_URL}/expenses?search=${search}&category=${category}`);
        if (!response.ok) {
            throw new Error('Failed to fetch expenses');
        }
        let expenses = await response.json();

        // Sort expenses
        if (sort === 'date-asc') expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
        if (sort === 'date-desc') expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        if (sort === 'amount-asc') expenses.sort((a, b) => a.amount - b.amount);
        if (sort === 'amount-desc') expenses.sort((a, b) => b.amount - a.amount);

        const expenseList = document.getElementById('expenseList');
        expenseList.innerHTML = '';

        expenses.forEach(exp => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="date" value="${exp.date}" onchange="editExpense(${exp.id}, 'date', this.value)"></td>
                <td><input type="number" step="0.01" value="${exp.amount}" onchange="editExpense(${exp.id}, 'amount', this.value)"></td>
                <td><select onchange="editExpense(${exp.id}, 'category', this.value)"></select></td>
                <td><input type="text" value="${exp.description}" onchange="editExpense(${exp.id}, 'description', this.value)"></td>
                <td>
                    <button class="edit" onclick="editExpense(${exp.id})">Save</button>
                    <button class="delete" onclick="deleteExpense(${exp.id})">Delete</button>
                </td>
            `;
            const select = row.querySelector('select');
            loadCategoryOptions(select, exp.category);
            expenseList.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading expenses:', error);
        document.getElementById('expenseList').innerHTML = '<tr><td colspan="5">Failed to load expenses.</td></tr>';
    }
}

async function editExpense(id, field, value) {
    let date = field === 'date' ? value : document.querySelector(`input[onchange="editExpense(${id}, 'date', this.value)"]`).value;
    let amount = field === 'amount' ? parseFloat(value) : parseFloat(document.querySelector(`input[onchange="editExpense(${id}, 'amount', this.value)"]`).value);
    let category = field === 'category' ? value : document.querySelector(`select[onchange="editExpense(${id}, 'category', this.value)"]`).value;
    let description = field === 'description' ? value : document.querySelector(`input[onchange="editExpense(${id}, 'description', this.value)"]`).value;

    try {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, amount, category, description })
        });
        if (!response.ok) {
            throw new Error('Failed to update expense');
        }
        loadExpenses();
        loadAnalytics();
        loadBudgetStatus();
    } catch (error) {
        console.error('Error editing expense:', error);
        alert('Failed to update expense: ' + error.message);
    }
}

async function deleteExpense(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }
        loadExpenses();
        loadAnalytics();
        loadBudgetStatus();
    } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense: ' + error.message);
    }
}

// --- Category Management ---
document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('newCategory').value;
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add category');
        }
        document.getElementById('categoryForm').reset();
        loadCategories();
    } catch (error) {
        console.error('Error adding category:', error);
        alert('Failed to add category: ' + error.message);
    }
});

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        const categories = await response.json();

        const categorySelect = document.getElementById('category');
        const categoryFilter = document.getElementById('categoryFilter');
        const budgetCategorySelect = document.getElementById('budgetCategory');
        const categoryList = document.getElementById('categoryList');

        if (!categorySelect || !categoryFilter || !budgetCategorySelect || !categoryList) {
            console.error('One or more DOM elements not found');
            return;
        }

        categorySelect.innerHTML = '';
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        budgetCategorySelect.innerHTML = '';
        categoryList.innerHTML = '';

        if (categories.length === 0) {
            categorySelect.innerHTML = '<option value="">No Categories</option>';
            budgetCategorySelect.innerHTML = '<option value="">No Categories</option>';
            return;
        }

        categories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
            categoryFilter.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
            budgetCategorySelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
            const li = document.createElement('li');
            li.innerHTML = `${cat.name} <button class="delete" onclick="deleteCategory(${cat.id})">Delete</button>`;
            categoryList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categoryList').innerHTML = '<li>Failed to load categories.</li>';
    }
}

function loadCategoryOptions(select, selected) {
    fetch(`${API_BASE_URL}/categories`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            return response.json();
        })
        .then(categories => {
            select.innerHTML = categories.map(cat =>
                `<option value="${cat.name}" ${cat.name === selected ? 'selected' : ''}>${cat.name}</option>`
            ).join('');
        })
        .catch(error => {
            console.error('Error loading category options:', error);
            select.innerHTML = '<option value="">Error loading categories</option>';
        });
}

async function deleteCategory(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete category');
        }
        loadCategories();
        loadExpenses();
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category: ' + error.message);
    }
}

// --- Analytics ---
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics`);
        if (!response.ok) {
            throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        const analyticsDiv = document.getElementById('analytics');
        analyticsDiv.innerHTML = '<h3>Spending by Category</h3><canvas id="spendingChart"></canvas>';

        const labels = data.map(item => item.category);
        const amounts = data.map(item => item.total);

        new Chart(document.getElementById('spendingChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Spending ($)',
                    data: amounts,
                    backgroundColor: 'rgba(26, 115, 232, 0.6)',
                    borderColor: 'rgba(26, 115, 232, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading analytics:', error);
        document.getElementById('analytics').innerHTML = '<p>Failed to load analytics.</p>';
    }
}

// --- Budget Management ---
document.getElementById('budgetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('budgetCategory').value;
    const month = document.getElementById('budgetMonth').value;
    const budget_amount = parseFloat(document.getElementById('budgetAmount').value);

    try {
        const response = await fetch(`${API_BASE_URL}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, month, budget_amount })
        });
        if (!response.ok) {
            throw new Error('Failed to set budget');
        }
        document.getElementById('budgetForm').reset();
        loadBudgetStatus();
    } catch (error) {
        console.error('Error setting budget:', error);
        alert('Failed to set budget: ' + error.message);
    }
});

async function loadBudgetStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/budget-status`);
        if (!response.ok) {
            throw new Error('Failed to fetch budget status');
        }
        const data = await response.json();
        const budgetStatusDiv = document.getElementById('budgetStatus');
        budgetStatusDiv.innerHTML = '';

        data.forEach(item => {
            const spent = item.spent || 0;
            const remaining = item.budget_amount - spent;
            const status = remaining < 0 ? 'Over Budget!' : remaining < item.budget_amount * 0.1 ? 'Warning: Low Budget!' : 'On Track';
            budgetStatusDiv.innerHTML += `
                <div class="budget-card">
                    <p><strong>${item.month} - ${item.category}</strong></p>
                    <p>Budget: $${item.budget_amount.toFixed(2)}</p>
                    <p>Spent: $${spent.toFixed(2)}</p>
                    <p>Status: ${status}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading budget status:', error);
        document.getElementById('budgetStatus').innerHTML = '<p>Failed to load budget status.</p>';
    }
}

// --- Insights ---
async function loadInsights() {
    try {
        const insightsContainer = document.getElementById('ai-insights');
        if (insightsContainer) {
            insightsContainer.innerHTML = '<div class="loading">Loading insights...</div>';
        }

        const response = await fetch(`${API_BASE_URL}/expenses`);
        if (!response.ok) {
            throw new Error('Failed to fetch expenses');
        }

        const expenses = await response.json();
        
        const insightsResponse = await fetch(`${API_BASE_URL}/insights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expenses })
        });

        if (!insightsResponse.ok) {
            const errorData = await insightsResponse.json();
            throw new Error(errorData.error || 'Failed to get insights');
        }

        const data = await insightsResponse.json();
        
        if (insightsContainer) {
            let insightsHtml = '<div class="insights-card">';
            insightsHtml += '<h3><i class="fas fa-lightbulb"></i> AI Insights</h3>';
            insightsHtml += '<ul>';
            
            if (data.insights && data.insights.length > 0) {
                data.insights.forEach(insight => {
                    insightsHtml += `<li>${insight}</li>`;
                });
            } else {
                insightsHtml += '<li>No insights available at the moment. Try adding more expenses.</li>';
            }
            
            insightsHtml += '</ul></div>';
            insightsContainer.innerHTML = insightsHtml;
        }
    } catch (error) {
        console.error('Error loading insights:', error);
        const insightsContainer = document.getElementById('ai-insights');
        if (insightsContainer) {
            insightsContainer.innerHTML = `<div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                Unable to load insights: ${error.message}
            </div>`;
        }
    }
}

// --- Chatbot ---
async function sendChatMessage() {
    try {
        const messageInput = document.getElementById('chat-input');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        messageInput.value = '';
        
        const chatHistory = document.getElementById('chat-history');
        chatHistory.innerHTML += `
            <div class="user-message">
                <div class="avatar"><i class="fas fa-user"></i></div>
                <div class="message-content">
                    <p>${message}</p>
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
            </div>`;
        
        chatHistory.innerHTML += '<div class="ai-message loading-message">Thinking...</div>';
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get response from the chatbot');
        }
        
        const data = await response.json();
        
        const formattedResponse = data.reply.replace(/\n/g, '<br>');
        chatHistory.innerHTML += `
            <div class="ai-message">
                <div class="avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <p>${formattedResponse}</p>
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
            </div>`;
        
        chatHistory.scrollTop = chatHistory.scrollHeight;
    } catch (error) {
        console.error('Error in chat:', error);
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        const chatHistory = document.getElementById('chat-history');
        chatHistory.innerHTML += `
            <div class="error-message">
                Error: ${error.message}
            </div>`;
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
    }
});

// --- Visual Reports ---
async function loadVisualReport() {
    try {
        const response = await fetch(`${API_BASE_URL}/visual-report`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to load visual report');
        }

        const data = await response.json();
        const reportDiv = document.getElementById('visualReportContent');
        reportDiv.innerHTML = `<img src="${data.image}" alt="Visual Budget Report" style="max-width: 100%; border-radius: 8px;">`;
    } catch (error) {
        console.error('Error loading visual report:', error);
        document.getElementById('visualReportContent').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// --- Export to CSV ---
async function exportToCSV() {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses`);
        if (!response.ok) {
            throw new Error('Failed to fetch expenses');
        }
        const expenses = await response.json();
        const csv = ['Date,Amount,Category,Description',
            ...expenses.map(exp => `${exp.date},${exp.amount},${exp.category},${exp.description.replace(/,/g, '')}`)].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses.csv';
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export to CSV: ' + error.message);
    }
}