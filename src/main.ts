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

let orderStep: 'order' | 'contacts' | null = null;
let modalContent: 'preview' | 'basket' | 'order' | 'contacts' | 'success' | null = null;

const header = new Header(ensureElement<HTMLElement>('.header'), events);
const catalog = new Catalog(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(
    ensureElement<HTMLElement>('#modal-container'),
    {
        onClose: () => {
            orderStep = null;
            modalContent = null;
        },
    }
);

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
        return document.createElement('div');
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
    renderCatalog();

    if (modalContent === 'basket') {
        modal.render({
            content: renderBasket(),
        });
    }

    if (modalContent === 'preview') {
        modal.render({
            content: renderPreviewCard(),
        });
    }
});

events.on('buyer:changed', () => {
    if (orderStep === 'order') {
        renderOrderForm();
    }

    if (orderStep === 'contacts') {
        renderContactsForm();
    }
});

events.on<{ product: IProduct }>('card:select', (data) => {
    orderStep = null;
    productsModel.setSelectedProduct(data.product);
});

events.on('product:selected', () => {
    modalContent = 'preview';

    modal.render({
        content: renderPreviewCard(),
    });
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
});

events.on('basket:open', () => {
    orderStep = null;
    modalContent = 'basket';

    modal.render({
        content: renderBasket(),
    });
});

events.on<{ product: IProduct }>('basket:item-delete', (data) => {
    basketModel.removeItem(data.product);
});

events.on('order:open', () => {
    orderStep = 'order';
    modalContent = 'order';

    modal.render({
        content: renderOrderForm(),
    });
});

events.on<Partial<IBuyer>>('order:change', (data) => {
    buyerModel.setData(data);
});

events.on('order:submit', () => {
    orderStep = 'contacts';
    modalContent = 'contacts';

    modal.render({
        content: renderContactsForm(),
    });
});

events.on<Partial<IBuyer>>('contacts:change', (data) => {
    buyerModel.setData(data);
});

events.on('contacts:submit', () => {
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
            modalContent = 'success';

            basketModel.clear();
            buyerModel.clear();

            modal.render({
                content: successView.render({
                    total: result.total,
                }),
            });
        })
});

events.on('success:close', () => {
    modal.close();
});

renderHeader();

webLarekApi.getProducts()
    .then((data) => {
        productsModel.setItems(data.items);
    })
    .catch((error) => {
        console.error('ошибка при получении товаров с сервера:', error);
    });