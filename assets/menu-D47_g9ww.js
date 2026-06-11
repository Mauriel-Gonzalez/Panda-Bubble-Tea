var e=30,t=1,n=`all`;function r(e){let t=document.createElement(`span`);return t.textContent=String(e??``),t.innerHTML}function i(e,t){let n=(e?.dataset.sizePrices||``).split(`,`).map(e=>{let[t,n]=e.split(`:`);return{label:t?.trim(),price:Number.parseInt(n,10)}}).filter(e=>e.label&&Number.isFinite(e.price));return n.length?n:[{label:`Regular`,price:t}]}function a(e){return e?.dataset.category||e?.querySelector(`.drink-heading h2`)?.textContent.trim()||`Menú`}function o(e){return e.querySelector(`.subheading-s`)?.textContent.trim()||`Bebida`}function s(n){let r=window.PandaCart,s=n.closest(`.drink-section`),c=o(n),l=n.querySelector(`.description p`)?.textContent.trim()||``,u=r.parsePrice(n.querySelector(`.price`)?.textContent||``),d=n.querySelector(`.drink-img`),f=d?.currentSrc||d?.getAttribute(`src`)||``,p=a(s),m=i(s,u);return{name:c,description:l,price:m[0].price,basePrice:m[0].price,image:f,category:p,sizeOptions:m,includedToppings:t,extraToppingPrice:e}}function c(e){let t=e.querySelectorAll(`.product:not(.hidden)`);e.classList.toggle(`hidden`,t.length===0)}function l(){document.querySelectorAll(`details.product`).forEach(e=>{e.removeAttribute(`name`),e.open=!0,e.querySelector(`summary`)?.addEventListener(`click`,e=>{e.preventDefault()})})}function u(){document.querySelectorAll(`.product`).forEach(e=>{let t=e.querySelector(`.product-card`),n=e.querySelector(`.price`),r=e.querySelector(`.add-cart`),i=e.querySelector(`.drink-img`),a=o(e);if(!t||!n||!r)return;let s=e.querySelector(`.product-actions`);s||(s=document.createElement(`div`),s.className=`product-actions`,t.append(s)),r.classList.add(`personalize-button`),r.textContent=`Personalizar`,r.setAttribute(`aria-label`,`Personalizar ${a}`),i&&(i.alt=a),s.append(n,r)})}function d(){let e=document.querySelector(`.categories`);if(!e)return{count:null,empty:null};let t=document.querySelector(`[data-menu-feedback]`);if(!t){t=document.createElement(`div`),t.className=`menu-feedback`,t.dataset.menuFeedback=``;let n=document.createElement(`span`);n.className=`sm-p`,n.dataset.resultsCount=``;let r=document.createElement(`span`);r.className=`sm-p`,r.textContent=`Incluye 1 topping. Cada topping adicional cuesta C$ 30.`,t.append(n,r),e.insertAdjacentElement(`afterend`,t)}let n=document.querySelector(`[data-empty-results]`);return n||(n=document.createElement(`p`),n.className=`menu-empty sm-p hidden`,n.dataset.emptyResults=``,n.textContent=`No encontramos bebidas con ese nombre.`,t.insertAdjacentElement(`afterend`,n)),{count:t.querySelector(`[data-results-count]`),empty:n}}function f(e){let t=e.closest(`.search-form`);if(!t)return null;let n=t.querySelector(`[data-clear-search]`);return n||(n=document.createElement(`button`),n.className=`search-clear hidden`,n.type=`button`,n.dataset.clearSearch=``,n.setAttribute(`aria-label`,`Limpiar búsqueda`),n.innerHTML=`<span class="icon" style="--icon: url('/src/assets/icons/navigation/close.svg')"></span>`,t.insertBefore(n,t.querySelector(`.icon`))),n}function p(e,t){if(!t.count||!t.empty)return;let n=e.reduce((e,t)=>{let n=[...t.querySelectorAll(`.product`)];return e.total+=n.length,e.visible+=n.filter(e=>!e.classList.contains(`hidden`)).length,e},{total:0,visible:0});t.count.textContent=n.visible===n.total?`${n.total} bebidas disponibles`:`${n.visible} de ${n.total} bebidas`,t.empty.classList.toggle(`hidden`,n.visible>0)}function m(e,t){e.forEach(e=>{let n=e===t;e.classList.toggle(`control-primary`,n),e.classList.toggle(`is-active`,n),e.setAttribute(`aria-pressed`,String(n))})}function h(){let e=window.PandaCart,t=document.querySelector(`.search-form input`),r=[...document.querySelectorAll(`.categories [data-category-filter]`)],i=[...document.querySelectorAll(`.drink-section`)],s=d(),l=n;if(!e||!t||!r.length||!i.length)return;let u=f(t);u?.addEventListener(`click`,()=>{t.value=``,t.focus(),h()}),r.forEach((e,t)=>{e.type=`button`,e.setAttribute(`aria-pressed`,String(t===0)),e.classList.toggle(`is-active`,t===0),e.addEventListener(`click`,()=>{l=e.dataset.categoryFilter||n,m(r,e),h()})}),t.addEventListener(`input`,h);function h(){let r=e.normalizeText(t.value),d=!!r;u?.classList.toggle(`hidden`,!d),i.forEach(t=>{let i=e.normalizeText(a(t)),s=e.normalizeText(l),u=l===n||i===s;t.querySelectorAll(`.product`).forEach(t=>{let n=e.normalizeText(o(t)),i=!d||n.includes(r);t.classList.toggle(`hidden`,!u||!i)}),c(t)}),s.empty&&(s.empty.textContent=d&&l!==n?`No encontramos bebidas con esa búsqueda en esta categoría.`:`No encontramos bebidas con ese nombre.`),p(i,s)}h()}function g(e){let t=Array.isArray(e.toppings)?e.toppings:[];return[e.size,t.length?t.join(`, `):`Sin toppings extra`].filter(Boolean).join(` / `)}function _(e){let t=window.PandaCart,n=t.normalizeQuantity(e.quantity),i=t.parsePrice(String(e.price||0)),a=i*n;return`
    <article class="menu-cart-item" data-cart-item-id="${r(e.id)}">
      <div class="menu-cart-item-copy">
        <h3 class="subheading-s">${r(e.name)}</h3>
        <p class="sm-p">${r(g(e))}</p>
        <p class="sm-p">${n} x ${t.formatCurrency(i)} · ${t.formatCurrency(a)}</p>
      </div>

      <div class="menu-cart-item-controls" aria-label="Cantidad">
        <button class="cart-qty-btn" type="button" data-cart-action="decrease" aria-label="Restar ${r(e.name)}">-</button>
        <span>${n}</span>
        <button class="cart-qty-btn" type="button" data-cart-action="increase" aria-label="Sumar ${r(e.name)}">+</button>
        <button class="cart-remove-btn" type="button" data-cart-action="remove">Quitar</button>
      </div>
    </article>
  `}function v(e,{isDialog:t=!1}={}){let n=window.PandaCart,r=n.countCartItems(e),i=n.getCartTotal(e),a=r>0;return`
    <div class="menu-cart-receipt">
      <header class="menu-cart-header">
        <div>
          <p class="sm-p">Tu pedido</p>
          <h2 class="subheading-l">Resumen</h2>
        </div>
        ${t?`<button class="control control-float menu-cart-close" type="button" data-mobile-cart-close aria-label="Cerrar resumen">x</button>`:`<span class="menu-cart-count">${r}</span>`}
      </header>

      <div class="menu-cart-items">
        ${a?e.map(e=>_(e)).join(``):`
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
          <strong>${n.formatCurrency(i)}</strong>
        </div>

        <a class="control control-primary menu-checkout${a?``:` is-disabled`}" href="./checkout.html" data-menu-checkout aria-disabled="${String(!a)}">
          Finalizar pedido
        </a>
      </footer>
    </div>
  `}function y(){let e=window.PandaCart,t=document.querySelector(`[data-menu-cart]`),n=document.querySelector(`[data-mobile-order-bar]`),r=document.querySelector(`[data-mobile-order-label]`),i=document.querySelector(`[data-mobile-order-total]`),a=document.querySelector(`[data-mobile-cart-dialog]`);if(!e||!t||!n||!a)return{render:()=>{}};let o=()=>{let o=e.readCart(),s=e.countCartItems(o),c=e.getCartTotal(o);t.innerHTML=v(o),a.innerHTML=v(o,{isDialog:!0}),n.classList.toggle(`hidden`,s===0),document.body.classList.toggle(`has-mobile-order-bar`,s>0),r&&(r.textContent=`Ver pedido (${s})`),i&&(i.textContent=e.formatCurrency(c))},s=(t,n)=>{let r=e.readCart().find(e=>e.id===t);if(!r)return;let i=e.normalizeQuantity(r.quantity)+n;i<1?e.removeCartItem(t):e.updateCartItem(t,i),o()};return document.addEventListener(`click`,t=>{if(t.target.closest(`[data-menu-checkout]`)?.classList.contains(`is-disabled`)){t.preventDefault();return}if(t.target.closest(`[data-mobile-cart-close]`)){a.close();return}let n=t.target.closest(`[data-cart-action]`);if(!n)return;let r=n.closest(`[data-cart-item-id]`)?.dataset.cartItemId;if(r){if(n.dataset.cartAction===`increase`){s(r,1);return}if(n.dataset.cartAction===`decrease`){s(r,-1);return}n.dataset.cartAction===`remove`&&(e.removeCartItem(r),o())}}),n.addEventListener(`click`,()=>{o(),a.showModal()}),a.addEventListener(`click`,e=>{e.target===a&&a.close()}),a.addEventListener(`cancel`,e=>{e.preventDefault(),a.close()}),o(),document.addEventListener(`panda:cart-change`,o),{render:o}}function b(e){let t=window.PandaCart;document.querySelectorAll(`.add-cart`).forEach(n=>{n.type=`button`;let r=n.closest(`.product`);r&&n.setAttribute(`aria-label`,`Personalizar ${s(r).name}`),n.addEventListener(`click`,async r=>{r.preventDefault(),r.stopPropagation();let i=n.closest(`.product`);if(!i)return;let a=s(i),o=await t.collectCustomization(`Tapioca`,a);o&&(t.addToCart({...a,...o}),e.render(),t.showToast(`Bebida agregada al pedido.`))})})}function x(){l(),u(),h(),b(y())}export{x as initMenuPage};