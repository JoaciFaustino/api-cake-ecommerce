import { Request, Response } from "express";
import { CategoryService } from "../services/categoryService";
import { ApiError } from "../utils/ApiError";
import { ICategory } from "../@types/Category";

export class CategoryController {
  constructor() {}

  async getAll(req: Request, res: Response) {
    const categoryService = new CategoryService();
    const categories: ICategory[] | undefined = await categoryService.getAll();

    if (!categories) throw new ApiError("failed to get the categories", 500);

    return res.status(200).send({
      categories
    });
  }

  async create(req: Request, res: Response) {
    const { category } = req.body;

    if (!category || typeof category !== "string") {
      throw new ApiError("category is required", 400);
    }

    const categoryService = new CategoryService();
    const categoryCreated = await categoryService.create(category);

    if (!categoryCreated) {
      throw new ApiError("failed to create the category", 500);
    }

    return res.status(200).send({
      message: "category created sucessfully",
      category: categoryCreated
    });
  }
}
