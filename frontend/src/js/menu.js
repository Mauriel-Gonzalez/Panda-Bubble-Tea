const DEFAULT_EXTRA_TOPPING_PRICE = 30
const DEFAULT_INCLUDED_TOPPINGS = 1
const ALL_CATEGORIES = 'all'

function escapeHtml(value) {
  const element = document.createElement('span')
  element.textContent = String(value ?? '')
  return element.innerHTML
}

function parseSizeOptions(section, fallbackPrice) {
  const priceText = section?.dataset.sizePrices || ''
  const options = priceText
    .split(',')
    .map((option) => {
      const [label, price] = option.split(':')

      return {
        label: label?.trim(),
        price: Number.parseInt(price, 10)
      }
    })
    .filter((option) => option.label && Number.isFinite(option.price))

  if (options.length) {
    return options
  }

  return [
    {
      label: 'Regular',
      price: fallbackPrice
    }
  ]
}

function getSectionCategory(section) {
  return section?.dataset.category || section?.querySelector('.drink-heading h2')?.textContent.trim() || 'Menú'
}

function getProductName(product) {
  return product.querySelector('.subheading-s')?.textContent.trim() || 'Bebida'
}

function getProductData(product) {
  const cart = window.PandaCart
  const section = product.closest('.drink-section')
  const name = getProductName(product)
  const description = product.querySelector('.description p')?.textContent.trim() || ''
  const price = cart.parsePrice(product.querySelector('.price')?.textContent || '')
  const imageElement = product.querySelector('.drink-img')
  const image = imageElement?.currentSrc || imageElement?.getAttribute('src') || ''
  const category = getSectionCategory(section)
  const sizeOptions = parseSizeOptions(section, price)

  return {
    name,
    description,
    price: sizeOptions[0].price,
    basePrice: sizeOptions[0].price,
    image,
    category,
    sizeOptions,
    includedToppings: DEFAULT_INCLUDED_TOPPINGS,
    extraToppingPrice: DEFAULT_EXTRA_TOPPING_PRICE
  }
}

function updateSectionVisibility(section) {
  const visibleProducts = section.querySelectorAll('.product:not(.hidden)')
  section.classList.toggle('hidden', visibleProducts.length === 0)
}

function initStableProductCards() {
  document.querySelectorAll('details.product').forEach((product) => {
    product.removeAttribute('name')
    product.open = true
    product.querySelector('summary')?.addEventListener('click', (event) => {
      event.preventDefault()
    })
  })
}

function prepareProductActions() {
  document.querySelectorAll('.product').forEach((product) => {
    const card = product.querySelector('.product-card')
    const price = product.querySelector('.price')
    const button = product.querySelector('.add-cart')
    const image = product.querySelector('.drink-img')
    const productName = getProductName(product)

    if (!card || !price || !button) {
      return
    }

    let actions = product.querySelector('.product-actions')

    if (!actions) {
      actions = document.createElement('div')
      actions.className = 'product-actions'
      card.append(actions)
    }

    button.classList.add('personalize-button')
    button.textContent = 'Personalizar'
    button.setAttribute('aria-label', `Personalizar ${productName}`)

    if (image) {
      image.alt = productName
    }

    actions.append(price, button)
  })
}

function ensureMenuFeedback() {
  const categories = document.querySelector('.categories')

  if (!categories) {
    return {
      count: null,
      empty: null
    }
  }

  let feedback = document.querySelector('[data-menu-feedback]')

  if (!feedback) {
    feedback = document.createElement('div')
    feedback.className = 'menu-feedback'
    feedback.dataset.menuFeedback = ''

    const count = document.createElement('span')
    count.className = 'sm-p'
    count.dataset.resultsCount = ''

    const rule = document.createElement('span')
    rule.className = 'sm-p'
    rule.textContent = 'Incluye 1 topping. Cada topping adicional cuesta C$ 30.'

    feedback.append(count, rule)
    categories.insertAdjacentElement('afterend', feedback)
  }

  let empty = document.querySelector('[data-empty-results]')

  if (!empty) {
    empty = document.createElement('p')
    empty.className = 'menu-empty sm-p hidden'
    empty.dataset.emptyResults = ''
    empty.textContent = 'No encontramos bebidas con ese nombre.'
    feedback.insertAdjacentElement('afterend', empty)
  }

  return {
    count: feedback.querySelector('[data-results-count]'),
    empty
  }
}

function ensureSearchClearButton(searchInput) {
  const searchForm = searchInput.closest('.search-form')

  if (!searchForm) {
    return null
  }

  let clearButton = searchForm.querySelector('[data-clear-search]')

  if (!clearButton) {
    clearButton = document.createElement('button')
    clearButton.className = 'search-clear hidden'
    clearButton.type = 'button'
    clearButton.dataset.clearSearch = ''
    clearButton.setAttribute('aria-label', 'Limpiar búsqueda')
    clearButton.innerHTML = "<span class=\"icon\" style=\"--icon: url('/src/assets/icons/navigation/close.svg')\"></span>"
    searchForm.insertBefore(clearButton, searchForm.querySelector('.icon'))
  }

  return clearButton
}

