namespace App {
  export interface Draggable {
    // Drag and Drop Interfaces
    //* We use interface here not just to define the structure of the object as we previously use interfaces
    //* But instead to set up a contract which certain class can sign to force these classes to implement
    //* certain methods, that helps us with drag and drop.
    //* using these interface is optional, but this will allows us to provide some code that forces a class
    //* to implement everything it needs to be drag-able or to a valid drop target
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
  }

  export interface DragTarget {
    // this will signal the browser and JS that the thing you are dragging something over is a valid drag target, if you don't do the right thing in the dragOverHandler dropping will not be possible
    dragOverHandler(event: DragEvent): void;
    // We need the drop handler to react to the actual drop that happen
    // if the dragOverHandler permit the drop the dropHandler will handle the drop
    dropHandler(event: DragEvent): void;
    // Is helpful if we are giving some visual feedback to the user, when something is dragged over the box
    // and revert back the change to ui
    dragLeaveHandler(event: DragEvent): void;
  }
}
