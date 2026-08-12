import SplashScreen from '@/components/splash/SplashScreen'
import HeroSection from '@/components/hero/HeroSection'
import MenuSection from '@/components/menu/MenuSection'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Home() {
  return (
    <main className="bg-white min-h-screen">
      <SplashScreen />
      <HeroSection />
      <MenuSection />
      <CartDrawer />
    </main>
  )
}
