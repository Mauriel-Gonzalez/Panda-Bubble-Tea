const CART_KEY = 'pandaBubbleTeaCart'
const CART_ACTIVITY_KEY = 'pandaBubbleTeaCartActivity'
const ORDERS_KEY = 'pandaBubbleTeaOrders'
const WHATSAPP_PHONE = '50588316431'
const HERO_SLIDE_DELAY = 3600
const CART_TTL_MS = 15 * 60 * 1000
const CART_ACTIVITY_REFRESH_MS = 30 * 1000
let cartExpirationTimerId
let lastCartActivityRefresh = 0

function readJson(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function removeJson(key) {
  window.localStorage.removeItem(key)
}

function getStoredCart() {
  const cart = readJson(CART_KEY, [])
  return Array.isArray(cart) ? cart : []
}

function getCartActivityTime() {
  return Number(readJson(CART_ACTIVITY_KEY, 0)) || 0
}

function removeStoredCart() {
  removeJson(CART_KEY)
  removeJson(CART_ACTIVITY_KEY)
}

function isStoredCartExpired() {
  const cart = getStoredCart()

  if (!cart.length) {
    return false
  }

  const lastActivity = getCartActivityTime()
  return !lastActivity || Date.now() - lastActivity > CART_TTL_MS
}

function notifyCartChanged(reason) {
  document.dispatchEvent(new CustomEvent('panda:cart-change', {
    detail: {
      reason
    }
  }))
}

function clearExpiredCart({ notify = false } = {}) {
  if (!isStoredCartExpired()) {
    return false
  }

  window.clearTimeout(cartExpirationTimerId)
  removeStoredCart()

  if (notify) {
    updateCartShortcuts()
    notifyCartChanged('expired')

    if (document.visibilityState === 'visible') {
      showToast('El carrito se vació por inactividad.')
    }
  }

  return true
}

function readCart() {
  if (clearExpiredCart()) {
    return []
  }

  return getStoredCart()
}

function writeCart(cart) {
  const nextCart = Array.isArray(cart) ? cart : []

  writeJson(CART_KEY, nextCart)

  if (nextCart.length) {
    writeJson(CART_ACTIVITY_KEY, Date.now())
  } else {
    removeJson(CART_ACTIVITY_KEY)
  }

  updateCartShortcuts()
  notifyCartChanged('updated')
  scheduleCartExpiration()
}

function normalizeQuantity(value) {
  return Math.max(1, Number.parseInt(value, 10) || 1)
}

function normalizePrice(value) {
  return Number.parseInt(value, 10) || 0
}

function countCartItems(cart = readCart()) {
  return cart.reduce((total, item) => total + normalizeQuantity(item.quantity), 0)
}

function getCartTotal(cart = readCart()) {
  return cart.reduce((total, item) => (
    total + normalizePrice(item.price) * normalizeQuantity(item.quantity)
  ), 0)
}

function formatCurrency(value) {
  return `C$ ${value}`
}

function parsePrice(text) {
  const amount = Number.parseInt(text.replace(/[^\d]/g, ''), 10)
  return Number.isNaN(amount) ? 0 : amount
}

function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function createId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

async function collectCustomization(defaultToppings = 'Tapioca', product = {}) {
  const { openCustomizationModal } = await import('./modal.js')
  return openCustomizationModal({ defaultToppings, product })
}

function getItemKey(item) {
  const toppings = Array.isArray(item.toppings) ? item.toppings : []

  return [
    item.name,
    item.size,
    item.category,
    item.price,
    toppings.join('|')
  ].join('::')
}

function addToCart(item) {
  const cart = readCart()
  const normalizedItem = {
    ...item,
    quantity: normalizeQuantity(item.quantity)
  }
  const itemKey = getItemKey(normalizedItem)
  const existingItem = cart.find((cartItem) => getItemKey(cartItem) === itemKey)

  if (existingItem) {
    existingItem.quantity = normalizeQuantity(existingItem.quantity) + normalizedItem.quantity
  } else {
    cart.push({
      ...normalizedItem,
      id: createId()
    })
  }

  writeCart(cart)
  return cart
}

function updateCartItem(itemId, quantity) {
  const nextQuantity = normalizeQuantity(quantity)
  const cart = readCart().map((item) => (
    item.id === itemId ? { ...item, quantity: nextQuantity } : item
  ))

  writeCart(cart)
  return cart
}

function removeCartItem(itemId) {
  const cart = readCart().filter((item) => item.id !== itemId)
  writeCart(cart)
  return cart
}

function clearCart() {
  writeCart([])
}

function refreshCartActivity() {
  if (clearExpiredCart({ notify: true })) {
    return
  }

  if (!getStoredCart().length) {
    return
  }

  writeJson(CART_ACTIVITY_KEY, Date.now())
  scheduleCartExpiration()
}

function scheduleCartExpiration() {
  window.clearTimeout(cartExpirationTimerId)

  if (!getStoredCart().length) {
    return
  }

  const lastActivity = getCartActivityTime()

  if (!lastActivity) {
    clearExpiredCart({ notify: true })
    return
  }

  const delay = lastActivity + CART_TTL_MS - Date.now()

  if (delay <= 0) {
    clearExpiredCart({ notify: true })
    return
  }

  cartExpirationTimerId = window.setTimeout(() => {
    if (!clearExpiredCart({ notify: true })) {
      scheduleCartExpiration()
    }
  }, delay + 50)
}

function initCartExpiration() {
  clearExpiredCart()
  scheduleCartExpiration()

  const refreshOnActivity = () => {
    const now = Date.now()

    if (now - lastCartActivityRefresh < CART_ACTIVITY_REFRESH_MS) {
      return
    }

    lastCartActivityRefresh = now
    refreshCartActivity()
  }

  const activityEvents = ['click', 'input', 'keydown', 'pointerdown']

  activityEvents.forEach((eventName) => {
    document.addEventListener(eventName, refreshOnActivity, true)
  })

  window.addEventListener('scroll', refreshOnActivity, { passive: true })
  window.addEventListener('storage', (event) => {
    if (event.key === CART_KEY || event.key === CART_ACTIVITY_KEY) {
      clearExpiredCart()
      scheduleCartExpiration()
      updateCartShortcuts()
      notifyCartChanged('synced')
    }
  })
}

function readOrders() {
  return readJson(ORDERS_KEY, [])
}

function saveOrder(order) {
  const orders = readOrders()
  orders.push(order)
  writeJson(ORDERS_KEY, orders)
}

function buildWhatsAppMessage(order) {
  const groupedItems = order.items.reduce((groups, item) => {
    const category = item.category || 'Bebidas'

    if (!groups.has(category)) {
      groups.set(category, [])
    }

    groups.get(category).push(item)
    return groups
  }, new Map())
  const deliveryMethod = order.customer.delivery || 'Retiro en el local'
  const isPickup = normalizeText(deliveryMethod) === 'retiro en el local'
  const customerLines = [
    '',
    `Nombre: ${order.customer.name}`,
    `WhatsApp: ${order.customer.phone}`,
    `Entrega: ${deliveryMethod}`
  ]

  if (!isPickup) {
    customerLines.push(`Referencia: ${order.customer.address || 'Coordinar por WhatsApp'}`)
  }

  const lines = [
    'Hola Panda Bubble Tea, quiero realizar este pedido:',
    ...[...groupedItems.entries()].flatMap(([category, items]) => [
      '',
      `${category}:`,
      ...items.flatMap((item) => {
        const price = normalizePrice(item.price)
        const quantity = normalizeQuantity(item.quantity)
        const toppings = Array.isArray(item.toppings) ? item.toppings : []
        const basePrice = normalizePrice(item.basePrice || item.price)
        const toppingExtraCount = Math.max(0, Number.parseInt(item.toppingExtraCount, 10) || 0)
        const toppingExtraTotal = normalizePrice(item.toppingExtraTotal)

        return [
          `- ${quantity}x ${item.name}`,
          `   Tamaño: ${item.size}`,
          `   Toppings: ${toppings.length ? toppings.join(', ') : 'Sin toppings extra'}`,
          `   Precio base: ${formatCurrency(basePrice)}`,
          `   Toppings adicionales: ${toppingExtraCount} (${formatCurrency(toppingExtraTotal)})`,
          `   Subtotal: ${formatCurrency(price * quantity)}`
        ]
      })
    ]),
    ...customerLines
  ]

  return lines.join('\n')
}

function buildWhatsAppUrl(order) {
  const message = encodeURIComponent(buildWhatsAppMessage(order))
  return `https://wa.me/${WHATSAPP_PHONE}?text=${message}`
}

function updateCartShortcuts() {
  const count = countCartItems()
  const label = count === 1 ? '1 producto en el carrito' : `${count} productos en el carrito`

  document.querySelectorAll('a[href$="checkout.html"], .navbar .control-float').forEach((shortcut) => {
    shortcut.setAttribute('aria-label', label)
    shortcut.setAttribute('title', label)
    shortcut.classList.add('cart-shortcut')

    let badge = shortcut.querySelector('[data-cart-count]')

    if (!badge) {
      badge = document.createElement('span')
      badge.className = 'cart-badge'
      badge.dataset.cartCount = ''
      shortcut.append(badge)
    }

    badge.textContent = count
    badge.classList.toggle('hidden', count === 0)
  })
}

function showToast(message) {
  let toastStack = document.querySelector('[data-toast-stack]')

  if (!toastStack) {
    toastStack = document.createElement('div')
    toastStack.className = 'toast-stack'
    toastStack.dataset.toastStack = ''
    toastStack.setAttribute('aria-live', 'polite')
    toastStack.setAttribute('aria-atomic', 'true')
    document.body.append(toastStack)
  }

  const toast = document.createElement('p')
  toast.className = 'toast'
  toast.textContent = message
  toastStack.append(toast)

  window.setTimeout(() => {
    toast.remove()
  }, 3200)
}

function initLandingCartShortcut() {
  const cartShortcut = document.querySelector('.navbar .control-float:not(a)')

  if (!cartShortcut) {
    return
  }

  cartShortcut.setAttribute('role', 'button')
  cartShortcut.tabIndex = 0

  const goToCheckout = () => {
    window.location.href = './checkout.html'
  }

  cartShortcut.addEventListener('click', goToCheckout)
  cartShortcut.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      goToCheckout()
    }
  })
}

