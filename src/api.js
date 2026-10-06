// SafeGuard API Client
const API_BASE = 'http://localhost:5162';

function getAuthHeader() {
  const token = localStorage.getItem('sg_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  async register(organizationName, fullName, email, password) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationName, fullName, email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  // Dashboard Stats
  async getStats(orgId) {
    const q = orgId ? `?orgId=${orgId}` : '';
    const res = await fetch(`${API_BASE}/api/dashboard/stats${q}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return res.json();
  },

  // Rules
  async getRules(orgId) {
    const q = orgId ? `?orgId=${orgId}` : '';
    const res = await fetch(`${API_BASE}/api/rules${q}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load rules');
    return res.json();
  },

  async addRule(ruleData, orgId) {
    const q = orgId ? `?orgId=${orgId}` : '';
    const res = await fetch(`${API_BASE}/api/rules${q}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(ruleData)
    });
    if (!res.ok) throw new Error('Failed to add rule');
    return res.json();
  },

  async toggleRule(ruleId) {
    const res = await fetch(`${API_BASE}/api/rules/${ruleId}/toggle`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to toggle rule');
    return res.json();
  },

  async deleteRule(ruleId) {
    const res = await fetch(`${API_BASE}/api/rules/${ruleId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to delete rule');
    return res.json();
  },

  // Incidents
  async getIncidents(take = 50, orgId) {
    const params = new URLSearchParams({ take });
    if (orgId) params.append('orgId', orgId);

    const res = await fetch(`${API_BASE}/api/incidents?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load incidents');
    return res.json();
  },

  async exportCsvUrl(orgId) {
    const q = orgId ? `?orgId=${orgId}` : '';
    const res = await fetch(`${API_BASE}/api/incidents/export-csv${q}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to export CSV');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafeGuard_AuditLogs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // Clear / Reset All Data
  async clearAllData(orgId) {
    const q = orgId ? `?orgId=${orgId}` : '';
    const res = await fetch(`${API_BASE}/api/incidents/clear-all${q}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to reset database logs');
    return res.json();
  },

  // Inspect sandbox
  async inspectPrompt(prompt, apiKey, employeeEmail, targetWebsite) {
    const res = await fetch(`${API_BASE}/api/safeguard/inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        apiKey,
        employeeEmail: employeeEmail || 'admin@company.com',
        targetWebsite: targetWebsite || 'Live Prompt Sandbox'
      })
    });
    if (!res.ok) throw new Error('Inspection request failed');
    return res.json();
  },

  // Alert & Notification Settings
  async updateAlertSettings(settings, orgId) {
    const q = orgId ? `?orgId=${orgId}` : '';
    const res = await fetch(`${API_BASE}/api/dashboard/alert-settings${q}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update alert settings');
    return res.json();
  },

  async sendTestAlert(orgId) {
    const q = orgId ? `?orgId=${orgId}` : '';
    const res = await fetch(`${API_BASE}/api/dashboard/test-alert${q}`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to dispatch test alert');
    return res.json();
  }
};
