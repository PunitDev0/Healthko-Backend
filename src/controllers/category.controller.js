import Category from '../models/Category.js';

/**
 * POST /api/categories
 * Create new category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, isActive } = req.body;

    // 🔴 Basic validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required',
      });
    }

    // 🔴 Check duplicate
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists',
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      isActive,
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
    });
  }
};


export const getCategories = async (req, res) => {
  try {
    const { isActive = 'true' } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const categories = await Category.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
};