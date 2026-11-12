
//let draggedCard = null;
let rightClickedCard= null;

document.addEventListener("DOMContentLoaded",loadTasksFromLocalStroage);

function addTask(columnId) {

    const input = document.getElementById(`${columnId}-input`);
    const taskText = input.value.trim();

    if (taskText === "") {
        return;
    }

   

    const taskElement = createTaskElement(taskText);

    document.getElementById(`${columnId}-task`).appendChild(taskElement);
    updateTasksCount(columnId);
    saveTasksToLocalStrorage(columnId,taskText,taskDate);

    input.value = "";
}

function createTaskElement(taskText) {

    const taskElement = document.createElement("div");
    const taskDate = new Date().toLocaleString();


   taskElement.innerHTML = `
    <span>${taskText}</span>
    <br>
    <small class="time">Created: ${taskDate}</small>
`;
    taskElement.classList.add("card");

    taskElement.draggable = true;

    taskElement.addEventListener("dragstart", dragStart);
    taskElement.addEventListener("dragend", dragEnd);
    taskElement.addEventListener("contextmenu",function(event){
        event.preventDefault();
        rightClickedCard = this
        showContextMenu(event.pageX,event.pageY);
    });
    return taskElement;
}

function dragStart() {
    this.classList.add("dragging");
    draggedCard = this;
}

function dragEnd() {
    this.classList.remove("dragging");
  //  draggedCard = null;
    ["todo","doing","done"].forEach((columnId)=>{
         updateTasksCount(columnId);
         updateLocalStorage();
    })
}

const columns = document.querySelectorAll(".column .tasks");

columns.forEach((column) => {
    column.addEventListener("dragover", dragOver);
});

function dragOver(event) {
    event.preventDefault();

    const draggedCard = document.querySelector(".dragging");

    if (draggedCard) {
        this.appendChild(draggedCard);
        const afterElemnent = getDragAfterElement(this ,event.pageY);
        if(afterElemnent === null){
            this.appendChild(draggedCard);
        }
        else{
            this.insertBefore(draggedCard,afterElemnent);
        }
    }
}
function getDragAfterElement(container, y) {

    const draggableElements = [
        ...container.querySelectorAll(".card:not(.dragging)")
    ];

    const result = draggableElements.reduce((closest, currentTask) => {

        const box = currentTask.getBoundingClientRect();

        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {

            return {
                offset: offset,
                element: currentTask
            };

        } else {
            return closest;
        }

    }, {
        offset: Number.NEGATIVE_INFINITY,
        element: null
    });

    return result.element;
}

const contextmenu = document.querySelector(".context-menu");

function showContextMenu(x, y) {

    contextmenu.style.left = `${x}px`;
    contextmenu.style.top = `${y}px`;
    contextmenu.style.display = "block";

}
document.addEventListener("click",() =>{
    contextmenu.style.display ="none";
});




function editTask() {
    if (rightClickedCard !== null) {

        const newTaskText = prompt(
            "Edit task - ",
            rightClickedCard.textContent
        );

        if (newTaskText !== null && newTaskText.trim() !== "") {
            rightClickedCard.textContent = newTaskText.trim();
        }
    }
}

function deleteTask() {
    if (rightClickedCard !== null) {
        const column = rightClickedCard.parentElement;
        rightClickedCard.remove();

        updateTasksCount(column.id.replace("-task", ""));
        rightClickedCard = null;
    }
}

function updateTasksCount(columnId) {
    const count = document.querySelectorAll(`#${columnId}-task .card`).length;

    document.getElementById(`${columnId}-count`).textContent = count;
}

function saveTasksToLocalStrorage(columnId,taskText,taskDate){
    const tasks= JSON.parse(localStorage.getItem(columnId)) || [];
    tasks.push({text: taskText,date:taskDate});
    localStorage.setItem(columnId,JSON.stringify(tasks));

}
function loadTasksFromLocalStroage(){
    ["todo","doing",done].forEach((columnId)=>{
        const tasks = JSON.parse(localStorage.getItem(columnId)) || [];
        tasks.forEach(({text,date})=>{
            const tasksElement = createTaskElement(text,date);
            document.getElementById(`${columnId}-task`).appendChild(tasksElement);
        });
        updateTasksCount(columnId);
    });
}
function updateLocalStorage(){
    ["todo","doing","done"].forEach((columnId)=>{
        const tasks =[];
        document.querySelectorAll(`#{columnId}-tasks .card`).forEach((card)=>{
            const taskText = card.querySelector("span").textContent;
            const taskDate = card.querySelector("small").textContent;
              tasks.push({text:taskText,date:taskDate});
        });
       localStorage.setItem(columnId,JSON.stringify(tasks));
    });
}



