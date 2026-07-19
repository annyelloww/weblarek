import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface IModal {
    content: HTMLElement;
}

interface IModalActions {
    onClose: () => void;
}

export class Modal extends Component<IModal> {
    protected closeButton: HTMLButtonElement;
    protected contentElement: HTMLElement;

    constructor(container: HTMLElement, protected actions?: IModalActions) {
        super(container);

        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
        this.contentElement = ensureElement<HTMLElement>('.modal__content', this.container);

        this.closeButton.addEventListener('click', () => {
            this.close();
        });

        this.container.addEventListener('click', (event) => {
            if (event.target === this.container) {
                this.close();
            }
        });
    }

    set content(value: HTMLElement) {
        this.contentElement.replaceChildren(value);
    }

    open() {
        this.container.classList.add('modal_active');
    }

    close() {
        this.container.classList.remove('modal_active');
        this.contentElement.replaceChildren();

        if (this.actions?.onClose) {
            this.actions.onClose();
        }
    }

    render(data: IModal): HTMLElement {
        super.render(data);
        this.open();

        return this.container;
    }
}