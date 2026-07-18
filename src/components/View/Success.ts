import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface ISuccess {
    total: number;
}

interface ISuccessActions {
    onClick: () => void;
}

export class Success extends Component<ISuccess> {
    protected descriptionElement: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ISuccessActions) {
        super(container);

        this.descriptionElement = ensureElement<HTMLElement>('.order-success__description', this.container);
        this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);

        if (actions?.onClick) {
            this.closeButton.addEventListener('click', actions.onClick);
        }
    }

    set total(value: number) {
        this.descriptionElement.textContent = `списано ${value} синапсов`;
    }
}