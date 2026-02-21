import SubCategory from '../models/SubCategory.js';
import Category from '../models/Category.js';

/**
 * POST /api/subcategories
 * Create sub-category
 */
export const createSubCategory = async (req, res) => {
  try {
    const { name, slug, category, description, imageUrl, type, isActive } = req.body;

    // 🔴 Validation
    if (!name || !slug || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, slug and category are required',
      });
    }

    // 🔴 Check parent category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category id',
      });
    }

    // 🔴 Duplicate check
    const exists = await SubCategory.findOne({
      $or: [{ name }, { slug }],
      category,
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'SubCategory already exists for this category',
      });
    }

    const subCategory = await SubCategory.create({
      name,
      slug,
      category,
      description,
      imageUrl,
      type,
      isActive,
    });

    res.status(201).json({
      success: true,
      subCategory,
    });
  } catch (error) {
    console.error('Create subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subcategory',
    });
  }
};



/**
 * GET /api/subcategories
 * Optional filters:
 * - category (categoryId)
 * - isActive
 */
export const getSubCategories = async (req, res) => {
  try {
    const { category, type, isActive = 'true', grouped = 'false' } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const subCategories = await SubCategory.find(filter)
      .populate('category', 'name slug')
      .sort({ name: 1 });

    // Handle grouped response
    if (grouped === 'true') {
      const groupedData = {
        symptoms: subCategories.filter(s => s.type === 'symptoms'),
        categories: subCategories.filter(s => s.type === 'categories'),
        others: subCategories.filter(s => s.type !== 'symptoms' && s.type !== 'categories')
      };

      return res.status(200).json({
        success: true,
        count: subCategories.length,
        data: groupedData
      });
    }

    res.status(200).json({
      success: true,
      count: subCategories.length,
      subCategories,
    });
  } catch (error) {
    console.error('Fetch subcategories error:', error);
    res.status(500).json({
      success: false,
      message: error.name === 'CastError' ? 'Invalid Category ID format' : 'Failed to fetch subcategories',
    });
  }
};

