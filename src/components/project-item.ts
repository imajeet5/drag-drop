///  <reference path="./base-component.ts"/>

namespace App {
  // ProjectItem Class - this will be the class responsible for rendering a single project item
  export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable {
    // it would also make sense, to store the projects that belongs to this project item
    private project: Project;

    get persons() {
      if (this.project.people === 1) {
        return "1 person";
      } else {
        return `${this.project.people} persons`;
      }
    }

    constructor(hostId: string, project: Project) {
      super("single-project", hostId, false, project.id);
      this.project = project;

      this.configure();
      this.renderContent();
    }

    renderContent() {
      this.element.querySelector("h2")!.textContent = this.project.title;
      this.element.querySelector("h3")!.textContent =
        this.persons + " assigned";
      this.element.querySelector("p")!.textContent = this.project.description;
    }
    configure() {
      this.element.addEventListener("dragstart", this.dragStartHandler);
      this.element.addEventListener("dragend", this.dragEndHandler);
    }

    @autoBind
    dragStartHandler(event: DragEvent) {
      event.dataTransfer!.setData("text/plain", this.project.id);
      event.dataTransfer!.effectAllowed = "move";
    }

    @autoBind
    dragEndHandler(_: DragEvent) {
      console.log("<--------Drag End ----->");
    }
  }
}
