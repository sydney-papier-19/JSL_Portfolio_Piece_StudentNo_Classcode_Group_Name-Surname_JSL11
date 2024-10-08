// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
 sideBar : document.getElementById("side-bar-div"), 
 logo: document.getElementById("logo"),
 
 themeSwitch: document.getElementById("switch"),
 labelCheckboxTheme : document.getElementById("label-checkbox-theme"),
 hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
 showSideBarBtn: document.getElementById("show-side-bar-btn"),
 headerBoardName: document.getElementById("header-board-name"),
 addNewTaskBtn: document.getElementById("add-new-task-btn"),
addNewBoardBtn: document.getElementById("create-board-btn"),

 editBoardDiv: document.getElementById("editBoardDiv"),
 editBoardBtn: document.getElementById("edit-board-btn"),
 deleteBoardBtn: document.getElementById("deleteBoardBtn"),
//Tasks Column
//ToDo
todoTasksContainer: document.querySelector("[data-status='todo'] .tasks-container"),
//Doing
doingTasksContainer:document.querySelector("[data-status='doing'] .tasks-container"),
//Done
doneTasksContainer: document.querySelector("[data-status='done'] .tasks-container"),
//Modals
//New Task Modal
newTaskModalWindow:document.getElementById("new-task-modal-window"),
createTaskBtn:document.getElementById("create-task-btn"),
cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),

//Edit task modal
editTaskForm: document.getElementById("edit-task-form"),
saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
cancelEditBtn: document.getElementById("cancel-edit-btn"),
deleteTaskBtn: document.getElementById("delete-task-btn"),
//Dropdown for Board Selection
dropdownBtn: document.getElementById("dropdownBtn"),
dropDownIcon: document.getElementById("dropDownIcon"),
//Task Inputs (for task creation/editing)
//Task Title
taskTitleInput: document.getElementById("title-input"),
//Task description
taskDescInput: document.getElementById("desc-input"),
// Task status selection
taskStatusSelect: document.getElementById("select-status"),
//Edit Task Inputs
editTaskModal: document.getElementById("edit-task-modal-window"),
//Task title
editTaskTitleInput: document.getElementById("edit-task-title-input"),
//Task description
editTaskDescInput: document.getElementById("edit-task-desc-input"),
//task status
editTaskStatusSelect: document.getElementById("edit-select-status"),

//filter div
filterDiv: document.getElementById('filterDiv'),
columnDivs: document.querySelectorAll(".column-div"),
deleteTaskCancelBtn: document.getElementById("delete-task-cancel-btn"),
saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
};

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks(); // Fetch tasks from localStorage or a default empty array
  const boards =  JSON.parse(localStorage.getItem('boards')) || []; // Get the list of boards from localStorage
  displayBoards(boards);

  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    //
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container

  boards.forEach(board => {
    const boardElement = document.createElement("div"); // Changed from button to div to contain both board name and delete button
    const boardButton = document.createElement("button");
    boardButton.textContent = board;
    boardButton.classList.add("board-btn");
    //added a click event listener correctly 
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
  
     // Create a delete button for each board
     const deleteBoardBtn = document.createElement("button");
     deleteBoardBtn.textContent = "Delete";
     deleteBoardBtn.classList.add("delete-board-btn");
     deleteBoardBtn.addEventListener('click', (event) => {
       event.stopPropagation(); // Prevents triggering the board click event
       deleteBoard(board);
     });

        // Append the board button and delete button to the board element
    boardElement.appendChild(boardButton);
    boardElement.appendChild(deleteBoardBtn);

    // Append the board element to the container
    boardsContainer.appendChild(boardElement);
  });
   
   // Re-append the "Add New Board" button after displaying boards
   const addBoardButton = document.createElement("button");
   addBoardButton.textContent = "Add New Board";
   addBoardButton.id = "add-new-board-btn";
   addBoardButton.addEventListener('click', () => {
     const newBoardName = prompt("Enter new board name");
     if (newBoardName) {
       createNewBoard(newBoardName);
     }
   });
 
   boardsContainer.appendChild(addBoardButton);
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);//filtering tasks by board using a comparison 

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    //replaced '='(assignment) with '==='(comparison)
    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      //added () after 'click', - proper syntax
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') //add is a method of classList
    }
    else {
      btn.classList.remove('active'); //remove is a method of classList
    }
  });
}

//Adds a new task to the UI under the correct status column (e.g., "To Do", "In Progress", etc.).
function addTaskToUI(task) {
  //Selects the column based on the status attribute that matches the task's status.
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); //replaced "" with backticks ``
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }
//If the tasks container doesn’t exist (within the column), it creates one.
  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  // Append the task element to the container
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Listen for "Add New Board" button click
elements.addNewBoardBtn.addEventListener('click', () => {
  const newBoardName = prompt("Enter the new board name:");
  if (newBoardName) {
    createNewBoard(newBoardName);
  }
});

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.newTaskModalWindow.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    addTask(event);
  });
  

   // Get button elements from the task modal
   const saveChangesButton = document.querySelector("#saveChangesButton");//Clicking this button saves the updated task details.
   const deleteTaskButton = document.querySelector("#deleteTaskButton");//Clicking this button deletes the task and closes the modal.
 
   // Call saveTaskChanges upon click of Save Changes button
   saveChangesButton.onclick = () => {
     saveTaskChanges(task.id);
 };
 
   // Delete task using a helper function and close the task modal
   deleteTaskButton.onclick = () => {
     deleteTask(task.id);
     toggleModal(false, elements.editTaskModal); // Hide the edit task modal
     refreshTasksUI(); // Refresh UI to reflect the deleted task
 };
}

