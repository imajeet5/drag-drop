///  <reference path="./base-component.ts"/>
namespace App {
  // ProjectList Class - Active Project and Finished Projects
  export class ProjectList extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget {
    assignedProjects: Project[] = [];

    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`);
      //? I think we are repeating this code as it is also in super.
      this.element.id = `${this.type}-projects`;

      //Configure the render functions
      this.configure();
      this.renderContent();
    }

    @autoBind
    dragOverHandler(event: DragEvent) {
      if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
        // Prevent default to tell JS browser, that for this element we want to allow a drop
        // If we dont preventDefault the drop will not take place
        event.preventDefault();
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.add("droppable");
        // console.log("<-------Hovering----------->");
      }
    }

    @autoBind
    dropHandler(event: DragEvent) {
      const pid = event.dataTransfer!.getData("text/plain");
      projectState.moveProject(
        pid,
        this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
      );
    }

    @autoBind
    dragLeaveHandler(_: DragEvent) {
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.remove("droppable");
    }

    configure() {
      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
      this.element.addEventListener("drop", this.dropHandler);

      // we are not rendering here, but we adding the renderer of this instance to the global renderer
      // this function will not get call here but in the addProject function in ProjectState Class
      // so whenever we add a new project, these rendered will get called
      projectState.addRenderFn((projects: Project[]) => {
        const relevantProjects = projects.filter(p => {
          // if this instance is of type active then filter our all the active project for render
          if (this.type === "active") {
            return p.status === ProjectStatus.Active;
          }
          // if this instance is of type finished then filter out all the finished projects
          return p.status === ProjectStatus.Finished;
        });
        this.assignedProjects = relevantProjects;
        this.renderProjects();
      });
    }

    renderContent() {
      const listId = `${this.type}-projects-list`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector("h2")!.textContent =
        this.type.toUpperCase() + " PROJECTS";
    }

    // the best possible solution here would be to kind of run some comparison, to check what has already
    // been render and what we nee to render to avoid unnecessary re-rendering
    private renderProjects() {
      const listEl = document.getElementById(
        `${this.type}-projects-list`
      )! as HTMLUListElement;
      listEl.innerHTML = "";
      for (const projectItem of this.assignedProjects) {
        new ProjectItem(`${this.type}-projects-list`, projectItem);
        // const listItem = document.createElement("li");
        // listItem.textContent = projectItem.title;
        // listEl.appendChild(listItem);
      }
    }
  }
}
