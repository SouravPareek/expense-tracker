import {
    getAllCategories,
    createCategory,
    deleteCategory,
    renameCategory,
    findVisibleCategoryByName,
} from "../models/category.model.js";

function parseId(value) {
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getCategories(req, res, next) {
    try {
        const { id } = req.user;

        const allCategories = await getAllCategories(id);

        const allCategoriesNormalized = allCategories.map((category) => ({
            ...category,
            is_custom: Boolean(category.is_custom),
        }));

        return res.status(200).json({
            message: "All categories retrieved successfully.",
            categories: allCategoriesNormalized,
        });
    } catch (err) {
        next(err);
    }
}

export async function createCategoryController(req, res, next) {
    try {
        const { categoryName } = req.body;
        const { id } = req.user;

        if (typeof categoryName !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const categoryNameNormalized = categoryName.trim().toLowerCase();

        if (!categoryNameNormalized) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (categoryNameNormalized.length > 50) {
            return res
                .status(400)
                .json({ message: "Name must be at most 50 characters" });
        }

        const existing = await findVisibleCategoryByName(
            categoryNameNormalized,
            id,
        );

        if (existing) {
            return res.status(409).json({
                message: "Category already exists.",
            });
        }

        const categoryId = await createCategory(categoryNameNormalized, id);

        return res.status(201).json({
            message: "Category created successfully",
            category: {
                id: categoryId,
                name: categoryNameNormalized,
            },
        });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Category already exists" });
        }
        next(err);
    }
}

export async function deleteCategoryController(req, res, next) {
    try {
        const categoryId = parseId(req.params.id);
        const userId = req.user.id;

        if (!categoryId) {
            return res.status(400).json({ message: "Invalid category id" });
        }

        const isDeleted = await deleteCategory(categoryId, userId);

        if (!isDeleted) {
            return res.status(404).json({
                message: "category not found",
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

export async function renameCategoryController(req, res, next) {
    try {
        const { categoryName } = req.body;
        const categoryId = parseId(req.params.id);
        const userId = req.user.id;

        if (!categoryId) {
            return res.status(400).json({ message: "Invalid category id" });
        }

        if (typeof categoryName !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const categoryNameNormalized = categoryName.trim().toLowerCase();

        if (!categoryNameNormalized) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (categoryNameNormalized.length > 50) {
            return res
                .status(400)
                .json({ message: "Name must be at most 50 characters" });
        }

        const row = await findVisibleCategoryByName(
            categoryNameNormalized,
            userId,
        );

        if (row && row.id !== categoryId) {
            return res.status(409).json({
                message: "Category already exists.",
            });
        }

        const affected = await renameCategory(
            categoryId,
            categoryNameNormalized,
            userId,
        );

        if (affected === 0) {
            return res.status(404).json({
                message: "Category Not found",
            });
        }

        return res.status(200).json({
            message: "category renamed successfully",
            category: {
                id: categoryId,
                name: categoryNameNormalized,
            },
        });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Category already exists" });
        }
        next(err);
    }
}