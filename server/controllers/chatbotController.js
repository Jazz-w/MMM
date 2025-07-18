const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

// Store information - you can modify this based on your actual store details
const STORE_INFO = {
  locations: [
    {
      name: "Magasin Principal - Tunis Centre",
      address: "Avenue Habib Bourguiba, Tunis 1000, Tunisie",
      phone: "+216 71 123 456",
      hours: "Lun-Sam : 8h00-20h00, Dim : 9h00-18h00",
      services: ["Pharmacie", "Cosmétiques", "Produits de Santé", "Soins Bébé"]
    },
    {
      name: "Succursale - Lafayette",
      address: "Centre Commercial Lafayette, Tunis 1002, Tunisie", 
      phone: "+216 71 789 012",
      hours: "Lun-Dim : 9h00-21h00",
      services: ["Pharmacie", "Cosmétiques", "Produits de Santé"]
    }
  ],
  totalStores: 2,
  mainContact: "+216 71 123 456",
  email: "info@parapharmacie.tn",
  website: "www.parapharmacie.tn"
};

// Intent classification patterns (French)
const INTENT_PATTERNS = {
  promotions_current: [
    'promotions maintenant', 'promotions actuelles', 'en solde', 'remises disponibles',
    'produits en promotion', 'offres actuelles', 'offres spéciales', 'quelles promotions',
    'articles en solde', 'produits réduits', 'articles promotionnels', 'promotion', 'promo',
    'solde', 'réduction', 'discount', 'offre'
  ],
  promotions_upcoming: [
    'quand promotions', 'promotions futures', 'prochaines soldes', 'prochaine promotion',
    'quand solde', 'calendrier promotions', 'offres futures', 'prochaines offres',
    'futures promotions', 'quand les soldes'
  ],
  product_availability: [
    'disponible', 'en stock', 'stock', 'inventaire', 'avez-vous',
    'est disponible', 'disponibilité', 'rupture stock', 'produit disponible',
    'vous avez', 'est-ce que vous avez', 'y a-t-il'
  ],
  store_location: [
    'où situé', 'adresse', 'emplacement', 'où êtes-vous', 'adresse magasin',
    'où est magasin', 'trouver magasin', 'lieu magasin', 'emplacement succursale',
    'où vous trouvez', 'localisation', 'où aller'
  ],
  store_count: [
    'combien magasins', 'plusieurs magasins', 'plus d\'un', 'succursales',
    'combien emplacements', 'nombre magasins', 'autres emplacements',
    'avez plusieurs', 'combien de points de vente'
  ],
  store_hours: [
    'heures ouverture', 'quand ouvert', 'horaires magasin', 'quelle heure', 'ouvert jusqu\'à',
    'heures travail', 'horaires', 'heure ouverture', 'heure fermeture',
    'quand fermé', 'horaires d\'ouverture'
  ],
  contact_info: [
    'contact', 'numéro téléphone', 'téléphone', 'appeler', 'coordonnées',
    'tél', 'email', 'comment contacter', 'service client', 'joindre'
  ],
  product_search: [
    'trouver produit', 'chercher', 'recherche', 'besoin', 'acheter',
    'produit', 'où puis-je trouver', 'vendez-vous', 'avez-vous',
    'je cherche', 'il me faut'
  ],
  categories: [
    'quelles catégories', 'types produits', 'que vendez-vous', 'catégories disponibles',
    'sections', 'départements', 'quels produits', 'catégories produits',
    'rayons', 'gammes'
  ],
  help_navigation: [
    'aide', 'comment', 'naviguer', 'utiliser site', 'trouver', 'où',
    'comment faire', 'assistance', 'guide', 'tutoriel', 'aider'
  ]
};

// Utility function to classify user intent
const classifyIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern)) {
        return intent;
      }
    }
  }
  
  return 'general';
};

