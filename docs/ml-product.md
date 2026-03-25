# HTML Guideline

### Coupon Information `coupon_description`
> In this example the coupon description is "10% OFF. Compra mínima R$ 259"
```html
<label
    class="ui-pdp-color--BLACK ui-pdp-size--XSMALL ui-pdp-family--REGULAR ml-8 ui-vpp-coupons-awareness__checkbox-label"
    for="coupon-awareness-input-id" id="coupon-awareness-row-label"><span></span><span>10% OFF. Compra mínima
    </span><span data-testid="price-part" class="ui-pdp-price__part__container"><span
            class="andes-money-amount ui-pdp-price__part andes-money-amount--cents-comma andes-money-amount--compact"
            role="img" aria-label="259 reais" aria-roledescription="Valor" data-andes-money-amount="true"><span
                class="andes-money-amount__currency" aria-hidden="true" data-andes-money-amount-currency="true"><span
                    class="andes-money-amount__currency-symbol">R$</span></span><span
                class="andes-money-amount__fraction" aria-hidden="true"
                data-andes-money-amount-fraction="true">259</span></span></span><span>.</span></label>
```

### Image `image`
> In this example the image is https://http2.mlstatic.com/D_NQ_NP_675151-MLB77719191531_072024-O.webp
```html
<figure class="ui-pdp-gallery__figure ui-pdp-gallery__figure__with-overlay"><img
        class="ui-pdp-image ui-pdp-gallery__figure__image"
        data-zoom="https://http2.mlstatic.com/D_NQ_NP_2X_675151-MLB77719191531_072024-F.webp" data-index="0"
        data-testid="image-675151-MLB77719191531_072024"
        src="https://http2.mlstatic.com/D_NQ_NP_675151-MLB77719191531_072024-O.webp"
        srcset="https://http2.mlstatic.com/D_Q_NP_675151-MLB77719191531_072024-B.webp 800w, https://http2.mlstatic.com/D_Q_NP_675151-MLB77719191531_072024-L.webp 640w, https://http2.mlstatic.com/D_Q_NP_675151-MLB77719191531_072024-F.webp 1200w, https://http2.mlstatic.com/D_Q_NP_675151-MLB77719191531_072024-C.webp 400w, https://http2.mlstatic.com/D_Q_NP_675151-MLB77719191531_072024-V.webp 320w, https://http2.mlstatic.com/D_NQ_NP_2X_675151-MLB77719191531_072024-F.webp 2x"
        decoding="sync" width="410" height="500" alt="Tênis Feminino Caven 2.0 Puma" fetchpriority="high"
        data-id="_R_q594l69tb6e_" is="n-img" loading="eager">
    <div class="ui-pdp-gallery__overlay ui-pdp-overlay" style="background-color:rgba(0, 0, 0, 0.03)"></div>
</figure>
```

### Title `name`
```html
<h1 class="ui-pdp-title">Tênis Feminino Caven 2.0 Puma</h1>
```

### Old Price `old_price`
> In this example the old price is 449.99
```html
<span data-testid="price-part" class="ui-pdp-price__part__container"><s
        class="andes-money-amount ui-pdp-price__part ui-pdp-price__original-value andes-money-amount--previous andes-money-amount--cents-superscript andes-money-amount--compact"
        style="font-size:16px" role="img" aria-label="Antes: 449 reais com 99 centavos" aria-roledescription="Valor"
        data-andes-money-amount="true" data-andes-money-amount-size="16"><span class="andes-money-amount__currency"
            aria-hidden="true" data-andes-money-amount-currency="true"><span
                class="andes-money-amount__currency-symbol">R$</span></span><span class="andes-money-amount__fraction"
            aria-hidden="true" data-andes-money-amount-fraction="true">449</span><span class="andes-visually-hidden"
            aria-hidden="true">,</span><span class="andes-money-amount__cents andes-money-amount__cents--superscript-16"
            style="font-size:10px;margin-top:1px" aria-hidden="true"
            data-andes-money-amount-cents="true">99</span></s></span>
```

