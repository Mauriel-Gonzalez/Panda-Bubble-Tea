function getCheckoutElements() {
  return {
    cartList: document.querySelector('[data-cart-list]'),
    emptyCart: document.querySelector('[data-empty-cart]'),
    cartTotal: document.querySelector('[data-cart-total]'),
    checkoutForm: document.querySelector('[data-checkout-form]'),
    checkoutNote: document.querySelector('[data-checkout-note]'),
    submitOrderButton: document.querySelector('[data-submit-order]'),
    clearCartButton: document.querySelector('[data-clear-cart]')
  }
}

function escapeHtml(value) {
  const element = document.createElement('span')
  element.textContent = String(value ?? '')
  return element.innerHTML
}

function createId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function getFormValue(formData, key) {
  return String(formData.get(key) || '').trim()
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 8 || digits.length === 11
}

function renderCart() {
  const cart = window.PandaCart
  const elements = getCheckoutElements()
  const items = cart.readCart()

  if (!elements.cartList || !elements.emptyCart || !elements.cartTotal) {
    return
  }

  elements.cartList.innerHTML = ''
  elements.emptyCart.classList.toggle('hidden', items.length > 0)
  elements.cartTotal.textContent = cart.formatCurrency(cart.getCartTotal(items))

  if (elements.submitOrderButton) {
    elements.submitOrderButton.disabled = items.length === 0
  }

  if (elements.clearCartButton) {
    elements.clearCartButton.disabled = items.length === 0
  }

  if (elements.checkoutNote) {
    elements.checkoutNote.textContent = items.length
      ? 'Confirmaremos disponibilidad y entrega por WhatsApp.'
      : 'Agrega productos al carrito para preparar tu pedido.'
  }

  items.forEach((item) => {
    const itemQuantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1)
    const itemPrice = Number.parseInt(item.price, 10) || 0
    const itemBasePrice = Number.parseInt(item.basePrice || item.price, 10) || 0
    const itemExtraCount = Math.max(0, Number.parseInt(item.toppingExtraCount, 10) || 0)
    const itemExtraTotal = Number.parseInt(item.toppingExtraTotal, 10) || 0
    const itemName = escapeHtml(item.name)
    const itemCategory = escapeHtml(item.category)
    const itemSize = escapeHtml(item.size)
    const itemImage = escapeHtml(item.image)
    const toppings = Array.isArray(item.toppings) ? item.toppings : []
    const itemToppings = escapeHtml(toppings.length ? toppings.join(', ') : 'Sin toppings extra')
    const itemId = escapeHtml(item.id)
    const cartItem = document.createElement('article')
    cartItem.className = 'cart-item'
    cartItem.innerHTML = `
      <img class="img cart-item-img" src="${itemImage}" alt="">
      <div class="column cart-item-content">
        <div class="no-spacing cart-item-heading">
          <h2 class="subheading-s">${itemName}</h2>
          <p class="sm-p">${itemCategory} · ${itemSize}</p>
        </div>
        <p class="sm-p">${itemToppings}</p>
        <p class="sm-p">Base C$ ${itemBasePrice} · Extras ${itemExtraCount} topping(s) C$ ${itemExtraTotal}</p>
        <div class="row cart-item-actions">
          <button class="control quantity-btn" type="button" data-action="decrease" data-id="${itemId}" aria-label="Restar ${itemName}">
            <span aria-hidden="true">-</span>
          </button>
          <span class="subheading-s">${itemQuantity}</span>
          <button class="control quantity-btn" type="button" data-action="increase" data-id="${itemId}" aria-label="Sumar ${itemName}">
            <span aria-hidden="true">+</span>
          </button>
          <button class="control quantity-btn" type="button" data-action="remove" data-id="${itemId}" aria-label="Eliminar ${itemName}">
            <span aria-hidden="true">x</span>
          </button>
        </div>
      </div>
      <p class="control control-primary price">${cart.formatCurrency(itemPrice * itemQuantity)}</p>
    `

    elements.cartList.append(cartItem)
  })
}

function initCartActions() {
  const elements = getCheckoutElements()
  const cart = window.PandaCart

  elements.cartList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]')

    if (!button) {
      return
    }

    const itemId = button.dataset.id
    const currentItem = cart.readCart().find((item) => item.id === itemId)

    if (!currentItem) {
      return
    }

    if (button.dataset.action === 'increase') {
      cart.updateCartItem(itemId, currentItem.quantity + 1)
    }

    if (button.dataset.action === 'decrease') {
      cart.updateCartItem(itemId, currentItem.quantity - 1)
    }

    if (button.dataset.action === 'remove') {
      cart.removeCartItem(itemId)
    }

    renderCart()
  })

  elements.clearCartButton?.addEventListener('click', () => {
    cart.clearCart()
    renderCart()
  })
}

function initDeliverySelector() {
  const deliverySelector = document.querySelector('[data-delivery-select]')
  const trigger = deliverySelector?.querySelector('[data-delivery-trigger]')
  const input = deliverySelector?.querySelector('[data-delivery-input]')
  const label = deliverySelector?.querySelector('[data-delivery-label]')
  const options = deliverySelector?.querySelector('[data-delivery-options]')

  if (!deliverySelector || !trigger || !input || !label || !options) {
    return
  }

  const closeOptions = () => {
    options.classList.add('hidden')
    trigger.setAttribute('aria-expanded', 'false')
  }

  const openOptions = () => {
    options.classList.remove('hidden')
    trigger.setAttribute('aria-expanded', 'true')
  }

  trigger.addEventListener('click', () => {
    if (options.classList.contains('hidden')) {
      openOptions()
    } else {
      closeOptions()
    }
  })

  options.querySelectorAll('[data-delivery-option]').forEach((option) => {
    option.addEventListener('click', () => {
      input.value = option.value
      label.textContent = option.value
      options.querySelectorAll('[data-delivery-option]').forEach((item) => {
        item.setAttribute('aria-selected', String(item === option))
      })
      closeOptions()
    })
  })

  document.addEventListener('click', (event) => {
    if (!deliverySelector.contains(event.target)) {
      closeOptions()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeOptions()
    }
  })
}

function initCheckoutForm() {
  const elements = getCheckoutElements()
  const cart = window.PandaCart

  elements.checkoutForm?.addEventListener('submit', (event) => {
    event.preventDefault()

    const items = cart.readCart()

    if (!items.length) {
      cart.showToast('Agrega productos al carrito antes de enviar el pedido.')
      return
    }

    const formData = new FormData(elements.checkoutForm)
    const phone = getFormValue(formData, 'phone')

    if (!isValidPhone(phone)) {
      cart.showToast('Revisa el número de WhatsApp antes de enviar.')
      elements.checkoutForm.elements.phone.focus()
      return
    }

    const order = {
      id: createId(),
      createdAt: new Date().toISOString(),
      items,
      total: cart.getCartTotal(items),
      customer: {
        name: getFormValue(formData, 'name'),
        phone,
        delivery: getFormValue(formData, 'delivery') || 'Retiro en el local',
        address: getFormValue(formData, 'address')
      },
      status: 'pending'
    }

    cart.saveOrder(order)
    window.open(cart.buildWhatsAppUrl(order), '_blank', 'noopener')
    cart.showToast('Pedido preparado en WhatsApp.')
  })
}

export function initCheckoutPage() {
  renderCart()
  initCartActions()
  initDeliverySelector()
  initCheckoutForm()
}