// Extract product name from message (French)
const extractProductName = (message) => {
  // Simple extraction - look for words after French keywords
  const patterns = [
    /(?:pour|de|trouver|cherche|besoin|veux|recherche)\s+(.+?)(?:\?|$|\.)/i,
    /(?:est|sont)\s+(.+?)\s+(?:disponible|en stock)/i,
    /(?:avez-vous|vous avez|y a-t-il)\s+(.+?)(?:\?|$|\.)/i,
    /(?:je cherche|il me faut|je veux)\s+(.+?)(?:\?|$|\.)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
};

// Main chatbot response handler
exports.processChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un message valide'
      });
    }

    const intent = classifyIntent(message);
    let response = {};

    switch (intent) {
      case 'promotions_current':
        response = await getCurrentPromotions();
        break;
        
      case 'promotions_upcoming':
        response = await getUpcomingPromotions();
        break;
        
      case 'product_availability':
        const productName = extractProductName(message);
        response = await checkProductAvailability(productName);
        break;
        
      case 'store_location':
        response = getStoreLocations();
        break;
        
      case 'store_count':
        response = getStoreCount();
        break;
        
      case 'store_hours':
        response = getStoreHours();
        break;
        
      case 'contact_info':
        response = getContactInfo();
        break;
        
      case 'product_search':
        const searchTerm = extractProductName(message);
        response = await searchProducts(searchTerm);
        break;
        
      case 'categories':
        response = await getProductCategories();
        break;
        
      case 'help_navigation':
        response = getNavigationHelp();
        break;
        
      default:
        response = getGeneralHelp();
    }

    res.json({
      success: true,
      intent,
      response: response.text,
      data: response.data || null,
      suggestions: response.suggestions || []
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Désolé, j\'ai rencontré une erreur en traitant votre message. Veuillez réessayer.'
    });
  }
};

// Handler functions for different intents

const getCurrentPromotions = async () => {
  try {
    const now = new Date();
    const promotionalProducts = await Product.find({
      isActive: true,
      'discount.percentage': { $gt: 0 },
      'discount.startDate': { $lte: now },
      'discount.endDate': { $gte: now }
    })
    .populate('category', 'name')
    .limit(10)
    .sort({ 'discount.percentage': -1 });

    if (promotionalProducts.length === 0) {
      return {
        text: "Désolé, il n'y a pas de promotions actives en ce moment. Revenez bientôt pour de nouvelles offres !",
        suggestions: ["Voir tous les produits", "Parcourir les catégories", "Nous contacter"]
      };
    }

    const promoText = promotionalProducts.map(product => 
      `• ${product.name} - ${product.discount.percentage}% de réduction (était ${product.price}€, maintenant ${product.getDiscountedPrice().toFixed(2)}€)`
    ).join('\n');

    return {
      text: `🎉 Promotions Actuelles :\n\n${promoText}\n\nDépêchez-vous ! Ces offres ne dureront pas longtemps !`,
      data: promotionalProducts,
      suggestions: ["Voir les détails", "Ajouter au panier", "Parcourir plus de produits"]
    };
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return {
      text: "Désolé, je n'ai pas pu récupérer les promotions actuelles. Veuillez réessayer plus tard.",
      suggestions: ["Parcourir les produits", "Contacter le support"]
    };
  }
};

const getUpcomingPromotions = async () => {
  try {
    const now = new Date();
    const upcomingPromotions = await Product.find({
      isActive: true,
      'discount.percentage': { $gt: 0 },
      'discount.startDate': { $gt: now }
    })
    .populate('category', 'name')
    .limit(5)
    .sort({ 'discount.startDate': 1 });

    if (upcomingPromotions.length === 0) {
      return {
        text: "Aucune promotion à venir n'est encore programmée. Suivez-nous pour rester informé des nouvelles offres !",
        suggestions: ["Voir les promotions actuelles", "Parcourir les produits", "Nous contacter"]
      };
    }

    const upcomingText = upcomingPromotions.map(product => {
      const startDate = new Date(product.discount.startDate).toLocaleDateString('fr-FR');
      return `• ${product.name} - ${product.discount.percentage}% de réduction à partir du ${startDate}`;
    }).join('\n');

    return {
      text: `📅 Promotions À Venir :\n\n${upcomingText}\n\nMarquez votre calendrier !`,
      data: upcomingPromotions,
      suggestions: ["Programmer des rappels", "Voir les promotions actuelles", "Parcourir les catégories"]
    };
  } catch (error) {
    console.error('Error fetching upcoming promotions:', error);
    return {
      text: "Désolé, je n'ai pas pu récupérer les promotions à venir. Veuillez réessayer plus tard.",
      suggestions: ["Voir les promotions actuelles", "Contacter le support"]
    };
  }
};

