namespace App {
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

  //! nOt importing class here
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

  export const projectState = ProjectState.getInstance();
}
