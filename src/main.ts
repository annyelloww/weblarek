import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { WebLarekApi } from './components/WebLarekApi';

import { Products } from './components/Models/Products';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';

import { Page } from './components/View/Page';
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

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'));

const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

let orderStep: 'order' | 'contacts' | null = null;

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

    page.render({
        catalog: cards,
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

    const basket = new BasketView(
        cloneTemplate<HTMLElement>('#basket'),
        {
            onClick: () => {
                events.emit('order:open');
            },
        }
    );

    return basket.render({
        items: basketItems,
        total: basketModel.getTotalPrice(),
        buttonDisabled: basketModel.getCount() === 0,
    });
};

const renderOrderForm = () => {
    const buyer = buyerModel.getData();
    const errors = buyerModel.validate();
    const orderErrors = getErrors(errors, ['payment', 'address']);

    const form = new OrderForm(
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

    return form.render({
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

    const form = new ContactsForm(
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

    return form.render({
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
    renderCatalog();
});

events.on('buyer:changed', () => {
    if (orderStep === 'order') {
        modal.render({
            content: renderOrderForm(),
        });
    }

    if (orderStep === 'contacts') {
        modal.render({
            content: renderContactsForm(),
        });
    }
});

events.on<{ product: IProduct }>('card:select', (data) => {
    orderStep = null;
    productsModel.setSelectedProduct(data.product);
});

events.on<{ product: IProduct }>('product:selected', (data) => {
    const product = data.product;
    const isInBasket = basketModel.hasItem(product.id);

    const card = new PreviewCard(
        cloneTemplate<HTMLElement>('#card-preview'),
        {
            onClick: () => {
                events.emit('product:buy', { product });
            },
        }
    );

    modal.render({
        content: card.render({
            ...product,
            buttonText: isInBasket ? 'уже в корзине' : 'в корзину',
            buttonDisabled: isInBasket || product.price === null,
        }),
    });
});

events.on<{ product: IProduct }>('product:buy', (data) => {
    if (!basketModel.hasItem(data.product.id) && data.product.price !== null) {
        basketModel.addItem(data.product);
    }

    modal.close();
});

events.on('basket:open', () => {
    orderStep = null;

    modal.render({
        content: renderBasket(),
    });
});

events.on<{ product: IProduct }>('basket:item-delete', (data) => {
    basketModel.removeItem(data.product);

    modal.render({
        content: renderBasket(),
    });
});

events.on('order:open', () => {
    orderStep = 'order';

    modal.render({
        content: renderOrderForm(),
    });
});

events.on<Partial<IBuyer>>('order:change', (data) => {
    buyerModel.setData(data);
});

events.on('order:submit', () => {
    const errors = buyerModel.validate();
    const orderErrors = getErrors(errors, ['payment', 'address']);

    if (orderErrors.length === 0) {
        orderStep = 'contacts';

        modal.render({
            content: renderContactsForm(),
        });
    }
});

events.on<Partial<IBuyer>>('contacts:change', (data) => {
    buyerModel.setData(data);
});

events.on('contacts:submit', () => {
    const errors = buyerModel.validate();
    const contactsErrors = getErrors(errors, ['email', 'phone']);

    if (contactsErrors.length > 0) {
        modal.render({
            content: renderContactsForm(),
        });

        return;
    }

    const buyer = buyerModel.getData();

    if (!buyer.payment) {
        return;
    }

    const order: IOrderRequest = {
        payment: buyer.payment,
        email: buyer.email,
        phone: buyer.phone,
        address: buyer.address,
        total: basketModel.getTotalPrice(),
        items: basketModel.getItems().map((item) => item.id),
    };

    webLarekApi.orderProducts(order)
        .then((result) => {
            orderStep = null;

            basketModel.clear();
            buyerModel.clear();

            const success = new Success(
                cloneTemplate<HTMLElement>('#success'),
                {
                    onClick: () => {
                        events.emit('success:close');
                    },
                }
            );

            modal.render({
                content: success.render({
                    total: result.total,
                }),
            });
        })
        .catch((error) => {
            console.error('ошибка при оформлении заказа:', error);
        });
});

events.on('success:close', () => {
    orderStep = null;
    modal.close();
});

webLarekApi.getProducts()
    .then((data) => {
        productsModel.setItems(data.items);
    })
    .catch((error) => {
        console.error('ошибка при получении товаров с сервера:', error);
    });