const checkProductAvailability = async (productName) => {
  if (!productName) {
    return {
      text: "Veuillez préciser quel produit vous recherchez. Par exemple : 'La vitamine C est-elle disponible ?'",
      suggestions: ["Parcourir les produits", "Voir les catégories", "Rechercher des produits"]
    };
  }

  try {
    const products = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: productName, $options: 'i' } },
            { description: { $regex: productName, $options: 'i' } },
            { brand: { $regex: productName, $options: 'i' } },
            { tags: { $regex: productName, $options: 'i' } }
          ]
        }
      ]
    })
    .populate('category', 'name')
    .limit(5);

    if (products.length === 0) {
      return {
        text: `Désolé, je n'ai trouvé aucun produit correspondant à "${productName}". Essayez un autre terme de recherche ou parcourez nos catégories.`,
        suggestions: ["Parcourir les catégories", "Voir tous les produits", "Nous contacter"]
      };
    }

    const availabilityText = products.map(product => {
      const stockStatus = product.stock > 0 ? 
        `✅ En Stock (${product.stock} disponibles)` : 
        '❌ Rupture de Stock';
      return `• ${product.name} - ${stockStatus} - ${product.price}€`;
    }).join('\n');

    return {
      text: `Voici ce que j'ai trouvé pour "${productName}" :\n\n${availabilityText}`,
      data: products,
      suggestions: ["Voir les détails", "Ajouter au panier", "Rechercher plus de produits"]
    };
  } catch (error) {
    console.error('Error checking product availability:', error);
    return {
      text: "Désolé, je n'ai pas pu vérifier la disponibilité des produits en ce moment. Veuillez réessayer plus tard.",
      suggestions: ["Parcourir les produits", "Contacter le support"]
    };
  }
};

const getStoreLocations = () => {
  const locationsText = STORE_INFO.locations.map((location, index) => 
    `📍 ${location.name}\n${location.address}\n📞 ${location.phone}\n🕒 ${location.hours}\n`
  ).join('\n');

  return {
    text: `Nous avons ${STORE_INFO.totalStores} emplacements :\n\n${locationsText}`,
    data: STORE_INFO.locations,
    suggestions: ["Obtenir l'itinéraire", "Appeler le magasin", "Voir les horaires", "Informations de contact"]
  };
};

const getStoreCount = () => {
  return {
    text: `Oui ! Nous avons ${STORE_INFO.totalStores} magasins pour mieux vous servir :\n\n• ${STORE_INFO.locations[0].name}\n• ${STORE_INFO.locations[1].name}\n\nVisitez l'emplacement le plus pratique pour vous !`,
    data: STORE_INFO.locations,
    suggestions: ["Voir les emplacements", "Obtenir l'itinéraire", "Horaires des magasins", "Informations de contact"]
  };
};

const getStoreHours = () => {
  const hoursText = STORE_INFO.locations.map(location => 
    `🏪 ${location.name}\n🕒 ${location.hours}`
  ).join('\n\n');

  return {
    text: `Nos horaires d'ouverture :\n\n${hoursText}`,
    data: STORE_INFO.locations,
    suggestions: ["Voir les emplacements", "Appeler le magasin", "Obtenir l'itinéraire"]
  };
};

const getContactInfo = () => {
  return {
    text: `📞 Informations de Contact :\n\nTéléphone Principal : ${STORE_INFO.mainContact}\nEmail : ${STORE_INFO.email}\nSite Web : ${STORE_INFO.website}\n\nVous pouvez également visiter l'un de nos ${STORE_INFO.totalStores} emplacements pour une assistance en personne !`,
    data: STORE_INFO,
    suggestions: ["Voir les emplacements", "Horaires des magasins", "Contact d'urgence"]
  };
};

