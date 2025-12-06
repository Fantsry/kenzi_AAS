// Hook to update overdue status
// This can be called on page load or periodically
import { updateOverdueStatus } from './actions'

export async function checkAndUpdateOverdue() {
  try {
    const result = await updateOverdueStatus()
    return result
  } catch (error) {
    console.error('Error updating overdue status:', error)
    return { success: false, error: error.message }
  }
}

