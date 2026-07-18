import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface IFormState {
    valid: boolean;
    errors: string[];
}

export abstract class Form<T> extends Component<T & IFormState> {
    protected submitButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;

    constructor(container: HTMLFormElement, protected onSubmit: () => void) {
        super(container);

        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.onSubmit();
        });
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }

    set errors(value: string[]) {
        this.errorsElement.textContent = value.join('; ');
    }
}