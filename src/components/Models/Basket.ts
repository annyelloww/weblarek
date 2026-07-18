import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class Basket {
    protected items: IProduct[] = [];

    constructor(protected events: IEvents) {}

    getItems(): IProduct[] {
        return this.items;
    }

    addItem(product: IProduct): void {
        this.items.push(product);
        this.emitChanges();
    }

    removeItem(product: IProduct): void {
        this.items = this.items.filter((item) => item.id !== product.id);
        this.emitChanges();
    }

    clear(): void {
        this.items = [];
        this.emitChanges();
    }

    getTotalPrice(): number {
        return this.items.reduce((total, item) => total + (item.price || 0), 0);
    }

    getCount(): number {
        return this.items.length;
    }

    hasItem(id: string): boolean {
        return this.items.some((item) => item.id === id);
    }

    protected emitChanges(): void {
        this.events.emit('basket:changed', {
            items: this.items,
            total: this.getTotalPrice(),
            count: this.getCount(),
        });
    }
}