function updateMenuFeedback(sections, feedback) {
  if (!feedback.count || !feedback.empty) {
    return
  }

  const totals = sections.reduce(
    (summary, section) => {
      const products = [...section.querySelectorAll('.product')]

      summary.total += products.length
      summary.visible += products.filter((product) => !product.classList.contains('hidden')).length

      return summary
    },
    {
      total: 0,
      visible: 0
    }
  )

  feedback.count.textContent =
    totals.visible === totals.total
      ? `${totals.total} bebidas disponibles`
      : `${totals.visible} de ${totals.total} bebidas`
  feedback.empty.classList.toggle('hidden', totals.visible > 0)
}

function setActiveCategory(buttons, activeButton) {
  buttons.forEach((button) => {
    const isActive = button === activeButton
    button.classList.toggle('control-primary', isActive)
    button.classList.toggle('is-active', isActive)
    button.setAttribute('aria-pressed', String(isActive))
  })
}

function initSearchAndFilters() {
  const cart = window.PandaCart
  const searchInput = document.querySelector('.search-form input')
  const categoryButtons = [...document.querySelectorAll('.categories [data-category-filter]')]
  const sections = [...document.querySelectorAll('.drink-section')]
  const feedback = ensureMenuFeedback()
  let activeCategory = ALL_CATEGORIES

  if (!cart || !searchInput || !categoryButtons.length || !sections.length) {
    return
  }

  const clearSearchButton = ensureSearchClearButton(searchInput)

  clearSearchButton?.addEventListener('click', () => {
    searchInput.value = ''
    searchInput.focus()
    applyFilters()
  })

  categoryButtons.forEach((button, index) => {
    button.type = 'button'
    button.setAttribute('aria-pressed', String(index === 0))
    button.classList.toggle('is-active', index === 0)

    button.addEventListener('click', () => {
      activeCategory = button.dataset.categoryFilter || ALL_CATEGORIES
      setActiveCategory(categoryButtons, button)
      applyFilters()
    })
  })

  searchInput.addEventListener('input', applyFilters)

  function applyFilters() {
    const query = cart.normalizeText(searchInput.value)
    const hasSearch = Boolean(query)

    clearSearchButton?.classList.toggle('hidden', !hasSearch)

    sections.forEach((section) => {
      const sectionName = cart.normalizeText(getSectionCategory(section))
      const selectedCategory = cart.normalizeText(activeCategory)
      const matchesCategory = activeCategory === ALL_CATEGORIES || sectionName === selectedCategory

      section.querySelectorAll('.product').forEach((product) => {
        const productName = cart.normalizeText(getProductName(product))
        const matchesSearch = !hasSearch || productName.includes(query)

        product.classList.toggle('hidden', !matchesCategory || !matchesSearch)
      })

      updateSectionVisibility(section)
    })

    if (feedback.empty) {
      feedback.empty.textContent =
        hasSearch && activeCategory !== ALL_CATEGORIES
          ? 'No encontramos bebidas con esa búsqueda en esta categoría.'
          : 'No encontramos bebidas con ese nombre.'
    }

    updateMenuFeedback(sections, feedback)
  }

  applyFilters()
}

function getCartItemMeta(item) {
  const toppings = Array.isArray(item.toppings) ? item.toppings : []
  const details = [item.size, toppings.length ? toppings.join(', ') : 'Sin toppings extra']

  return details.filter(Boolean).join(' / ')
}

function createCartItemMarkup(item) {
  const cart = window.PandaCart
  const quantity = cart.normalizeQuantity(item.quantity)
  const unitPrice = cart.parsePrice(String(item.price || 0))
  const subtotal = unitPrice * quantity

  return `
    <article class="menu-cart-item" data-cart-item-id="${escapeHtml(item.id)}">
      <div class="menu-cart-item-copy">
        <h3 class="subheading-s">${escapeHtml(item.name)}</h3>
        <p class="sm-p">${escapeHtml(getCartItemMeta(item))}</p>
        <p class="sm-p">${quantity} x ${cart.formatCurrency(unitPrice)} · ${cart.formatCurrency(subtotal)}</p>
      </div>

      <div class="menu-cart-item-controls" aria-label="Cantidad">
        <button class="cart-qty-btn" type="button" data-cart-action="decrease" aria-label="Restar ${escapeHtml(item.name)}">-</button>
        <span>${quantity}</span>
        <button class="cart-qty-btn" type="button" data-cart-action="increase" aria-label="Sumar ${escapeHtml(item.name)}">+</button>
        <button class="cart-remove-btn" type="button" data-cart-action="remove">Quitar</button>
      </div>
    </article>
  `
}

