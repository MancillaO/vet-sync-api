import { validateSchedule, validatePartialSchedule } from '../schemas/scheduleSchema.js'
import { scheduleModel } from '../models/scheduleModel.js'
import { vetModel } from '../models/vetModel.js'

export class ScheduleController {
  static async addSchedule (req, res) {
    const result = validateSchedule(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const vet = await vetModel.getById({ id: result.data.profesional_id })

    if (vet.length === 0) return res.status(404).json({ error: 'Profesional not found' })
    if (vet[0].activo === false) return res.status(400).json({ error: 'Profesional is not active' })

    try {
      const schedule = await scheduleModel.addSchedule({ input: result.data })
      return res.status(201).json({ message: 'Schedule created', data: schedule })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getAllSchedules (req, res) {
    const { profesional_id } = req.query

    try {
      const schedules = await scheduleModel.getAllSchedules({ profesional_id })

      if (schedules.length === 0) {
        return res.status(404).json({ error: 'Schedules not found' })
      }
      res.json({ message: 'Schedules found', data: schedules })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getById (req, res) {
    const { id } = req.params

    try {
      const schedule = await scheduleModel.getById({ id })

      if (schedule.length === 0) {
        return res.status(404).json({ error: 'Schedule not found' })
      }
      res.json({ message: 'Schedule found', data: schedule })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async updateSchedule (req, res) {
    const { id } = req.params
    const result = validatePartialSchedule(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    try {
      const schedule = await scheduleModel.updateSchedule({ id, input: result.data })

      if (schedule.length === 0) {
        return res.status(404).json({ error: 'Schedule not found' })
      }

      res.json({ message: 'Schedule updated', data: schedule })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async deleteSchedule (req, res) {
    const { id } = req.params

    try {
      const schedule = await scheduleModel.deleteSchedule({ id })

      if (schedule.length === 0) {
        return res.status(404).json({ error: 'Schedule not found' })
      }

      res.json({ message: 'Schedule deleted', data: schedule })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
