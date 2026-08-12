import { Category, MenuItem } from '@/types'

export const categories: Category[] = [
  { id: 'starters',     label: 'Starters',        emoji: '🍱' },
  { id: 'main-course',  label: 'Main Course',      emoji: '🍛' },
  { id: 'breads',       label: 'Breads',           emoji: '🍞' },
  { id: 'soups-salads', label: 'Salads & Soups',   emoji: '🥗' },
  { id: 'beverages',    label: 'Beverages',        emoji: '🥤' },
  { id: 'desserts',     label: 'Desserts',         emoji: '🍮' },
  { id: 'snacks',       label: 'Snacks',           emoji: '🍟' },
]

export const menuItems: MenuItem[] = [
  // STARTERS
  {
    id: 'st-1',
    name: 'Paneer Tikka',
    description: 'Smoky cottage cheese marinated in yogurt and spices, grilled in tandoor',
    price: 249,
    category: 'starters',
    dietaryTag: 'veg',
    isBestseller: true,
    imageKeyword: 'paneer+tikka',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'st-2',
    name: 'Chicken Seekh Kebab',
    description: 'Minced chicken with fresh herbs and spices, grilled on charcoal skewers',
    price: 299,
    category: 'starters',
    dietaryTag: 'non-veg',
    isBestseller: false,
    imageKeyword: 'chicken+kebab',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'st-3',
    name: 'Veg Spring Rolls',
    description: 'Crispy golden rolls stuffed with tossed seasonal vegetables and sauces',
    price: 179,
    category: 'starters',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'spring+rolls',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'st-4',
    name: 'Mutton Seekh',
    description: 'Juicy mutton kebabs loaded with bold masalas and caramelised onions',
    price: 349,
    category: 'starters',
    dietaryTag: 'non-veg',
    isBestseller: false,
    imageKeyword: 'mutton+kebab',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'st-5',
    name: 'Hara Bhara Kabab',
    description: 'Spinach and peas patty with paneer crumble, pan-seared golden and crispy',
    price: 199,
    category: 'starters',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'vegetable+kabab',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'st-6',
    name: 'Fish Amritsari',
    description: 'Battered fish in bold Amritsari spice mix, deep fried crisp and golden',
    price: 329,
    category: 'starters',
    dietaryTag: 'non-veg',
    isBestseller: true,
    imageKeyword: 'fried+fish',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'
  },

  // MAIN COURSE
  {
    id: 'mc-1',
    name: 'Butter Chicken',
    description: 'Classic North Indian chicken in a velvety tomato and cream gravy',
    price: 349,
    category: 'main-course',
    dietaryTag: 'non-veg',
    isBestseller: true,
    imageKeyword: 'butter+chicken',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'mc-2',
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils simmered overnight with butter and cream',
    price: 249,
    category: 'main-course',
    dietaryTag: 'veg',
    isBestseller: true,
    imageKeyword: 'dal+makhani',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'mc-3',
    name: 'Paneer Lababdar',
    description: 'Cottage cheese cubes in rich onion-cashew gravy with aromatic spices',
    price: 299,
    category: 'main-course',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'paneer+curry',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'mc-4',
    name: 'Mutton Rogan Josh',
    description: 'Kashmiri spiced mutton slow-cooked in bold red gravy, melt-in-mouth tender',
    price: 449,
    category: 'main-course',
    dietaryTag: 'non-veg',
    isBestseller: false,
    imageKeyword: 'mutton+curry',
    image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'mc-5',
    name: 'Chole Masala',
    description: 'Punjabi spiced chickpea curry with bold masala and tangy tamarind notes',
    price: 229,
    category: 'main-course',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'chole+masala',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'mc-6',
    name: 'Chicken Hyderabadi',
    description: 'Rich and aromatic Hyderabadi chicken in a deep spiced brown gravy',
    price: 379,
    category: 'main-course',
    dietaryTag: 'non-veg',
    isBestseller: false,
    imageKeyword: 'hyderabadi+chicken',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80'
  },

  // BREADS
  {
    id: 'br-1',
    name: 'Butter Naan',
    description: 'Soft tandoor-baked flatbread with a golden butter glaze on top',
    price: 49,
    category: 'breads',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'naan+bread',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'br-2',
    name: 'Garlic Roti',
    description: 'Whole wheat flatbread loaded with garlic-herb butter, baked fresh',
    price: 39,
    category: 'breads',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'garlic+roti',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'br-3',
    name: 'Lachha Paratha',
    description: 'Multi-layered flaky paratha shallow fried to a perfect golden crisp',
    price: 59,
    category: 'breads',
    dietaryTag: 'veg',
    isBestseller: true,
    imageKeyword: 'paratha',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'br-4',
    name: 'Stuffed Kulcha',
    description: 'Fluffy kulcha filled with spiced paneer or aloo, baked in tandoor fresh',
    price: 79,
    category: 'breads',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'kulcha',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'br-5',
    name: 'Roomali Roti',
    description: 'Paper-thin roti traditionally hand-tossed, soft and delicate',
    price: 35,
    category: 'breads',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'roomali+roti',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80'
  },

  // SOUPS & SALADS
  {
    id: 'ss-1',
    name: 'Tomato Shorba',
    description: 'Spiced Indian tomato soup with fresh coriander, served piping hot',
    price: 119,
    category: 'soups-salads',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'tomato+soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ss-2',
    name: 'Chicken Broth',
    description: 'Clear ginger-pepper chicken soup with aromatic herbs and spices',
    price: 149,
    category: 'soups-salads',
    dietaryTag: 'non-veg',
    isBestseller: false,
    imageKeyword: 'chicken+soup',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ss-3',
    name: 'Kachumber Salad',
    description: 'Diced cucumber, tomato, onion with chaat masala and fresh lemon',
    price: 99,
    category: 'soups-salads',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'indian+salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ss-4',
    name: 'Corn Palak Soup',
    description: 'Creamed spinach and sweet corn with mild spices and cream swirl',
    price: 129,
    category: 'soups-salads',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'spinach+soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ss-5',
    name: 'Greek-Style Salad',
    description: 'Olives, feta, cucumber, cherry tomatoes, red onion in olive oil dressing',
    price: 159,
    category: 'soups-salads',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'greek+salad',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
  },

  // BEVERAGES
  {
    id: 'bv-1',
    name: 'Mango Lassi',
    description: 'Thick blended mango yogurt drink, chilled and perfectly sweet',
    price: 119,
    category: 'beverages',
    dietaryTag: 'veg',
    isBestseller: true,
    imageKeyword: 'mango+lassi',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bv-2',
    name: 'Rose Sharbat',
    description: 'Rose syrup with chilled water and sabja seeds, deeply refreshing',
    price: 89,
    category: 'beverages',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'rose+drink',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bv-3',
    name: 'Masala Chaas',
    description: 'Spiced buttermilk with roasted cumin, coriander, and mint',
    price: 79,
    category: 'beverages',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'buttermilk+drink',
    image: 'https://images.unsplash.com/photo-1626078436896-b07248e3e449?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bv-4',
    name: 'Fresh Lime Soda',
    description: 'Sparkling or still lime with your choice of salt or sugar',
    price: 69,
    category: 'beverages',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'lime+soda',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bv-5',
    name: 'Cold Coffee',
    description: 'Rich blended coffee with full-cream milk, chilled and thick',
    price: 139,
    category: 'beverages',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'cold+coffee',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bv-6',
    name: 'Watermelon Cooler',
    description: 'Freshly pressed watermelon with mint and a squeeze of lime, chilled',
    price: 109,
    category: 'beverages',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'watermelon+juice',
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80'
  },

  // DESSERTS
  {
    id: 'ds-1',
    name: 'Gulab Jamun',
    description: 'Soft milk-solid balls soaked in fragrant rose syrup, served warm (2 pcs)',
    price: 99,
    category: 'desserts',
    dietaryTag: 'veg',
    isBestseller: true,
    imageKeyword: 'gulab+jamun',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ds-2',
    name: 'Ras Malai',
    description: 'Chenna patties in chilled saffron-cardamom milk, garnished with pistachios',
    price: 129,
    category: 'desserts',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'ras+malai',
    image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ds-3',
    name: 'Chocolate Brownie',
    description: 'Warm fudgy brownie served with a scoop of vanilla ice cream on the side',
    price: 159,
    category: 'desserts',
    dietaryTag: 'egg',
    isBestseller: true,
    imageKeyword: 'chocolate+brownie',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ds-4',
    name: 'Kheer',
    description: 'Creamy rice pudding slow-cooked with cardamom, saffron, and pistachios',
    price: 109,
    category: 'desserts',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'kheer+dessert',
    image: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ds-5',
    name: 'Kulfi Falooda',
    description: 'Traditional kulfi on vermicelli falooda with rose syrup and basil seeds',
    price: 149,
    category: 'desserts',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'kulfi+falooda',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80'
  },

  // SNACKS
  {
    id: 'sn-1',
    name: 'Samosa (2 pcs)',
    description: 'Crispy fried pastry filled with spiced potato and peas, with chutneys',
    price: 59,
    category: 'snacks',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'samosa',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sn-2',
    name: 'Pav Bhaji',
    description: 'Mumbai-style spiced bhaji with buttered soft pav buns and onion',
    price: 129,
    category: 'snacks',
    dietaryTag: 'veg',
    isBestseller: true,
    imageKeyword: 'pav+bhaji',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sn-3',
    name: 'Vada Pav',
    description: 'Spiced potato fritter in a soft bun with green and tamarind chutneys',
    price: 49,
    category: 'snacks',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'vada+pav',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sn-4',
    name: 'Aloo Tikki Chaat',
    description: 'Crispy potato patties topped with yogurt, chutneys, sev, and pomegranate',
    price: 99,
    category: 'snacks',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'aloo+tikki+chaat',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sn-5',
    name: 'French Fries',
    description: 'Golden shoestring fries with house seasoning and dip of your choice',
    price: 89,
    category: 'snacks',
    dietaryTag: 'veg',
    isBestseller: false,
    imageKeyword: 'french+fries',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80'
  },
]
