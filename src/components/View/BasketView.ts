import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface IBasketView {
    items: HTMLElement[];
    total: number;
    buttonDisabled: boolean;
}

interface IBasketActions {
    onClick: () => void;
}

export class BasketView extends Component<IBasketView> {
    protected listElement: HTMLElement;
    protected totalElement: HTMLElement;
    protected buttonElement: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: IBasketActions) {
        super(container);

        this.listElement = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        if (actions?.onClick) {
            this.buttonElement.addEventListener('click', actions.onClick);
        }
    }

    set items(value: HTMLElement[]) {
        this.listElement.replaceChildren(...value);
    }

    set total(value: number) {
        this.totalElement.textContent = `${value} синапсов`;
    }

    set buttonDisabled(value: boolean) {
        this.buttonElement.disabled = value;
    }
}