### Current Price `price`
> In this example the price is 282.14
```html
<div class="ui-pdp-price__second-line"><span data-testid="price-part" class="ui-pdp-price__part__container"><span
            class="andes-money-amount ui-pdp-price__part andes-money-amount--cents-superscript andes-money-amount--compact"
            style="font-size:36px" itemprop="offers" itemscope="" itemtype="http://schema.org/Offer" role="img"
            aria-label="282 reais com 14 centavos" aria-roledescription="Valor" data-andes-money-amount="true"
            data-andes-money-amount-size="36">
            <meta itemprop="price" content="282.14"><span class="andes-money-amount__currency" itemprop="priceCurrency"
                aria-hidden="true" data-andes-money-amount-currency="true"><span
                    class="andes-money-amount__currency-symbol">R$</span></span><span
                class="andes-money-amount__fraction" aria-hidden="true"
                data-andes-money-amount-fraction="true">282</span><span class="andes-visually-hidden"
                aria-hidden="true">,</span><span
                class="andes-money-amount__cents andes-money-amount__cents--superscript-36"
                style="font-size:18px;margin-top:4px" aria-hidden="true" data-andes-money-amount-cents="true">14</span>
        </span></span><span
        class="ui-pdp-price__second-line__label ui-pdp-color--GREEN ui-pdp-size--XSMALL ui-pdp-family--REGULAR"><span
            class="andes-money-amount__discount ui-pdp-family--REGULAR ui-pdp-color--GREEN ui-pdp-size--XSMALL"
            style="font-size:14px" data-andes-money-amount-discount="true">37% OFF</span><span
            class="ui-pdp-price__second-line__text">no Pix</span></span></div>
```

### Rating `rating`
> In this example the rating is "Avaliação 4.9 de 5. 1543 opiniões."
```html
<div class="ui-pdp-header__info"><a
        href="/noindex/catalog/reviews/MLB4519181209?noIndex=true&amp;access=view_all&amp;modal=true&amp;show_fae=true"
        class="ui-pdp-review__label ui-pdp-review__label--link" data-testid="review-summary"><span aria-hidden="true"
            class="ui-pdp-review__rating">4.9</span><span aria-hidden="true" class="ui-pdp-review__ratings"><span
                translate="no" class="ui-pdp-icon-wrapper"><svg class="ui-pdp-icon ui-pdp-icon--star-full" width="10"
                    height="10" viewBox="0 0 10 10" fill="none">
                    <use href="#poly_star_fill"></use>
                </svg></span><span translate="no" class="ui-pdp-icon-wrapper"><svg
                    class="ui-pdp-icon ui-pdp-icon--star-full" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <use href="#poly_star_fill"></use>
                </svg></span><span translate="no" class="ui-pdp-icon-wrapper"><svg
                    class="ui-pdp-icon ui-pdp-icon--star-full" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <use href="#poly_star_fill"></use>
                </svg></span><span translate="no" class="ui-pdp-icon-wrapper"><svg
                    class="ui-pdp-icon ui-pdp-icon--star-full" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <use href="#poly_star_fill"></use>
                </svg></span><span translate="no" class="ui-pdp-icon-wrapper"><svg
                    class="ui-pdp-icon ui-pdp-icon--star-full" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <use href="#poly_star_fill"></use>
                </svg></span></span><span class="andes-visually-hidden">Avaliação 4.9 de 5. 1543 opiniões.</span><span
            aria-hidden="true" class="ui-pdp-review__amount">(1543)</span></a></div>
```

### Seller `seller`
> In this example the seller is "Loja Oficial Puma"
```html
<div class="ui-pdp-seller__header">
    <div class="ui-pdp-seller__header__image-container"><img alt="Puma"
            src="https://http2.mlstatic.com/D_NQ_NP_870923-MLA74977618129_032024-G.jpg"
            class="ui-pdp-seller__header__image-container__image" loading="lazy" data-id="_R_6fqj569tb6e_"
            decoding="async" is="n-img"></div>
    <div class="ui-pdp-seller__header__info-container">
        <div class="ui-pdp-seller__header__info-container__title">
            <div class="ui-pdp-seller__header__title"><span class="ui-pdp-seller__label-sold">Loja oficial</span><button
                    class="ui-pdp-seller__link-trigger-button non-selectable" type="button"><a
                        href="https://www.mercadolivre.com.br/loja/puma?item_id=MLB4519181209&amp;category_id=MLB23332&amp;official_store_id=52204&amp;client=recoview-selleritems&amp;recos_listing=true#origin=upp&amp;component=seller&amp;typeSeller=official_store"
                        target="_self" class="ui-pdp-media__action ui-pdp-seller__link"><span>Puma</span></a><span
                        translate="no" class="ui-pdp-icon-wrapper"><img
                            src="https://http2.mlstatic.com/frontend-assets/vpp-frontend/cockade.svg" alt=""
                            class="ui-pdp-icon ui-pdp-cockade-icon" data-id="_R_1acqfqj569tb6e_" decoding="async"
                            is="n-img" loading="lazy"></span></button> </div>
        </div>
        <div class="ui-pdp-seller__header__info-container__subtitle-one-line">
            <p class="ui-pdp-color--BLACK ui-pdp-size--XXSMALL ui-pdp-family--SEMIBOLD ui-pdp-seller__header__subtitle">
                <span>+1 M vendas</span></p>
        </div>
    </div>
</div>
```