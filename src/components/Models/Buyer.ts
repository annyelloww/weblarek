import { IBuyer } from '../../types';

export type TBuyerErrors = Partial<Record<keyof IBuyer, string>>;

export class Buyer {
    protected payment: IBuyer['payment'] | null = null;
    protected email = '';
    protected phone = '';
    protected address = '';

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
    }

    getData(): IBuyer {
        return {
            payment: this.payment as IBuyer['payment'],
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
}