import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class Products {
    protected items: IProduct[] = [];
    protected selectedProduct: IProduct | null = null;

    constructor(protected events: IEvents) {}

    setItems(items: IProduct[]): void {
        this.items = items;
        this.events.emit('products:changed');
    }

    getItems(): IProduct[] {
        return this.items;
    }

    getProduct(id: string): IProduct | undefined {
        return this.items.find((item) => item.id === id);
    }

    setSelectedProduct(product: IProduct): void {
        this.selectedProduct = product;
        this.events.emit('product:selected');
    }

    getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}