function createCartMarkup(items, { isDialog = false } = {}) {
  const cart = window.PandaCart
  const count = cart.countCartItems(items)
  const total = cart.getCartTotal(items)
  const hasItems = count > 0

  return `
    <div class="menu-cart-receipt">
      <header class="menu-cart-header">
        <div>
          <p class="sm-p">Tu pedido</p>
          <h2 class="subheading-l">Resumen</h2>
        </div>
        ${isDialog ? '<button class="control control-float menu-cart-close" type="button" data-mobile-cart-close aria-label="Cerrar resumen">x</button>' : `<span class="menu-cart-count">${count}</span>`}
      </header>

      <div class="menu-cart-items">
        ${hasItems ? items.map((item) => createCartItemMarkup(item)).join('') : `
          <div class="menu-cart-empty-state">
            <p class="subheading-s">Aún no hay bebidas.</p>
            <p class="sm-p">Personaliza una bebida para empezar tu pedido.</p>
          </div>
        `}
      </div>

      <footer class="menu-cart-footer">
        <div class="menu-cart-rule">
          <p class="sm-p">Precio base incluye 1 topping.</p>
          <p class="sm-p">Topping adicional: C$ 30.</p>
        </div>

        <div class="menu-cart-total">
          <span>Total</span>
          <strong>${cart.formatCurrency(total)}</strong>
        </div>

        <a class="control control-primary menu-checkout${hasItems ? '' : ' is-disabled'}" href="./checkout.html" data-menu-checkout aria-disabled="${String(!hasItems)}">
          Finalizar pedido
        </a>
      </footer>
    </div>
  `
}

function initMenuCart() {
  const cart = window.PandaCart
  const panel = document.querySelector('[data-menu-cart]')
  const mobileBar = document.querySelector('[data-mobile-order-bar]')
  const mobileBarLabel = document.querySelector('[data-mobile-order-label]')
  const mobileBarTotal = document.querySelector('[data-mobile-order-total]')
  const mobileDialog = document.querySelector('[data-mobile-cart-dialog]')

  if (!cart || !panel || !mobileBar || !mobileDialog) {
    return {
      render: () => {}
    }
  }

  const render = () => {
    const items = cart.readCart()
    const count = cart.countCartItems(items)
    const total = cart.getCartTotal(items)

    panel.innerHTML = createCartMarkup(items)
    mobileDialog.innerHTML = createCartMarkup(items, { isDialog: true })
    mobileBar.classList.toggle('hidden', count === 0)
    document.body.classList.toggle('has-mobile-order-bar', count > 0)

    if (mobileBarLabel) {
      mobileBarLabel.textContent = `Ver pedido (${count})`
    }

    if (mobileBarTotal) {
      mobileBarTotal.textContent = cart.formatCurrency(total)
    }
  }

  const updateItemQuantity = (itemId, delta) => {
    const item = cart.readCart().find((cartItem) => cartItem.id === itemId)

    if (!item) {
      return
    }

    const nextQuantity = cart.normalizeQuantity(item.quantity) + delta

    if (nextQuantity < 1) {
      cart.removeCartItem(itemId)
    } else {
      cart.updateCartItem(itemId, nextQuantity)
    }

    render()
  }

  document.addEventListener('click', (event) => {
    const checkoutLink = event.target.closest('[data-menu-checkout]')

    if (checkoutLink?.classList.contains('is-disabled')) {
      event.preventDefault()
      return
    }

    const mobileClose = event.target.closest('[data-mobile-cart-close]')

    if (mobileClose) {
      mobileDialog.close()
      return
    }

    const actionButton = event.target.closest('[data-cart-action]')

    if (!actionButton) {
      return
    }

    const cartItem = actionButton.closest('[data-cart-item-id]')
    const itemId = cartItem?.dataset.cartItemId

    if (!itemId) {
      return
    }

    if (actionButton.dataset.cartAction === 'increase') {
      updateItemQuantity(itemId, 1)
      return
    }

    if (actionButton.dataset.cartAction === 'decrease') {
      updateItemQuantity(itemId, -1)
      return
    }

    if (actionButton.dataset.cartAction === 'remove') {
      cart.removeCartItem(itemId)
      render()
    }
  })

  mobileBar.addEventListener('click', () => {
    render()
    mobileDialog.showModal()
  })

  mobileDialog.addEventListener('click', (event) => {
    if (event.target === mobileDialog) {
      mobileDialog.close()
    }
  })

  mobileDialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    mobileDialog.close()
  })

  render()
  document.addEventListener('panda:cart-change', render)

  return {
    render
  }
}

function initAddToCartButtons(menuCart) {
  const cart = window.PandaCart

  document.querySelectorAll('.add-cart').forEach((button) => {
    button.type = 'button'
    const product = button.closest('.product')

    if (product) {
      button.setAttribute('aria-label', `Personalizar ${getProductData(product).name}`)
    }

    button.addEventListener('click', async (event) => {
      event.preventDefault()
      event.stopPropagation()

      const product = button.closest('.product')

      if (!product) {
        return
      }

      const productData = getProductData(product)
      const customization = await cart.collectCustomization('Tapioca', productData)

      if (!customization) {
        return
      }

      cart.addToCart({
        ...productData,
        ...customization
      })

      menuCart.render()
      cart.showToast('Bebida agregada al pedido.')
    })
  })
}

export function initMenuPage() {
  initStableProductCards()
  prepareProductActions()
  initSearchAndFilters()

  const menuCart = initMenuCart()

  initAddToCartButtons(menuCart)
}
