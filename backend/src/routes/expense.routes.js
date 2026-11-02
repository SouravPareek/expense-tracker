import express from 'express'
import identifyUser from '../middlewares/auth.middleware.js'
import { createExpenseController} from '../controllers/expense.controller.js'

const expenseRouter = express.Router()

expenseRouter.use(identifyUser)


/**
 * @route POST /api/expenses
 * @desc Create an expense
 * @access protected
 */
expenseRouter.post('/', createExpenseController)


// /**
//  * @route GET /api/expenses
//  * @desc List with filters and pagination
//  * @access protected
//  */
// expenseRouter.get('/', listExpensesController)


// /**
//  * @route PATCH /api/expenses/:id
//  * @desc Edit an expense
//  * @access protected
//  */
// expenseRouter.patch('/:id', updateExpenseController)


// /**
//  * @route DELETE /api/expenses/:id
//  * @desc Delete an  expense
//  * @access protected
//  */
// expenseRouter.delete('/:id', deleteExpenseController)


export default expenseRouter