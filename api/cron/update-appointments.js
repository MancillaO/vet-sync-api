import { AppointmentStatusManager } from '../../src/services/appointmentStatusManager.js'

export default async function handler (req, res) {
  if (process.env.ENABLE_CRON_JOBS !== 'true') {
    return res.status(200).json({
      skipped: true,
      reason: 'Cron jobs disabled'
    })
  }

  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const [inProgressCount, completedCount] = await Promise.all([
      AppointmentStatusManager.updateInProgressAppointments(),
      AppointmentStatusManager.updateCompletedAppointments()
    ])

    res.status(200).json({
      success: true,
      inProgressUpdated: inProgressCount,
      completedUpdated: completedCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Error en cron job:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
