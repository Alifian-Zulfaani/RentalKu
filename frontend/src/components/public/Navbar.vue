<template>
  <nav class="navbar" :class="{ scrolled: isScrolled, 'menu-open': menuOpen }">
    <div class="container navbar-inner">
      <router-link to="/" class="navbar-brand">
        <div class="brand-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#brandGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <defs>
              <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#7c3aed"/>
                <stop offset="100%" stop-color="#3b82f6"/>
              </linearGradient>
            </defs>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <span class="brand-text">Rental<span class="text-gradient">Ku</span></span>
      </router-link>

      <div class="navbar-links" :class="{ active: menuOpen }">
        <a href="#fitur" @click="closeMenu">Fitur</a>
        <a href="#harga" @click="closeMenu">Harga</a>
        <a href="#testimoni" @click="closeMenu">Testimoni</a>
        <a href="#faq" @click="closeMenu">FAQ</a>
      </div>

      <div class="navbar-actions">
        <button class="theme-toggle" @click="themeStore.toggleTheme" aria-label="Toggle theme">
          <Sun v-if="themeStore.isDark" :size="20" />
          <Moon v-else :size="20" />
        </button>
        <router-link to="/admin/login" class="btn btn-secondary btn-sm">Masuk</router-link>
        <router-link to="/order" class="btn btn-primary btn-sm">Mulai Sekarang</router-link>
      </div>

      <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile menu overlay -->
    <div class="mobile-menu" v-if="menuOpen" @click="closeMenu">
      <div class="mobile-menu-content" @click.stop>
        <a href="#fitur" @click="closeMenu">Fitur</a>
        <a href="#harga" @click="closeMenu">Harga</a>
        <a href="#testimoni" @click="closeMenu">Testimoni</a>
        <a href="#faq" @click="closeMenu">FAQ</a>
        <div class="mobile-menu-actions">
          <button class="btn btn-secondary btn-block theme-toggle-mobile" @click="themeStore.toggleTheme">
            <Sun v-if="themeStore.isDark" :size="18" />
            <Moon v-else :size="18" />
            <span>{{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>
          <router-link to="/admin/login" class="btn btn-secondary btn-block" @click="closeMenu">Masuk</router-link>
          <router-link to="/order" class="btn btn-primary btn-block" @click="closeMenu">Mulai Sekarang</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()
const isScrolled = ref(false)
const menuOpen = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

function closeMenu() {
  menuOpen.value = false
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px 0;
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  padding: 10px 0;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.35rem;
  font-weight: 800;
  z-index: 10;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
}

.navbar-links {
  display: flex;
  gap: 32px;
}

.navbar-links a {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.3s;
  position: relative;
}

.navbar-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-gradient);
  transition: width 0.3s;
  border-radius: 1px;
}

.navbar-links a:hover {
  color: var(--text-primary);
}

.navbar-links a:hover::after {
  width: 100%;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s;
}

.theme-toggle:hover {
  background: var(--bg-glass-hover);
  color: var(--accent-primary);
}

.theme-toggle-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  padding: 8px;
  z-index: 10;
}

.hamburger span {
  width: 24px;
  height: 2px;
  background: var(--text-primary);
  transition: all 0.3s;
  border-radius: 1px;
}

.mobile-menu {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 5;
}

.mobile-menu-content {
  position: absolute;
  top: 70px;
  left: 16px;
  right: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-menu-content a {
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 8px 0;
  transition: color 0.3s;
}

.mobile-menu-content a:hover {
  color: var(--text-primary);
}

.mobile-menu-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .navbar-links, .navbar-actions {
    display: none;
  }
  .hamburger {
    display: flex;
  }
  .mobile-menu {
    display: block;
  }
  .menu-open .hamburger span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }
  .menu-open .hamburger span:nth-child(2) {
    opacity: 0;
  }
  .menu-open .hamburger span:nth-child(3) {
    transform: rotate(-45deg) translate(5px, -5px);
  }
}
</style>
