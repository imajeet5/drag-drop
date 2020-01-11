namespace App {
  // Component Base class
  /***
   * * We can think of these classes as UI components, which we render to the screen, and every component is
   * * in the end a renderable object which has some functionalities that allows us to render it.
   * * Then the concrete instances or the inherited classes add extra functionality which that specific
   * * component needs
   * * We don't know that type element is going to be, so we overcame this by not just using
   * * inheritance but by using a generic class here, i.e. type is set dynamically
   * * where when we inherit from it we can set the concrete types
   * * Now when we inherit from this class, we can specify the concrete types, so that we can work with
   * * different types in different places where we inherit
   * * We need to know the id of the template so that we know how to select it
   * * We need to know that host element id, so that we know where to render this component
   * * We also get newElement id so that we get an id that has to be assigned to the newly rendered element
   * * we also mark this class as Abstract class, so that we can't directly instantiate it instead
   * * it should always be used for inheritance
   * * we also add config method and renderContent() method, which means concrete implelemention will not be
   * * be there be we force any class inheriting from Component class to add these two methods and have them
   * * available
   * * This class will just render the given template at the given position.
   */
  export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;
    constructor(
      templateId: string,
      hostElementId: string,
      insertAtStart: boolean,
      newElementId?: string
    ) {
      this.templateElement = document.getElementById(
        templateId
      )! as HTMLTemplateElement;

      this.hostElement = document.getElementById(hostElementId)! as T;
      const template = document.importNode(this.templateElement.content, true);
      this.element = template.firstElementChild as U;

      if (newElementId) this.element.id = newElementId;

      this.attach(insertAtStart);
    }
    private attach(insertAtStr: boolean) {
      this.hostElement.insertAdjacentElement(
        insertAtStr ? "afterbegin" : "beforeend",
        this.element
      );
    }
    abstract configure(): void;
    abstract renderContent(): void;
  }
}
