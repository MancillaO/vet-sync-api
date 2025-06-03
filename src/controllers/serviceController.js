import { validateService, validatePartialService } from '#schemas/serviceSchema.js'
import { serviceModel } from '#models/serviceModel.js'
import { categoryModel } from '#models/categoryModel.js'

export class ServiceController {
  static async getAllServices (req, res) {
    const { cat } = req.query

    try {
      const services = await serviceModel.getAllServices({ categoria_id: cat })

      if (services.length === 0) {
        return res.status(404).json({ error: 'Services not found' })
      }
      res.json({ message: 'Services found', data: services })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getById (req, res) {
    const { id } = req.params

    try {
      const service = await serviceModel.getById(id)

      if (service.length === 0) {
        return res.status(404).json({ error: 'Service not found' })
      }
      res.json({ message: 'Service found', data: service })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getActiveServices (req, res) {
    const { active } = req.params

    try {
      const services = await serviceModel.getActiveServices({ active })

      if (services.length === 0) {
        return res.status(404).json({ error: 'Services not found' })
      }

      res.json({ message: 'Services found', data: services })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async addService (req, res) {
    const result = validateService(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const category = await categoryModel.getById({ id: result.data.categoria_id })

    if (category.length === 0) return res.status(404).json({ error: 'Category not found' })

    try {
      const service = await serviceModel.addService({ input: result.data })
      return res.status(201).json({ message: 'Service created', data: service })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async updateService (req, res) {
    const { id } = req.params
    const result = validatePartialService(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    if (result.data.categoria_id) {
      const category = await categoryModel.getById({ id: result.data.categoria_id })
      if (category.length === 0) return res.status(404).json({ error: 'Category not found' })
    }

    try {
      const service = await serviceModel.updateService({ id, input: result.data })
      return res.status(200).json({ message: 'Service updated', data: service })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async deleteService (req, res) {
    const { id } = req.params

    try {
      const deletedService = await serviceModel.deleteService({ id })

      if (deletedService.length === 0) {
        return res.status(404).json({ error: 'Service not found' })
      }

      res.json({ message: 'Service deleted', data: deletedService })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
