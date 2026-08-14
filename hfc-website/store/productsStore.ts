import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { categories as defaultCategories, menuItems as defaultMenuItems } from '@/data/menuData'
import {
  syncProductToSupabase,
  deleteProductFromSupabase,
  fetchProductsFromSupabase,
} from '@/lib/supabaseSync'

export interface ProductItem {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  mrp: number | null
  imageUrl: string | null
  isVeg: boolean
  isAvailable: boolean
  isBestseller: boolean
  sortOrder: number
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  emoji: string
  sortOrder: number
}

interface ProductsStore {
  categories: ProductCategory[]
  items: ProductItem[]

  // Category actions
  addCategory: (name: string, emoji: string) => void
  renameCategory: (id: string, newName: string) => void
  deleteCategory: (id: string) => void
  reorderCategories: (newOrder: string[]) => void

  // Item actions
  addItem: (categoryId: string, item: Omit<ProductItem, 'id' | 'categoryId' | 'updatedAt'>) => void
  updateItem: (itemId: string, updates: Partial<ProductItem>) => void
  deleteItem: (itemId: string) => void
  toggleAvailability: (itemId: string) => void
  toggleBestseller: (itemId: string) => void

  // Supabase sync
  upsertProductFromSupabase: (item: ProductItem) => void
  removeProductFromSupabase: (id: string) => void
  fetchAndSyncProducts: () => Promise<void>

  // Selectors
  getAllItems: () => ProductItem[]
  getItemsByCategory: (categoryId: string) => ProductItem[]
  searchItems: (query: string) => ProductItem[]
}

// Seed categories from menuData
const seedCategories: ProductCategory[] = defaultCategories.map((c, idx) => ({
  id: c.id,
  name: c.label,
  emoji: c.emoji,
  sortOrder: idx,
}))

// Seed items from menuData
const seedItems: ProductItem[] = defaultMenuItems.map((item, idx) => ({
  id: item.id,
  categoryId: item.category,
  name: item.name,
  description: item.description,
  price: item.price,
  mrp: null,
  imageUrl: item.image || null,
  isVeg: item.dietaryTag === 'veg',
  isAvailable: true,
  isBestseller: item.isBestseller || false,
  sortOrder: idx,
  updatedAt: new Date().toISOString(),
}))

const generateId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const slugify = (name: string) =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      categories: seedCategories,
      items: seedItems,

      addCategory: (name: string, emoji: string) => {
        const id = slugify(name) || generateId()
        const newCat: ProductCategory = {
          id,
          name,
          emoji,
          sortOrder: get().categories.length,
        }
        set({ categories: [...get().categories, newCat] })
      },

      renameCategory: (id: string, newName: string) => {
        set({
          categories: get().categories.map(c => (c.id === id ? { ...c, name: newName } : c)),
        })
      },

      deleteCategory: (id: string) => {
        // Delete all items in this category from Supabase first
        const toDelete = get().items.filter(item => item.categoryId === id)
        toDelete.forEach(item => deleteProductFromSupabase(item.id))
        set({
          categories: get().categories.filter(c => c.id !== id),
          items: get().items.filter(item => item.categoryId !== id),
        })
      },

      reorderCategories: (newOrder: string[]) => {
        set({
          categories: get().categories.map(c => ({
            ...c,
            sortOrder: newOrder.indexOf(c.id),
          })),
        })
      },

      addItem: (categoryId: string, item) => {
        const newItem: ProductItem = {
          ...item,
          id: generateId(),
          categoryId,
          updatedAt: new Date().toISOString(),
        }
        set({ items: [...get().items, newItem] })
        syncProductToSupabase(newItem)
      },

      updateItem: (itemId: string, updates) => {
        const updated = get().items.map(item =>
          item.id === itemId
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        )
        set({ items: updated })
        const updatedItem = updated.find(i => i.id === itemId)
        if (updatedItem) syncProductToSupabase(updatedItem)
      },

      deleteItem: (itemId: string) => {
        set({ items: get().items.filter(item => item.id !== itemId) })
        deleteProductFromSupabase(itemId)
      },

      toggleAvailability: (itemId: string) => {
        const item = get().items.find(i => i.id === itemId)
        if (!item) return
        const updated = { ...item, isAvailable: !item.isAvailable, updatedAt: new Date().toISOString() }
        set({
          items: get().items.map(i => i.id === itemId ? updated : i),
        })
        syncProductToSupabase(updated)
      },

      toggleBestseller: (itemId: string) => {
        const item = get().items.find(i => i.id === itemId)
        if (!item) return
        const updated = { ...item, isBestseller: !item.isBestseller, updatedAt: new Date().toISOString() }
        set({
          items: get().items.map(i => i.id === itemId ? updated : i),
        })
        syncProductToSupabase(updated)
      },

      // Called by Realtime listener when a product changes in Supabase
      upsertProductFromSupabase: (item: ProductItem) => {
        const existing = get().items.find(i => i.id === item.id)
        if (existing) {
          set({ items: get().items.map(i => i.id === item.id ? item : i) })
        } else {
          set({ items: [...get().items, item] })
        }
      },

      // Called by Realtime listener when a product is deleted in Supabase
      removeProductFromSupabase: (id: string) => {
        set({ items: get().items.filter(i => i.id !== id) })
      },

      // Fetch all products from Supabase on first load (customer-facing menu)
      fetchAndSyncProducts: async () => {
        try {
          const fetched = await fetchProductsFromSupabase()
          
          // Self-healing: if the Supabase database is missing any of our default seed items,
          // automatically upload the missing seed items to Supabase so they are restored.
          const fetchedIds = new Set(fetched.map(i => i.id))
          const missingSeeds = seedItems.filter(item => !fetchedIds.has(item.id))
          
          if (missingSeeds.length > 0) {
            console.log(`Seeding ${missingSeeds.length} missing default products to Supabase...`)
            // Sync missing products sequentially
            for (const item of missingSeeds) {
              await syncProductToSupabase(item)
            }
            // Re-fetch all items after sync completes to get the updated database state
            const updatedFetched = await fetchProductsFromSupabase()
            set({ items: updatedFetched })
          } else {
            if (fetched && fetched.length > 0) {
              set({ items: fetched })
            }
          }
        } catch (err) {
          console.warn('Failed to fetch and sync products from Supabase:', err)
        }
      },

      getAllItems: () => get().items,

      getItemsByCategory: (categoryId: string) =>
        get().items.filter(item => item.categoryId === categoryId),

      searchItems: (query: string) => {
        const q = query.toLowerCase().trim()
        if (!q) return get().items
        return get().items.filter(
          item =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
        )
      },
    }),
    {
      name: 'hfc-products',
    }
  )
)
