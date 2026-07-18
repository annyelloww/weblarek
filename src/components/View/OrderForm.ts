import { TPayment } from '../../types';
import { ensureElement } from '../../utils/utils';
import { Form } from './Form';

interface IOrderForm {
    payment: TPayment | null;
    address: string;
    valid: boolean;
    errors: string[];
}

interface IOrderFormActions {
    onPaymentChange: (payment: TPayment) => void;
    onAddressChange: (address: string) => void;
    onSubmit: () => void;
}

export class OrderForm extends Form<IOrderForm> {
    protected cardButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;
    protected addressInput: HTMLInputElement;

    constructor(container: HTMLFormElement, actions: IOrderFormActions) {
        super(container, actions.onSubmit);

        this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

        this.cardButton.addEventListener('click', () => {
            actions.onPaymentChange('card');
        });

        this.cashButton.addEventListener('click', () => {
            actions.onPaymentChange('cash');
        });

        this.addressInput.addEventListener('input', () => {
            actions.onAddressChange(this.addressInput.value);
        });
    }

    set payment(value: TPayment | null) {
        this.cardButton.classList.toggle('button_alt-active', value === 'card');
        this.cashButton.classList.toggle('button_alt-active', value === 'cash');
    }

    set address(value: string) {
        this.addressInput.value = value;
    }
}