import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { WebLarekApi } from './components/WebLarekApi';

import { Products } from './components/Models/Products';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';

import { Header } from './components/View/Header';
import { Catalog } from './components/View/Catalog';
import { Modal } from './components/View/Modal';
import { CatalogCard, PreviewCard, BasketCard } from './components/View/Card';
import { BasketView } from './components/View/BasketView';
import { OrderForm } from './components/View/OrderForm';
import { ContactsForm } from './components/View/ContactsForm';
import { Success } from './components/View/Success';

import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

import type { IBuyer, IProduct, IOrderRequest, TPayment } from './types';

const events = new EventEmitter();

const productsModel = new Products(events);
const basketModel = new Basket(events);
const buyerModel = new Buyer(events);

const header = new Header(ensureElement<HTMLElement>('.header'), events);
const catalog = new Catalog(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'));

const basketView = new BasketView(
    cloneTemplate<HTMLElement>('#basket'),
    {
        onClick: () => {
            events.emit('order:open');
        },
    }
);

const previewCard = new PreviewCard(
    cloneTemplate<HTMLElement>('#card-preview'),
    {
        onClick: () => {
            events.emit('product:buy');
        },
    }
);

const orderForm = new OrderForm(
    cloneTemplate<HTMLFormElement>('#order'),
    {
        onPaymentChange: (payment: TPayment) => {
            events.emit('order:change', { payment });
        },
        onAddressChange: (address: string) => {
            events.emit('order:change', { address });
        },
        onSubmit: () => {
            events.emit('order:submit');
        },
    }
);

const contactsForm = new ContactsForm(
    cloneTemplate<HTMLFormElement>('#contacts'),
    {
        onEmailChange: (email: string) => {
            events.emit('contacts:change', { email });
        },
        onPhoneChange: (phone: string) => {
            events.emit('contacts:change', { phone });
        },
        onSubmit: () => {
            events.emit('contacts:submit');
        },
    }
);

const successView = new Success(
    cloneTemplate<HTMLElement>('#success'),
    {
        onClick: () => {
            events.emit('success:close');
        },
    }
);

const basketElement = basketView.render({
    items: [],
    total: 0,
    buttonDisabled: true,
});

const orderFormElement = orderForm.render({
    payment: buyerModel.getData().payment,
    address: buyerModel.getData().address,
    valid: false,
    errors: [],
});

const contactsFormElement = contactsForm.render({
    email: buyerModel.getData().email,
    phone: buyerModel.getData().phone,
    valid: false,
    errors: [],
});

const successElement = successView.render({
    total: 0,
});

const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

const getErrors = (
    errors: Partial<Record<keyof IBuyer, string>>,
    fields: Array<keyof IBuyer>
) => {
    return fields
        .map((field) => errors[field])
        .filter((error): error is string => Boolean(error));
};

const renderCatalog = () => {
    const cards = productsModel.getItems().map((product) => {
        const card = new CatalogCard(
            cloneTemplate<HTMLElement>('#card-catalog'),
            {
                onClick: () => {
                    events.emit('card:select', { product });
                },
            }
        );

        return card.render(product);
    });

    catalog.render({
        items: cards,
    });
};

const renderHeader = () => {
    header.render({
        basketCounter: basketModel.getCount(),
    });
};

const renderBasket = () => {
    const basketItems = basketModel.getItems().map((product, index) => {
        const card = new BasketCard(
            cloneTemplate<HTMLElement>('#card-basket'),
            {
                onClick: () => {
                    events.emit('basket:item-delete', { product });
                },
            }
        );

        return card.render({
            ...product,
            index: index + 1,
        });
    });

    return basketView.render({
        items: basketItems,
        total: basketModel.getTotalPrice(),
        buttonDisabled: basketModel.getCount() === 0,
    });
};

const renderPreviewCard = () => {
    const product = productsModel.getSelectedProduct();

    if (!product) {
        return null;
    }

    const isInBasket = basketModel.hasItem(product.id);

    return previewCard.render({
        ...product,
        buttonText: product.price === null
            ? 'Недоступно'
            : isInBasket
                ? 'Удалить из корзины'
                : 'В корзину',
        buttonDisabled: product.price === null,
    });
};

const renderOrderForm = () => {
    const buyer = buyerModel.getData();
    const errors = buyerModel.validate();
    const orderErrors = getErrors(errors, ['payment', 'address']);

    return orderForm.render({
        payment: buyer.payment,
        address: buyer.address,
        valid: orderErrors.length === 0,
        errors: orderErrors,
    });
};

const renderContactsForm = () => {
    const buyer = buyerModel.getData();
    const errors = buyerModel.validate();
    const contactsErrors = getErrors(errors, ['email', 'phone']);

    return contactsForm.render({
        email: buyer.email,
        phone: buyer.phone,
        valid: contactsErrors.length === 0,
        errors: contactsErrors,
    });
};

events.on('products:changed', () => {
    renderCatalog();
});

events.on('basket:changed', () => {
    renderHeader();
    renderBasket();
    renderPreviewCard();
});

events.on('buyer:changed', () => {
    renderOrderForm();
    renderContactsForm();
});

events.on<{ product: IProduct }>('card:select', (data) => {
    productsModel.setSelectedProduct(data.product);
});

events.on('product:selected', () => {
    const preview = renderPreviewCard();

    if (preview) {
        modal.render({
            content: preview,
        });
    }
});

events.on('product:buy', () => {
    const product = productsModel.getSelectedProduct();

    if (!product || product.price === null) {
        return;
    }

    if (basketModel.hasItem(product.id)) {
        basketModel.removeItem(product);
    } else {
        basketModel.addItem(product);
    }

    modal.close();
});

events.on('basket:open', () => {
    modal.render({
        content: basketElement,
    });
});

events.on<{ product: IProduct }>('basket:item-delete', (data) => {
    basketModel.removeItem(data.product);
});

events.on('order:open', () => {
    modal.render({
        content: orderFormElement,
    });
});

events.on<Partial<IBuyer>>('order:change', (data) => {
    buyerModel.setData(data);
});

events.on('order:submit', () => {
    modal.render({
        content: contactsFormElement,
    });
});

events.on<Partial<IBuyer>>('contacts:change', (data) => {
    buyerModel.setData(data);
});

events.on('contacts:submit', () => {
    const buyer = buyerModel.getData();

    const order: IOrderRequest = {
        payment: buyer.payment as IOrderRequest['payment'],
        email: buyer.email,
        phone: buyer.phone,
        address: buyer.address,
        total: basketModel.getTotalPrice(),
        items: basketModel.getItems().map((item) => item.id),
    };

    webLarekApi.orderProducts(order)
        .then((result) => {
            basketModel.clear();
            buyerModel.clear();

            successView.render({
                total: result.total,
            });

            modal.render({
                content: successElement,
            });
        })
        .catch((error) => {
            console.error('ошибка при оформлении заказа:', error);
        });
});

events.on('success:close', () => {
    modal.close();
});

renderHeader();
renderBasket();
renderOrderForm();
renderContactsForm();

webLarekApi.getProducts()
    .then((data) => {
        productsModel.setItems(data.items);
    })
    .catch((error) => {
        console.error('ошибка при получении товаров с сервера:', error);
    });