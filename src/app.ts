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

/// <reference path="./models/project-model.ts"/>
///  <reference path="./models/project-model.ts"/>
///  <reference path="./state/project-state.ts"/>
///  <reference path="./util/validation.ts"/>
///  <reference path="./decorators/autobind.ts"/>
// /  <reference path="./components/base-component.ts"/>
///  <reference path="./components/project-list.ts"/>
///  <reference path="./components/project-item.ts"/>
///  <reference path="./components/project-input.ts"/>

namespace App {
  // this will create the input form
  new ProjectInput();
  // this will create the active section of the projects
  new ProjectList("active");
  // this will create the finished section of the projects
  new ProjectList("finished");
}

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