// Toggles tasks modal
//Toggles the display of the modal window based on the value of show (true or false).
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  //ternary operater uses : and not =>
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function createNewBoard(boardName) {
  // Ensure boardName is trimmed to avoid issues with leading/trailing spaces
  boardName = boardName.trim();

  // Ensure boardName is not empty after trimming
  if (!boardName) {
    alert('Board name cannot be empty. Please enter a valid name.');
    return;
  }

  // Get the list of existing boards from localStorage
  const boards = JSON.parse(localStorage.getItem('boards')) || [];

  // Convert both existing board names and the new boardName to lowercase for case-insensitive comparison
  const existingBoard = boards.find(board => board.toLowerCase() === boardName.toLowerCase());

  // If a board with the same name (case-insensitive) exists, show an alert
  if (existingBoard) {
    alert('A board with this name already exists. Please choose a different name.');
    return; // Exit the function if the board is a duplicate
  }

  // Add the new board to the boards array and save it to localStorage
  boards.push(boardName);
  localStorage.setItem('boards', JSON.stringify(boards));

  // Set the new board as the active board
  activeBoard = boardName;
  localStorage.setItem('activeBoard', JSON.stringify(activeBoard));

  // Update the UI to display the new board
  elements.headerBoardName.textContent = boardName;
  displayBoards(boards); // Refresh the list of boards in the UI
}


function deleteBoard(boardName) {
  // Retrieve the current boards and tasks from localStorage
  const boards = JSON.parse(localStorage.getItem('boards')) || [];
  const tasks = getTasks();

  // Remove the selected board from the boards array
  const updatedBoards = boards.filter(board => board !== boardName);
  localStorage.setItem('boards', JSON.stringify(updatedBoards));

  // Remove tasks associated with the deleted board
  const updatedTasks = tasks.filter(task => task.board !== boardName);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));

  // If the active board is deleted, set the active board to the first available one
  if (activeBoard === boardName && updatedBoards.length > 0) {
    activeBoard = updatedBoards[0];
    localStorage.setItem('activeBoard', JSON.stringify(activeBoard));
  } else if (updatedBoards.length === 0) {
    activeBoard = "";
    localStorage.removeItem("activeBoard");
  }

  // Refresh the UI
  elements.headerBoardName.textContent = activeBoard || 'No Board Selected';
  displayBoards(updatedBoards);
  refreshTasksUI();
}



function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      title: elements.taskTitleInput.value.trim(),       // Get the task title
      description: elements.taskDescInput.value.trim(),  // Get the task description
      status: elements.taskStatusSelect.value,            // Get the task status
      board: activeBoard, //assigns the task to the current active board
      id: Date.now(), //unique id for task
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }

}

//Function for sidebar toggles
function toggleSidebar(show) {
 
  elements.showSideBarBtn.style.display = show ? "none" : "block";
  elements.sideBar.style.display = show ? "block" : "none";

}
 
//function for dark/light mode
function toggleTheme() {
  const body = document.body; // Get the body element
  const isLightTheme = body.classList.contains('light-theme'); // Check if dark mode is currently applied

  if (isLightTheme) {
    body.classList.remove('light-theme'); // Switch to dark mode
    localStorage.setItem('ligt-theme', 'active' ); // Save the preference to local storage
  } else {
    body.classList.add('light-theme'); // Switch to light mode
    localStorage.setItem('theme', 'light-theme'); // Save the preference to local storage
  }
// Add event listener to the theme switch checkbox
document.getElementById('switch').addEventListener('change', toggleTheme);

  // On page load, set the theme based on the user's previous preference
  document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light-theme') {
      document.body.classList.add('light-theme'); // Apply dark mode if saved in local storage
      document.getElementById('switch').checked = true; // Set the checkbox to checked for light mode
    }
  });

}

//function will populate the modal with the task's current details and set up event listeners for the save and delete actions.
function openEditTaskModal(task) {
  // Set task details in modal inputs
   // Set task details in modal inputs
   const taskDueDateInput = document.querySelector("#editTaskDueDate");

   // Populate inputs with the current task details
   editTaskTitleInput.value = task.title;
   editTaskDescInput.value = task.description;
   editTaskStatusSelect.value = task.dueDate;

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

//function retrieves the user inputs, creates an updated task object, and uses 
//the patchTask or putTask function to update the task.
function saveTaskChanges(taskId) {

  // Get new user inputs
  const taskTitleInput = document.querySelector("#editTaskTitle");
  const taskDescriptionInput = document.querySelector("#editTaskDescription");
  const taskDueDateInput = document.querySelector("#editTaskDueDate");


  // Create an object with the updated task details
  const updatedTask = {
    title: elements.taskTitleInput.value.trim(),
    description: elements.taskDescriptionInput.value.trim(),
    dueDate: elements.taskDueDateInput.value.trim(),
    board: activeBoard, //assign updated task to current active board
    id: taskId // Ensure the ID is also included 
};

  // Update task using a helper function
  putTask(taskId, updatedTask); // Or patchTask if you're making partial updates


  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal); // Hide the edit task modal
  refreshTasksUI();// Refresh UI to reflect the updated task

}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);

  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}