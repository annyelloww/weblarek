import './scss/styles.scss';

import { apiProducts } from './utils/data';
import { Products } from './components/Models/Products';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';
import { Api } from './components/base/Api';
import { WebLarekApi } from './components/WebLarekApi';
import { API_URL } from './utils/constants';

const productsModel = new Products();
const basketModel = new Basket();
const buyerModel = new Buyer();

productsModel.setItems(apiProducts.items);

console.log('массив товаров из каталога:', productsModel.getItems());

const firstProduct = productsModel.getItems()[0];

console.log('первый товар:', firstProduct);
console.log('товар по id:', productsModel.getProduct(firstProduct.id));

productsModel.setSelectedProduct(firstProduct);
console.log('выбранный товар:', productsModel.getSelectedProduct());

basketModel.addItem(firstProduct);

console.log('товары в корзине:', basketModel.getItems());
console.log('количество товаров в корзине:', basketModel.getCount());
console.log('общая стоимость корзины:', basketModel.getTotalPrice());
console.log('товар есть в корзине:', basketModel.hasItem(firstProduct.id));

basketModel.removeItem(firstProduct);

console.log('корзина после удаления товара:', basketModel.getItems());

basketModel.addItem(firstProduct);
basketModel.clear();

console.log('корзина после очистки:', basketModel.getItems());

buyerModel.setData({
    payment: 'card',
    address: 'санкт-петербург, невский проспект, 1',
});

console.log('данные покупателя после первого шага:', buyerModel.getData());
console.log('ошибки валидации покупателя:', buyerModel.validate());

buyerModel.setData({
    email: 'test@test.ru',
    phone: '+79999999999',
});

console.log('данные покупателя после второго шага:', buyerModel.getData());
console.log('ошибки валидации после заполнения:', buyerModel.validate());

buyerModel.clear();

console.log('данные покупателя после очистки:', buyerModel.getData());

const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

webLarekApi.getProducts()
    .then((data) => {
        productsModel.setItems(data.items);
        console.log('каталог товаров с сервера:', productsModel.getItems());
    })
    .catch((error) => {
        console.error('ошибка при получении товаров с сервера:', error);
    });
