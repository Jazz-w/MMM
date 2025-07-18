const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://jazz:2651993gs4A@cluster0.vdgx2bk.mongodb.net/parapharm_ecommerce?retryWrites=true&w=majority&appName=Cluster0';

const categories = [
  {
    name: 'Pain Relief & Fever',
    slug: 'pain-relief-fever',
    description: 'Medications for pain management and fever reduction'
  },
  {
    name: 'Cold & Flu',
    slug: 'cold-and-flu',
    description: 'Remedies for cold and flu symptoms'
  },
  {
    name: 'Vitamins & Supplements',
    slug: 'vitamins-supplements',
    description: 'Essential vitamins, minerals, and dietary supplements'
  },
  {
    name: 'First Aid',
    slug: 'first-aid',
    description: 'First aid supplies and treatments'
  },
  {
    name: 'Skin Care',
    slug: 'skin-care',
    description: 'Dermatological products and skin treatments'
  },
  {
    name: 'Digestive Health',
    slug: 'digestive-health',
    description: 'Products for digestive system and gut health'
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Hygiene and personal care products'
  },
  {
    name: 'Mother & Baby',
    slug: 'mother-and-baby',
    description: 'Products for maternal and infant care'
  }
];

const sampleProducts = [
  {
    name: 'Ibuprofen 400mg',
    description: 'Anti-inflammatory pain relief tablets',
    price: 6.99,
    brand: 'Nurofen',
    stock: 150,
    images: [{
      url: 'https://example.com/images/ibuprofen.jpg',
      isMain: true
    }],
    specifications: {
      weight: '50g',
      dimensions: '10x5x3cm',
      ingredients: ['Ibuprofen', 'Cellulose', 'Lactose'],
      usage: 'Take 1 tablet every 4-6 hours after food',
      warnings: ['Do not exceed 3 tablets in 24 hours', 'Not suitable for children under 12'],
      storageInstructions: 'Store below 25°C in a dry place'
    },
    tags: ['pain relief', 'anti-inflammatory', 'fever']
  },
  {
    name: 'Vitamin D3 2000IU',
    description: 'High strength vitamin D supplements for bone health',
    price: 15.99,
    brand: 'Now Foods',
    stock: 80,
    images: [{
      url: 'https://example.com/images/vitamin-d.jpg',
      isMain: true
    }],
    specifications: {
      weight: '100g',
      dimensions: '12x6x6cm',
      ingredients: ['Vitamin D3', 'Olive Oil', 'Gelatin'],
      usage: 'Take 1 softgel daily with food',
      warnings: ['Do not exceed recommended dose'],
      storageInstructions: 'Store in a cool, dry place'
    },
    tags: ['vitamins', 'bone health', 'immune support']
  },
  {
    name: 'Advanced First Aid Kit',
    description: 'Comprehensive first aid kit for home and travel',
    price: 34.99,
    brand: 'SafeCare',
    stock: 40,
    images: [{
      url: 'https://example.com/images/first-aid-kit.jpg',
      isMain: true
    }],
    specifications: {
      weight: '800g',
      dimensions: '25x20x10cm',
      ingredients: [],
      usage: 'Follow first aid guidelines included in the kit',
      warnings: ['Replace items after use', 'Check expiry dates regularly'],
      storageInstructions: 'Keep in an easily accessible location'
    },
    tags: ['first aid', 'emergency', 'medical supplies']
  },
  {
    name: 'Probiotic Complex',
    description: 'Advanced probiotic supplement for gut health',
    price: 29.99,
    brand: 'BioBalance',
    stock: 60,
    images: [{
      url: 'https://example.com/images/probiotic.jpg',
      isMain: true
    }],
    specifications: {
      weight: '75g',
      dimensions: '8x8x15cm',
      ingredients: ['Multiple probiotic strains', 'Prebiotic fiber'],
      usage: 'Take 1 capsule daily before breakfast',
      warnings: ['Store in refrigerator after opening'],
      storageInstructions: 'Keep refrigerated'
    },
    tags: ['digestive health', 'probiotics', 'gut flora']
  },
  {
    name: 'Hydrating Face Cream',
    description: 'Deep moisturizing face cream with hyaluronic acid',
    price: 22.99,
    brand: 'CeraVe',
    stock: 70,
    images: [{
      url: 'https://example.com/images/face-cream.jpg',
      isMain: true
    }],
    specifications: {
      weight: '50ml',
      dimensions: '7x7x5cm',
      ingredients: ['Hyaluronic Acid', 'Ceramides', 'Glycerin'],
      usage: 'Apply twice daily to clean face',
      warnings: ['For external use only', 'Avoid contact with eyes'],
      storageInstructions: 'Store at room temperature'
    },
    tags: ['skin care', 'moisturizer', 'facial care']
  },
  {
    name: 'Omega-3 Fish Oil',
    description: 'High-strength omega-3 supplements for heart health',
    price: 19.99,
    brand: 'Nordic Naturals',
    stock: 90,
    images: [{
      url: 'https://example.com/images/fish-oil.jpg',
      isMain: true
    }],
    specifications: {
      weight: '120g',
      dimensions: '10x6x6cm',
      ingredients: ['Fish Oil', 'EPA', 'DHA', 'Vitamin E'],
      usage: 'Take 2 softgels daily with meals',
      warnings: ['Contains fish derivatives', 'Consult doctor if on blood thinners'],
      storageInstructions: 'Store in a cool, dry place'
    },
    tags: ['supplements', 'heart health', 'brain health']
  },
  {
    name: 'Baby Diaper Rash Cream',
    description: 'Protective barrier cream for diaper rash',
    price: 8.99,
    brand: 'Sudocrem',
    stock: 100,
    images: [{
      url: 'https://example.com/images/diaper-cream.jpg',
      isMain: true
    }],
    specifications: {
      weight: '125g',
      dimensions: '8x8x8cm',
      ingredients: ['Zinc Oxide', 'Lanolin', 'Benzyl Alcohol'],
      usage: 'Apply thin layer to clean, dry skin at each diaper change',
      warnings: ['For external use only', 'Discontinue if irritation occurs'],
      storageInstructions: 'Store at room temperature'
    },
    tags: ['baby care', 'skin protection', 'diaper rash']
  },
  {
    name: 'Cold & Flu Relief Sachets',
    description: 'Hot drink powder for relief of cold and flu symptoms',
    price: 7.99,
    brand: 'Lemsip',
    stock: 120,
    images: [{
      url: 'https://example.com/images/cold-relief.jpg',
      isMain: true
    }],
    specifications: {
      weight: '150g',
      dimensions: '15x10x5cm',
      ingredients: ['Paracetamol', 'Phenylephrine', 'Vitamin C'],
      usage: 'Dissolve one sachet in hot water, take every 4-6 hours',
      warnings: ['Do not exceed 4 sachets in 24 hours', 'Not suitable for children under 12'],
      storageInstructions: 'Store in a dry place below 25°C'
    },
    tags: ['cold and flu', 'decongestant', 'pain relief']
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Insert categories
    const createdCategories = await Category.insertMany(categories);

    // Create a category map for easy reference
    const categoryMap = {
      'Pain Relief & Fever': createdCategories[0]._id,
      'Cold & Flu': createdCategories[1]._id,
      'Vitamins & Supplements': createdCategories[2]._id,
      'First Aid': createdCategories[3]._id,
      'Skin Care': createdCategories[4]._id,
      'Digestive Health': createdCategories[5]._id,
      'Personal Care': createdCategories[6]._id,
      'Mother & Baby': createdCategories[7]._id
    };

    // Map products to appropriate categories based on their tags
    const productsWithCategories = sampleProducts.map(product => {
      let categoryId;
      if (product.tags.includes('pain relief')) categoryId = categoryMap['Pain Relief & Fever'];
      else if (product.tags.includes('cold and flu')) categoryId = categoryMap['Cold & Flu'];
      else if (product.tags.includes('vitamins') || product.tags.includes('supplements')) categoryId = categoryMap['Vitamins & Supplements'];
      else if (product.tags.includes('first aid')) categoryId = categoryMap['First Aid'];
      else if (product.tags.includes('skin care')) categoryId = categoryMap['Skin Care'];
      else if (product.tags.includes('digestive health')) categoryId = categoryMap['Digestive Health'];
      else if (product.tags.includes('personal care')) categoryId = categoryMap['Personal Care'];
      else if (product.tags.includes('baby care')) categoryId = categoryMap['Mother & Baby'];
      
      return {
        ...product,
        category: categoryId || createdCategories[0]._id // Default to first category if no match
      };
    });

    // Insert products
    await Product.insertMany(productsWithCategories);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();