const searchProducts = async (searchTerm) => {
  if (!searchTerm) {
    return {
      text: "Quel produit recherchez-vous ? Je peux vous aider à trouver des articles spécifiques dans notre inventaire.",
      suggestions: ["Parcourir les catégories", "Voir les promotions", "Produits vedettes"]
    };
  }

  try {
    const products = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { brand: { $regex: searchTerm, $options: 'i' } },
            { tags: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    })
    .populate('category', 'name')
    .limit(8)
    .sort({ averageRating: -1 });

    if (products.length === 0) {
      return {
        text: `Aucun produit trouvé pour "${searchTerm}". Essayez des mots-clés différents ou parcourez nos catégories.`,
        suggestions: ["Parcourir les catégories", "Voir tous les produits", "Nous contacter"]
      };
    }

    const productsText = products.slice(0, 5).map(product => 
      `• ${product.name} - ${product.price}€ (${product.category.name})`
    ).join('\n');

    return {
      text: `Trouvé ${products.length} produits pour "${searchTerm}" :\n\n${productsText}${products.length > 5 ? '\n\n...et plus encore !' : ''}`,
      data: products,
      suggestions: ["Voir les détails", "Ajouter au panier", "Affiner la recherche", "Parcourir la catégorie"]
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      text: "Désolé, je n'ai pas pu rechercher des produits en ce moment. Veuillez réessayer plus tard.",
      suggestions: ["Parcourir les catégories", "Contacter le support"]
    };
  }
};

const getProductCategories = async () => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .limit(10);

    const categoriesText = categories.map(category => 
      `• ${category.name} - ${category.description}`
    ).join('\n');

    return {
      text: `Nos catégories de produits :\n\n${categoriesText}`,
      data: categories,
      suggestions: ["Parcourir la catégorie", "Rechercher des produits", "Voir les promotions"]
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      text: "Désolé, je n'ai pas pu récupérer nos catégories en ce moment. Veuillez réessayer plus tard.",
      suggestions: ["Parcourir les produits", "Contacter le support"]
    };
  }
};

const getNavigationHelp = () => {
  return {
    text: `🧭 Aide à la Navigation :\n\n• Parcourir les produits par catégorie\n• Utiliser la barre de recherche pour trouver des articles spécifiques\n• Consulter les promotions actuelles\n• Voir votre panier et liste de souhaits\n• Suivre vos commandes\n• Mettre à jour votre profil\n\nQue souhaitez-vous faire ?`,
    suggestions: ["Parcourir les produits", "Rechercher des produits", "Voir le panier", "Mes commandes", "Mon compte"]
  };
};

const getGeneralHelp = () => {
  return {
    text: `👋 Bonjour ! Je suis là pour vous aider à naviguer dans notre pharmacie. Je peux vous assister avec :\n\n• Trouver les promotions et offres actuelles\n• Vérifier la disponibilité des produits\n• Emplacements et horaires des magasins\n• Recherche de produits et catégories\n• Aide à la navigation\n\nComment puis-je vous aider aujourd'hui ?`,
    suggestions: ["Promotions actuelles", "Trouver des produits", "Emplacements des magasins", "Parcourir les catégories", "Informations de contact"]
  };
};

// Get quick suggestions based on user patterns
exports.getQuickSuggestions = async (req, res) => {
  try {
    const suggestions = [
      { text: "Quelles promotions sont disponibles maintenant ?", type: "promotions" },
      { text: "Où sont situés vos magasins ?", type: "location" },
      { text: "Avez-vous des suppléments vitaminés ?", type: "products" },
      { text: "Quels sont vos horaires d'ouverture ?", type: "hours" },
      { text: "Comment puis-je vous contacter ?", type: "contact" }
    ];

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des suggestions'
    });
  }
}; 