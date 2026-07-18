import { Form } from './Form';
import { ensureElement } from '../../utils/utils';

interface IContactsForm {
    email: string;
    phone: string;
    valid: boolean;
    errors: string[];
}

interface IContactsFormActions {
    onEmailChange: (email: string) => void;
    onPhoneChange: (phone: string) => void;
    onSubmit: () => void;
}

export class ContactsForm extends Form<IContactsForm> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, actions: IContactsFormActions) {
        super(container, actions.onSubmit);

        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

        this.emailInput.addEventListener('input', () => {
            actions.onEmailChange(this.emailInput.value);
        });

        this.phoneInput.addEventListener('input', () => {
            actions.onPhoneChange(this.phoneInput.value);
        });
    }

    set email(value: string) {
        this.emailInput.value = value;
    }

    set phone(value: string) {
        this.phoneInput.value = value;
    }
}