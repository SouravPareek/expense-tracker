import express from 'express'
import identifyUser from '../middlewares/auth.middleware.js'
import { createCategoryController, deleteCategoryController, getCategories, renameCategoryController } from '../controllers/category.controller.js'

const categoryRouter = express.Router()

categoryRouter.use(identifyUser)

/**
 * @route GET /api/category
 * @desc List the categories the user can see (global plus their own)
 * @access protected
 */
categoryRouter.get('/', getCategories)


/**
 * @route POST /api/category
 * @desc Create a custom category
 * @access protected
 */
categoryRouter.post('/', createCategoryController)


/**
 * @route DELETE /api/category/:id
 * @desc Delete a custom category, moving its expenses to Uncategorized
 * @access protected
 */
categoryRouter.delete('/:id', deleteCategoryController)


/**
 * @route PATCH /api/category/:id
 * @desc Rename a custom category
 * @access protected
 */
categoryRouter.patch('/:id', renameCategoryController)


export default categoryRouter