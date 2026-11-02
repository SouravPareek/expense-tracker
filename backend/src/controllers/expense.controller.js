import { PAYMENT_METHODS } from "../config/constants.js";
import { findVisibleCategoryById } from "../models/category.model.js";
import { createExpense } from "../models/expense.model.js";

function parseId(value) {
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
}

function isValidDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed.toISOString().slice(0, 10) === value;
}

export async function createExpenseController(req, res, next) {
    try {
        const { amount, description, date, paymentMethod } = req.body;
        const userId = req.user.id;
        const categoryId = parseId(req.body.categoryId);

        const method = paymentMethod === undefined ? "other" : paymentMethod;

        if (
            typeof amount !== "number" ||
            typeof description !== "string" ||
            !isValidDate(date) ||
            categoryId === null ||
            typeof method !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid input",
            });
        }

        const trimmedDescription = description.trim();
        const trimmedPaymentMethod = method.trim();

        const validAmount =
            Number.isFinite(amount) &&
            amount > 0 &&
            amount <= 99999999.99 &&
            Math.round(amount * 100) / 100 === amount;

        if (
            !validAmount||
            trimmedDescription.length === 0 ||
            trimmedDescription.length > 255 ||
            !PAYMENT_METHODS.includes(trimmedPaymentMethod)
        ) {
            return res.status(400).json({
                message: "Invalid input",
            });
        }

        const categoryCheck = await findVisibleCategoryById(categoryId, userId);

        if (!categoryCheck) {
            return res.status(400).json({
                message: "Invalid category",
            });
        }

        const expenseId = await createExpense(
            categoryId,
            amount,
            trimmedDescription,
            date,
            trimmedPaymentMethod,
            userId,
        );

        return res.status(201).json({
            message: "Expense added successfully",
            expense: {
                id: expenseId,
                userId: userId,
                categoryId: categoryId,
                amount: amount,
                description: trimmedDescription,
                date: date,
                paymentMethod: trimmedPaymentMethod,
            },
        });
    } catch (err) {
        next(err);
    }
}

// export async function listExpensesController(req, res, next){
//     try{
//         const userId = req.user.id

//     }catch(err){
//         next(err)
//     }
// }

// export async function updateExpenseController(req, res, next){
//     try{
//         const {categoryId, amount, description, paymentMethod, expenseDate} = req.body
//         const expenseId = parseId(req.params.id)
//         const userId = req.user.id

//         if(!(await findVisibleCategoryById(categoryId, userId))){
//             return res.status(400).json({
//                 message: "Invalid category"
//             })
//         }

//     }catch(err){
//         next(err)
//     }
// }

// export async function deleteExpenseController(req, res, next){
//     try{
//         const {expenseId} = req.body

//     }catch(err){
//         next(err)
//     }
// }
