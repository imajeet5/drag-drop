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
type RendererFunc = (items: Project[]) => void;

class ProjectState {
  private rendererFunctions: RendererFunc[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}
  // act as sudo constructor
  public static getInstance(): ProjectState {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  public addRenderFn(renderFn: RendererFunc) {
    this.rendererFunctions.push(renderFn);
    console.log(this.rendererFunctions);
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
    console.log(this.projects);
    //* So what happen is, whenever a new project is added, all the renderFunctions will get called
    //* And they will re-render the new project array instead of just rendering the new project
    for (const renderFn of this.rendererFunctions) {
      // adding slice will return the copy of that array, so it can't be added from the place where the listener functions are coming from
      // Because arrays and objects are reference values in JS, if we pass the original array we could edit it from outside.
      renderFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// ProjectList Class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;

    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const template = document.importNode(this.templateElement.content, true);

    this.element = template.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    // console.log(this.element);
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
    this.attach();
    this.renderContent();
  }

  // the best possible solution here would be to kind of run some comparison, to check what has already
  // been render and what we nee to render to avoid unnecessary re-rendering
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const projectItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = projectItem.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

// Project Input Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  // element2: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLTextAreaElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;

    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    // we get document fragment by this not the HTML element
    // Here we are importing the HTML template from the document
    const template = document.importNode(this.templateElement.content, true);
    // const template2 = document.importNode(this.templateElement.content, true);
    this.element = template.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";
    // console.log(this.element);

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;

    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLTextAreaElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    // console.log(this.titleInputElement);
    this.configure();
    this.attach();
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

    // if (
    //   enteredTitle.trim().length === 0 ||
    //   enteredDescription.trim().length === 0 ||
    //   enteredPeople.trim().length === 0
    // ) {
    //   alert("Invalid input please try again!");
    //   return;
    // } else {
    //   return [enteredTitle, enteredDescription, +enteredPeople];
    // }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

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

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");

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
