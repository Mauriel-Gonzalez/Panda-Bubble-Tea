const TOPPINGS = [
  'Fresa',
  'Maracuyá',
  'Mango',
  'Tapioca',
  'Lichi',
  'Jelly de coco',
  'Jelly rainbow'
]
function escapeHtml(value) {
  const element = document.createElement('span')
  element.textContent = String(value ?? '')
  return element.innerHTML
}

function getDefaultToppings(defaultToppings) {
  return String(defaultToppings || '')
    .split(',')
    .map((topping) => topping.trim())
    .filter(Boolean)
}

function getSizeOptions(product) {
  const options = Array.isArray(product.sizeOptions) ? product.sizeOptions : []

  if (options.length) {
    return options
  }

  return [
    {
      label: 'Regular',
      price: Number.parseInt(product.price, 10) || 0
    }
  ]
}

function calculatePrice({ basePrice, includedToppings, quantity, selectedToppings, extraToppingPrice }) {
  const extraToppings = Math.max(0, selectedToppings.length - includedToppings)
  const toppingExtraTotal = extraToppings * extraToppingPrice
  const unitPrice = basePrice + toppingExtraTotal

  return {
    extraToppings,
    toppingExtraTotal,
    unitPrice,
    total: unitPrice * quantity
  }
}

function createSizeOptionsMarkup(sizeOptions) {
  return sizeOptions.map((option, index) => `
    <label class="modal-option">
      <input type="radio" name="size" value="${escapeHtml(option.label)}" data-price="${option.price}" ${index === 0 ? 'checked' : ''}>
      <span>${escapeHtml(option.label)}</span>
      <span class="sm-p modal-option-price">C$ ${option.price}</span>
    </label>
  `).join('')
}

function createModalMarkup({ product, defaultToppings }) {
  const selectedToppings = getDefaultToppings(defaultToppings)
  const productName = escapeHtml(product.name || 'Bebida')
  const productCategory = escapeHtml(product.category || 'Menú')
  const productDescription = escapeHtml(product.description || '')
  const productImage = escapeHtml(product.image || '')
  const sizeOptions = getSizeOptions(product)
  const firstPrice = sizeOptions[0]?.price || 0
  const includedToppings = Number.parseInt(product.includedToppings, 10) || 1
  const extraToppingPrice = Number.parseInt(product.extraToppingPrice, 10) || 30

  return `
    <form class="custom-modal-shell" method="dialog">
      <button class="control control-float modal-close" type="button" data-modal-cancel aria-label="Cerrar personalización">
        <span aria-hidden="true">x</span>
      </button>

      <div class="modal-product">
        <img class="img modal-product-img" src="${productImage}" alt="">
        <div class="column modal-product-content">
          <div class="no-spacing modal-heading">
            <p class="sm-p">${productCategory}</p>
            <h2 class="heading-l">${productName}</h2>
          </div>
          <p>${productDescription}</p>
          <p class="control control-primary modal-price" data-unit-price>C$ ${firstPrice}</p>
        </div>
      </div>

      <fieldset class="column modal-group">
        <legend class="subheading-m">Tamaño</legend>
        <div class="cluster modal-options">
          ${createSizeOptionsMarkup(sizeOptions)}
        </div>
      </fieldset>

      <fieldset class="column modal-group">
        <legend class="subheading-m">Toppings</legend>
        <p class="sm-p">El precio base incluye ${includedToppings} topping. Cada topping adicional cuesta C$ ${extraToppingPrice}.</p>
        <div class="cluster modal-options">
          ${TOPPINGS.map((topping) => `
            <label class="modal-option">
              <input type="checkbox" name="toppings" value="${escapeHtml(topping)}" ${selectedToppings.includes(topping) ? 'checked' : ''}>
              <span>${escapeHtml(topping)}</span>
            </label>
          `).join('')}
        </div>
      </fieldset>

      <div class="row modal-quantity">
        <p class="subheading-m">Cantidad</p>
        <div class="row quantity-control">
          <button class="control quantity-btn" type="button" data-quantity="decrease" aria-label="Restar producto">
            <span aria-hidden="true">-</span>
          </button>
          <output class="subheading-s" data-quantity-value>1</output>
          <button class="control quantity-btn" type="button" data-quantity="increase" aria-label="Sumar producto">
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      <div class="price-breakdown">
        <p class="sm-p">Base: <span data-base-price>C$ ${firstPrice}</span></p>
        <p class="sm-p">Toppings extra: <span data-extra-price>C$ 0</span></p>
        <p class="subheading-m modal-total">Total: <span data-total-price>C$ ${firstPrice}</span></p>
      </div>

      <div class="row modal-actions">
        <button class="control" type="button" data-modal-cancel>Cancelar</button>
        <button class="control control-primary modal-submit" type="submit" data-submit-customization>
          <span data-submit-label>Agregar al carrito</span>
          <span data-submit-total>C$ ${firstPrice}</span>
        </button>
      </div>
    </form>
  `
}

