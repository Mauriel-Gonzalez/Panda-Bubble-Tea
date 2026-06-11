var e=[`Fresa`,`Maracuyá`,`Mango`,`Tapioca`,`Lichi`,`Jelly de coco`,`Jelly rainbow`];function t(e){let t=document.createElement(`span`);return t.textContent=String(e??``),t.innerHTML}function n(e){return String(e||``).split(`,`).map(e=>e.trim()).filter(Boolean)}function r(e){let t=Array.isArray(e.sizeOptions)?e.sizeOptions:[];return t.length?t:[{label:`Regular`,price:Number.parseInt(e.price,10)||0}]}function i({basePrice:e,includedToppings:t,quantity:n,selectedToppings:r,extraToppingPrice:i}){let a=Math.max(0,r.length-t),o=a*i,s=e+o;return{extraToppings:a,toppingExtraTotal:o,unitPrice:s,total:s*n}}function a(e){return e.map((e,n)=>`
    <label class="modal-option">
      <input type="radio" name="size" value="${t(e.label)}" data-price="${e.price}" ${n===0?`checked`:``}>
      <span>${t(e.label)}</span>
      <span class="sm-p modal-option-price">C$ ${e.price}</span>
    </label>
  `).join(``)}function o({product:i,defaultToppings:o}){let s=n(o),c=t(i.name||`Bebida`),l=t(i.category||`Menú`),u=t(i.description||``),d=t(i.image||``),f=r(i),p=f[0]?.price||0,m=Number.parseInt(i.includedToppings,10)||1,h=Number.parseInt(i.extraToppingPrice,10)||30;return`
    <form class="custom-modal-shell" method="dialog">
      <button class="control control-float modal-close" type="button" data-modal-cancel aria-label="Cerrar personalización">
        <span aria-hidden="true">x</span>
      </button>

      <div class="modal-product">
        <img class="img modal-product-img" src="${d}" alt="">
        <div class="column modal-product-content">
          <div class="no-spacing modal-heading">
            <p class="sm-p">${l}</p>
            <h2 class="heading-l">${c}</h2>
          </div>
          <p>${u}</p>
          <p class="control control-primary modal-price" data-unit-price>C$ ${p}</p>
        </div>
      </div>

      <fieldset class="column modal-group">
        <legend class="subheading-m">Tamaño</legend>
        <div class="cluster modal-options">
          ${a(f)}
        </div>
      </fieldset>

      <fieldset class="column modal-group">
        <legend class="subheading-m">Toppings</legend>
        <p class="sm-p">El precio base incluye ${m} topping. Cada topping adicional cuesta C$ ${h}.</p>
        <div class="cluster modal-options">
          ${e.map(e=>`
            <label class="modal-option">
              <input type="checkbox" name="toppings" value="${t(e)}" ${s.includes(e)?`checked`:``}>
              <span>${t(e)}</span>
            </label>
          `).join(``)}
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
        <p class="sm-p">Base: <span data-base-price>C$ ${p}</span></p>
        <p class="sm-p">Toppings extra: <span data-extra-price>C$ 0</span></p>
        <p class="subheading-m modal-total">Total: <span data-total-price>C$ ${p}</span></p>
      </div>

      <div class="row modal-actions">
        <button class="control" type="button" data-modal-cancel>Cancelar</button>
        <button class="control control-primary modal-submit" type="submit" data-submit-customization>
          <span data-submit-label>Agregar al carrito</span>
          <span data-submit-total>C$ ${p}</span>
        </button>
      </div>
    </form>
  `}function s({defaultToppings:e=`Tapioca`,product:t={}}={}){return new Promise(n=>{let r=document.createElement(`dialog`);r.className=`custom-modal`,r.innerHTML=o({product:t,defaultToppings:e}),document.body.append(r);let a=Number.parseInt(t.includedToppings,10)||1,s=Number.parseInt(t.extraToppingPrice,10)||30,c=1,l=r.querySelector(`form`),u=r.querySelector(`[data-quantity-value]`),d=r.querySelector(`[data-unit-price]`),f=r.querySelector(`[data-base-price]`),p=r.querySelector(`[data-extra-price]`),m=r.querySelector(`[data-total-price]`),h=r.querySelector(`[data-submit-total]`),g=()=>r.querySelector(`input[name="size"]:checked`),_=()=>[...r.querySelectorAll(`input[name="toppings"]:checked`)].map(e=>e.value),v=()=>{let e=g(),t=_(),n=Number.parseInt(e?.dataset.price,10)||0,r=i({basePrice:n,includedToppings:a,quantity:c,selectedToppings:t,extraToppingPrice:s});return d.textContent=`C$ ${r.unitPrice}`,f.textContent=`C$ ${n}`,p.textContent=`C$ ${r.toppingExtraTotal}`,m.textContent=`C$ ${r.total}`,h.textContent=`C$ ${r.total}`,{selectedSize:e,selectedToppings:t,selectedBasePrice:n,...r}},y=e=>{r.close(),r.remove(),n(e)};r.addEventListener(`click`,e=>{e.target===r&&y(null)}),r.querySelectorAll(`[data-modal-cancel]`).forEach(e=>{e.addEventListener(`click`,()=>y(null))}),r.querySelectorAll(`[data-quantity]`).forEach(e=>{e.addEventListener(`click`,()=>{c+=e.dataset.quantity===`increase`?1:-1,c=Math.max(1,c),u.value=c,u.textContent=c,v()})}),l.addEventListener(`change`,v),l.addEventListener(`submit`,e=>{e.preventDefault();let t=v();y({size:t.selectedSize?.value||`Regular`,toppings:t.selectedToppings,quantity:c,price:t.unitPrice,basePrice:t.selectedBasePrice,toppingExtraCount:t.extraToppings,toppingExtraPrice:s,toppingExtraTotal:t.toppingExtraTotal,includedToppings:a})}),r.addEventListener(`cancel`,e=>{e.preventDefault(),y(null)}),v(),r.showModal()})}export{s as openCustomizationModal};