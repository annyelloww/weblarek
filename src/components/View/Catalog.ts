import { Component } from '../base/Component';

interface ICatalog {
    items: HTMLElement[];
}

export class Catalog extends Component<ICatalog> {
    constructor(container: HTMLElement) {
        super(container);
    }

    set items(value: HTMLElement[]) {
        this.container.replaceChildren(...value);
    }
}