export function openCustomizationModal({ defaultToppings = 'Tapioca', product = {} } = {}) {
  return new Promise((resolve) => {
    const dialog = document.createElement('dialog')
    dialog.className = 'custom-modal'
    dialog.innerHTML = createModalMarkup({ product, defaultToppings })
    document.body.append(dialog)

    const includedToppings = Number.parseInt(product.includedToppings, 10) || 1
    const extraToppingPrice = Number.parseInt(product.extraToppingPrice, 10) || 30
    let quantity = 1

    const form = dialog.querySelector('form')
    const quantityValue = dialog.querySelector('[data-quantity-value]')
    const unitPrice = dialog.querySelector('[data-unit-price]')
    const basePrice = dialog.querySelector('[data-base-price]')
    const extraPrice = dialog.querySelector('[data-extra-price]')
    const totalPrice = dialog.querySelector('[data-total-price]')
    const submitTotal = dialog.querySelector('[data-submit-total]')

    const getSelectedSize = () => dialog.querySelector('input[name="size"]:checked')
    const getSelectedToppings = () => [...dialog.querySelectorAll('input[name="toppings"]:checked')]
      .map((input) => input.value)

    const updatePrice = () => {
      const selectedSize = getSelectedSize()
      const selectedToppings = getSelectedToppings()
      const selectedBasePrice = Number.parseInt(selectedSize?.dataset.price, 10) || 0
      const price = calculatePrice({
        basePrice: selectedBasePrice,
        includedToppings,
        quantity,
        selectedToppings,
        extraToppingPrice
      })

      unitPrice.textContent = `C$ ${price.unitPrice}`
      basePrice.textContent = `C$ ${selectedBasePrice}`
      extraPrice.textContent = `C$ ${price.toppingExtraTotal}`
      totalPrice.textContent = `C$ ${price.total}`
      submitTotal.textContent = `C$ ${price.total}`

      return {
        selectedSize,
        selectedToppings,
        selectedBasePrice,
        ...price
      }
    }

    const closeModal = (value) => {
      dialog.close()
      dialog.remove()
      resolve(value)
    }

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        closeModal(null)
      }
    })

    dialog.querySelectorAll('[data-modal-cancel]').forEach((button) => {
      button.addEventListener('click', () => closeModal(null))
    })

    dialog.querySelectorAll('[data-quantity]').forEach((button) => {
      button.addEventListener('click', () => {
        quantity += button.dataset.quantity === 'increase' ? 1 : -1
        quantity = Math.max(1, quantity)
        quantityValue.value = quantity
        quantityValue.textContent = quantity
        updatePrice()
      })
    })

    form.addEventListener('change', updatePrice)

    form.addEventListener('submit', (event) => {
      event.preventDefault()

      const price = updatePrice()

      closeModal({
        size: price.selectedSize?.value || 'Regular',
        toppings: price.selectedToppings,
        quantity,
        price: price.unitPrice,
        basePrice: price.selectedBasePrice,
        toppingExtraCount: price.extraToppings,
        toppingExtraPrice: extraToppingPrice,
        toppingExtraTotal: price.toppingExtraTotal,
        includedToppings
      })
    })

    dialog.addEventListener('cancel', (event) => {
      event.preventDefault()
      closeModal(null)
    })

    updatePrice()
    dialog.showModal()
  })
}
