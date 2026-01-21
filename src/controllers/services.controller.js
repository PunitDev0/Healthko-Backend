import Service from '../models/Service.js';
import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
/**
 * GET /api/services
 * Fetch services (supports filters)
 */

export const getServices = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      minPrice,
      maxPrice,
      isActive = 'true',
      sort = 'price_desc',
      page = 1,
      limit = 6,
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    filter.isActive = isActive === 'true';

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    let query = Service.find(filter)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .skip(skip)
      .limit(Number(limit));

    if (sort === 'price_desc') query = query.sort({ price: -1 });
    if (sort === 'price_asc') query = query.sort({ price: 1 });

    const [services, total] = await Promise.all([
      query,
      Service.countDocuments(filter),
    ]);

    res.json({
      success: true,
      services,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};



/**
 * POST /api/services
 * Body:
 * - name
 * - price
 * - category (categoryId)
 * - subCategory (subCategoryId)
 */


export const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      duration,
      image,
      isActive,
    } = req.body;

    // ✅ Validate Category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }

    // ✅ Validate SubCategory belongs to Category
    const subCategoryExists = await SubCategory.findOne({
      _id: subCategory,
      category,
    });

    if (!subCategoryExists) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory does not belong to selected Category',
      });
    }

    const service = await Service.create({
      name,
      description,
      price,
      category,
      subCategory,
      duration,
      image,
      isActive,
    });

    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
    });
  }
};

