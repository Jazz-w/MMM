const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const connectDb = require('../configuration/ConnectDB');

const categories = [
  {
    name: 'Orthopédiste',
    description: 'Produits orthopédiques et supports médicaux',
    slug: 'orthopediste',
    image: '/images/categories/orthopediste.jpg',
    metadata: {
      keywords: ['orthopédie', 'supports', 'médical', 'bandages', 'attelles'],
      seoDescription: 'Découvrez notre gamme de produits orthopédiques de haute qualité'
    }
  },
  {
    name: 'Solaire',
    description: 'Protection solaire et soins après-soleil',
    slug: 'solaire',
    image: '/images/categories/solaire.jpg',
    metadata: {
      keywords: ['solaire', 'protection', 'crème solaire', 'après-soleil'],
      seoDescription: 'Protégez votre peau avec notre sélection de produits solaires'
    }
  },
  {
    name: 'Hygiène',
    description: 'Produits d\'hygiène personnelle',
    slug: 'hygiene',
    image: '/images/categories/hygiene.jpg',
    metadata: {
      keywords: ['hygiène', 'soins', 'nettoyage', 'désinfection'],
      seoDescription: 'Tous vos produits d\'hygiène essentiels'
    }
  },
  {
    name: 'Cheveux',
    description: 'Soins capillaires et traitements',
    slug: 'cheveux',
    image: '/images/categories/cheveux.jpg',
    metadata: {
      keywords: ['cheveux', 'shampoing', 'soins capillaires', 'traitement'],
      seoDescription: 'Solutions complètes pour tous types de cheveux'
    }
  },
  {
    name: 'Corps',
    description: 'Soins du corps et bien-être',
    slug: 'corps',
    image: '/images/categories/corps.jpg',
    metadata: {
      keywords: ['corps', 'soins', 'crème', 'hydratation'],
      seoDescription: 'Prenez soin de votre corps avec nos produits sélectionnés'
    }
  },
  {
    name: 'Complément alimentaire',
    description: 'Vitamines, minéraux et suppléments nutritionnels',
    slug: 'complement-alimentaire',
    image: '/images/categories/complement-alimentaire.jpg',
    metadata: {
      keywords: ['complément', 'vitamines', 'minéraux', 'nutrition'],
      seoDescription: 'Compléments alimentaires pour votre bien-être quotidien'
    }
  },
  {
    name: 'MaPromo',
    description: 'Offres spéciales, packs et promotions',
    slug: 'mapromo',
    image: '/images/categories/mapromo.jpg',
    metadata: {
      keywords: ['promotion', 'offres', 'packs', 'réductions'],
      seoDescription: 'Découvrez nos offres spéciales et promotions exclusives'
    }
  }
];

const initializeCategories = async () => {
  try {
    await connectDb();
    console.log('Connected to database');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories initialized successfully:', createdCategories.map(cat => cat.name));

    process.exit(0);
  } catch (error) {
    console.error('Error initializing categories:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeCategories(); 