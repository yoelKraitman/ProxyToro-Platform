const BASE_URL    = 'https://api.globedata.io/api/v1/reseller'
const PACKAGE_ID  = parseInt(process.env.GLOBEDATA_PACKAGE_ID || '4')

function headers() {
  return {
    'Authorization': `Bearer ${process.env.GLOBEDATA_API_KEY}`,
    'Content-Type':  'application/json',
  }
}

function isConfigured() {
  return !!process.env.GLOBEDATA_API_KEY
}

async function gd(path, options = {}) {
  const res  = await fetch(`${BASE_URL}${path}`, { ...options, headers: headers() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `GlobeData error ${res.status}`)
  return data
}

// Create a sub-user with GB allocated — called when admin adds first package
export async function createSubuser({ email, gb, label = '' }) {
  if (!isConfigured()) return null
  const dashboardPassword = Math.random().toString(36).substring(2, 10) + 'Aa1!'
  const data = await gd('/subusers', {
    method: 'POST',
    body:   JSON.stringify({
      email,
      dashboard_password:      dashboardPassword,
      label:                   label || email,
      gb_initial:              gb,
      parent_user_package_id:  PACKAGE_ID,
    }),
  })
  return data.subuser
}

// Add or remove GB from an existing sub-user
export async function allocateGb(globedataId, gbDelta) {
  if (!isConfigured()) return null
  return gd(`/subusers/${globedataId}/allocate`, {
    method: 'POST',
    body:   JSON.stringify({ gb_delta: gbDelta }),
  })
}

// Enable or disable a sub-user's proxy access
export async function toggleSubuser(globedataId, isActive) {
  if (!isConfigured()) return null
  return gd(`/subusers/${globedataId}`, {
    method: 'PATCH',
    body:   JSON.stringify({ is_active: isActive }),
  })
}

// Soft-delete — deactivates proxy, returns unused GB to parent pool
export async function deleteSubuser(globedataId) {
  if (!isConfigured()) return null
  const res = await fetch(`${BASE_URL}/subusers/${globedataId}`, {
    method:  'DELETE',
    headers: headers(),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Failed to delete sub-user')
  }
  return true
}

// Get recent proxy request logs for a sub-user
export async function getSubuserLogs(globedataId, limit = 50) {
  if (!isConfigured()) return []
  const data = await gd(`/subusers/${globedataId}/logs?limit=${limit}`)
  return data.logs
}

// Get daily usage aggregates for a sub-user
export async function getSubuserUsage(globedataId, days = 30) {
  if (!isConfigured()) return []
  const data = await gd(`/subusers/${globedataId}/usage?days=${days}`)
  return data.usage
}

// Get current GB balance for a specific sub-user (gb_total, gb_used, gb_remaining)
export async function getSubuserBalance(globedataId) {
  if (!isConfigured()) return null
  const data = await gd('/subusers')
  return data.subusers?.find(s => s.id === globedataId) || null
}

// Get overall pool summary (GB totals, sub-user count)
export async function getSummary() {
  if (!isConfigured()) return null
  return gd('/summary')
}
