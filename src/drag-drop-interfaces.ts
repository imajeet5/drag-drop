namespace App {
  export interface Draggable {
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