function initHeroCarousel() {
  const carousel = document.querySelector('[data-hero-carousel]')
  const slides = [...document.querySelectorAll('[data-hero-slide]')]
  const dots = [...document.querySelectorAll('[data-hero-dot]')]
  const index = document.querySelector('[data-hero-index]')
  const category = document.querySelector('[data-hero-category]')
  const name = document.querySelector('[data-hero-name]')
  const description = document.querySelector('[data-hero-description]')
  const prev = document.querySelector('[data-hero-prev]')
  const next = document.querySelector('[data-hero-next]')

  if (!carousel || !slides.length || !index || !category || !name || !description) {
    return
  }

  let currentSlide = 0
  let intervalId

  const showSlide = (nextSlide) => {
    currentSlide = (nextSlide + slides.length) % slides.length
    const activeSlide = slides[currentSlide]

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === currentSlide)
    })

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === currentSlide)
    })

    index.textContent = String(currentSlide + 1).padStart(2, '0')
    category.textContent = activeSlide.dataset.category || ''
    name.textContent = activeSlide.dataset.name || ''
    description.textContent = activeSlide.dataset.description || ''
  }

  const startCarousel = () => {
    window.clearInterval(intervalId)
    intervalId = window.setInterval(() => showSlide(currentSlide + 1), HERO_SLIDE_DELAY)
  }

  prev?.addEventListener('click', () => {
    showSlide(currentSlide - 1)
    startCarousel()
  })

  next?.addEventListener('click', () => {
    showSlide(currentSlide + 1)
    startCarousel()
  })

  showSlide(0)
  startCarousel()
}

window.PandaCart = {
  addToCart,
  buildWhatsAppUrl,
  clearCart,
  collectCustomization,
  countCartItems,
  formatCurrency,
  getCartTotal,
  normalizeQuantity,
  normalizeText,
  parsePrice,
  readCart,
  removeCartItem,
  saveOrder,
  showToast,
  updateCartItem,
  updateCartShortcuts
}

updateCartShortcuts()
initCartExpiration()
initLandingCartShortcut()
initHeroCarousel()

if (document.querySelector('.categories, .add-cart')) {
  import('./menu.js').then(({ initMenuPage }) => initMenuPage())
}

if (document.querySelector('[data-checkout-page]')) {
  import('./checkout.js').then(({ initCheckoutPage }) => initCheckoutPage())
}
