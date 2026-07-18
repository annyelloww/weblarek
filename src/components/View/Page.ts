import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";

interface IPage {
    catalog: HTMLElement[];
    basketCounter: number;
}

export class Page extends Component<IPage> {
    protected gallery: HTMLElement;
    protected basketButton: HTMLButtonElement;
    protected basketCounterElement: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.gallery = ensureElement<HTMLElement>('.gallery', this.container);
        this.basketButton = ensureElement<HTMLButtonElement>('.header__basket', this.container);
        this.basketCounterElement = ensureElement<HTMLElement>('.header__basket-counter', this.container);

        this.basketButton.addEventListener('click', () => {
            this.events.emit('basket:open')
        })
    }

    set catalog(items: HTMLElement[]) {
        this.gallery.replaceChildren(...items);
    }

    set basketCounter(value: number) {
        this.basketCounterElement.textContent = String(value);
    }
}