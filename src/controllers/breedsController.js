import { breedsModel } from '#models/breedsModel.js'

export class BreedsController {
  static async getAllBreeds (req, res) {
    const breeds = await breedsModel.getAllBreeds()

    if (breeds.length === 0) {
      return res.status(404).json({ error: 'Breeds not found' })
    }
    res.json({ message: 'Breeds found', data: breeds })
  }

  static async getById (req, res) {
    const { id } = req.params
    const breed = await breedsModel.getById({ id })

    if (breed.length === 0) {
      return res.status(404).json({ error: 'Breed not found' })
    }
    res.json({ message: 'Breed found', data: breed })
  }

  static async getByName (req, res) {
    const { name } = req.params
    const breed = await breedsModel.getByName({ name })

    if (breed.length === 0) {
      return res.status(404).json({ error: 'Breed not found' })
    }
    res.json({ message: 'Breed found', data: breed })
  }

  static async getBySpecies (req, res) {
    const { speciesId } = req.params
    const breeds = await breedsModel.getBySpecies({ speciesId })

    if (breeds.length === 0) {
      return res.status(404).json({ error: 'Breeds not found' })
    }
    res.json({ message: 'Breeds found', data: breeds })
  }
}
