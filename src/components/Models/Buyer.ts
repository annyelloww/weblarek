import { IBuyer } from '../../types';
import { IEvents } from '../base/Events';

export type TBuyerErrors = Partial<Record<keyof IBuyer, string>>;

export class Buyer {
    protected payment: IBuyer['payment'] = null;
    protected email = '';
    protected phone = '';
    protected address = '';

    constructor(protected events: IEvents) {}

    setData(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) {
            this.payment = data.payment;
        }

        if (data.email !== undefined) {
            this.email = data.email;
        }

        if (data.phone !== undefined) {
            this.phone = data.phone;
        }

        if (data.address !== undefined) {
            this.address = data.address;
        }

        this.emitChanges();
    }

    getData(): IBuyer {
        return {
            payment: this.payment,
            email: this.email,
            phone: this.phone,
            address: this.address,
        };
    }

    clear(): void {
        this.payment = null;
        this.email = '';
        this.phone = '';
        this.address = '';

        this.emitChanges();
    }

    validate(): TBuyerErrors {
        const errors: TBuyerErrors = {};

        if (!this.payment) {
            errors.payment = 'не выбран способ оплаты';
        }

        if (!this.address) {
            errors.address = 'укажите адрес доставки';
        }

        if (!this.email) {
            errors.email = 'укажите email';
        }

        if (!this.phone) {
            errors.phone = 'укажите телефон';
        }

        return errors;
    }

    protected emitChanges(): void {
        this.events.emit('buyer:changed', {
            buyer: this.getData(),
            errors: this.validate(),
        });
    }
}