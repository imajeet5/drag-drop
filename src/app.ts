// Code goes here!
/***
 * * First render the form
 * * JS will fetches whatever user enter into the form.
 * * Validate what the user enters - Title, Description and People has valid values
 * * Listen to the click on the submit button
 * * Then create a new project, a new javascript object in the end - which is stored in some array
 * * Then this array is rendered to the list
 * * Then entire list also need to added to the DOM
 */

// Validation
// first we define the type of validate object
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(args: Validatable) {
  let isValid: boolean = true;
  if (args.required) {
    isValid = isValid && args.value.toString().trim().length !== 0;
  }
  if (
    args.minLength != null &&
    typeof args.value === "string" &&
    isValid === true
  ) {
    isValid = isValid && args.value.length > args.minLength;
  }
  if (
    args.maxLength != null &&
    typeof args.value === "string" &&
    isValid === true
  ) {
    isValid = isValid && args.value.length < args.maxLength;
  }
  if (args.min != null && typeof args.value === "number") {
    isValid = isValid && args.value >= args.min;
  }
  if (args.max != null && typeof args.value === "number") {
    isValid = isValid && args.value <= args.max;
  }
  //* Will later implement the check for the case when user enter a number in string field
  //* Because NaN === NaN is false
  // if (typeof args.value === "string") {
  //   console.log(+args.value);
  //   console.log(+args.value === NaN);
  //   // isValid = false;
  // }

  return isValid;
}

//autoBind decorator
function autoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  // console.log(descriptor);
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjDescriptor;
}

// Drag and Drop Interfaces
//* We use interface here not just to define the structure of the object as we previously use interfaces
//* But instead to set up a contract which certain class can sign to force these classes to implement
//* certain methods, that helps us with drag and drop.
//* using these interface is optional, but this will allows us to provide some code that forces a class
//* to implement everything it needs to be drag-able or to a valid drop target

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  // this will signal the browser and JS that the thing you are dragging something over is a valid drag target, if you don't do the right thing in the dragOverHandler dropping will not be possible
  dragOverHandler(event: DragEvent): void;
  // We need the drop handler to react to the actual drop that happen
  // if the dragOverHandler permit the drop the dropHandler will handle the drop
  dropHandler(event: DragEvent): void;
  // Is helpful if we are giving some visual feedback to the user, when something is dragged over the box
  // and revert back the change to ui
  dragLeaveHandler(event: DragEvent): void;
}

/// <reference path="drag-drop-interfaces.ts"/>

// Project type
enum ProjectStatus {
  Active,
  Finished
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management, we will create this as a singleton class - one one instance of class
type RendererFunc<T> = (items: T[]) => void;

//Base Project State Class
class State<T> {
  protected rendererFunctions: RendererFunc<T>[] = [];

  public addRenderFn(renderFn: RendererFunc<T>) {
    this.rendererFunctions.push(renderFn);
    console.log(this.rendererFunctions);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }
  // act as sudo constructor
  public static getInstance(): ProjectState {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  public addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.reRender();

    //* So what happen is, whenever a new project is added, all the renderFunctions will get called
    //* And they will re-render the new project array instead of just rendering the new project
  }

  moveProject(pid: string, newStatus: ProjectStatus) {
    const p = this.projects.find(project => project.id === pid);
    if (p && p.status !== newStatus) {
      p.status = newStatus;
      this.reRender();
    }
  }
  private reRender() {
    for (const renderFn of this.rendererFunctions) {
      // adding slice will return the copy of that array, so it can't be added from the place where the listener functions are coming from
      // Because arrays and objects are reference values in JS, if we pass the original array we could edit it from outside.
      renderFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

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
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

/************************************************************************** */

// ProjectItem Class - this will be the class responsible for rendering a single project item
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
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
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
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

/********************************************************************************* */

// ProjectList Class - Active Project and Finished Projects
class ProjectList extends Component<HTMLDivElement, HTMLElement>
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
    console.log("<--------Dropped ------------->");
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
    console.log("dragLeaveHandler executed");
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

/****************************************************************************** */

// Project Input Class -- Input Form
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLTextAreaElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLTextAreaElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInputs = this.gatherUserInput();
    // Problem is at runtime we have no way of checking whether it is a tuple
    if (Array.isArray(userInputs)) {
      const [title, desc, people] = userInputs;
      // console.log(title, desc, people);
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!!");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }
}

// this will create the input form
new ProjectInput();
// this will create the active section of the projects
new ProjectList("active");
// this will create the finished section of the projects
new ProjectList("finished");

// projInp.getInputValues()

/**
 * * We will create another class, which will be responsible for rendering a list of projects
 * * We will split that into two classes, one class for the list, other class per project item in the list
 * * Then we need some way of passing the gathered input to our project list and add a new item to it.
 * * When we click add project, we create a new project in code, a new data structure which represents a
 * * project. And then we pass the information about this new project to the active project list we have
 *
 * * We want to transfer the information that we have a new project to the project list class
 * * Because that is that class that is responsible for outputing to screen
 * * So for that we will set up the subscription pattern.
 * * Where inside of our project state, we manager a list of functions (listeners), which should be called
 * * whenever something changes.
 * * The idea is whenever something changes, like in add project function when we add new project
 * * We call all the listener function by looping through them
 */

/****
 * * we will add a base class, which will have template element, host element, element
 */
