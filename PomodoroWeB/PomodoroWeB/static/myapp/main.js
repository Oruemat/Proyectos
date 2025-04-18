const timer = {
    interval: null,
    timeRemaining: 0,
    roundsCompleted: 0,
    currentTaskIndex: null,
    currentBreak: null,
    tasks: []
};

document.getElementById('addtask-btn').addEventListener('click', addTask);

function addTask() {
    const taskName = document.getElementById('taskName').value;
    const taskTime = parseInt(document.getElementById('taskTime').value) * 60;
    const shortBreak = parseInt(document.getElementById('shortBreak').value) * 60;
    const longBreak = parseInt(document.getElementById('longBreak').value) * 60;
    const rounds = parseInt(document.getElementById('rounds').value);

    if (!taskName || !taskTime || !shortBreak || !longBreak || !rounds) {
        alert('Por favor, complete todos los campos para agregar una tarea.');
        return;
    }

    const task = {
        name: taskName,
        taskTime: taskTime,
        shortBreak: shortBreak,
        longBreak: longBreak,
        rounds: rounds,
        completed: false
    };

    timer.tasks.push(task);
    updateTaskList();

    // Limpiar los campos de entrada
    document.getElementById('taskName').value = '';
    document.getElementById('taskTime').value = '';
    document.getElementById('shortBreak').value = '';
    document.getElementById('longBreak').value = '';
    document.getElementById('rounds').value = '';
}

function updateTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    timer.tasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.className = 'list-group-item';

        taskItem.innerHTML = `
            <strong>${task.name}</strong> - ${task.completed ? 'Completada' : 'Pendiente'}
            <br>
            Tiempo: ${task.taskTime / 60} min | Pausa corta: ${task.shortBreak / 60} min | Pausa larga: ${task.longBreak / 60} min | Rondas: ${task.rounds}
        `;

        const startButton = document.createElement('button');
        startButton.textContent = 'Iniciar';
        startButton.className = 'btn btn-success btn-sm float-end ms-2';
        startButton.onclick = () => selectTask(index);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.className = 'btn btn-danger btn-sm float-end';
        deleteButton.onclick = () => deleteTask(index);

        taskItem.appendChild(startButton);
        taskItem.appendChild(deleteButton);

        taskList.appendChild(taskItem);
    });
}

function selectTask(index) {
    if (timer.currentTaskIndex !== null) {
        alert('Debes finalizar o reiniciar la tarea actual antes de iniciar otra.');
        return;
    }

    timer.currentTaskIndex = index;
    startTask();
}

function deleteTask(index) {
    if (timer.currentTaskIndex === index) {
        alert('No puedes eliminar una tarea en ejecución.');
        return;
    }

    timer.tasks.splice(index, 1);
    updateTaskList();
}

function startTask() {
    const task = timer.tasks[timer.currentTaskIndex];
    timer.timeRemaining = task.taskTime;
    timer.roundsCompleted = 0;
    timer.currentBreak = null;

    document.getElementById('startButton').disabled = true;

    runTimer();
}

function runTimer() {
    timer.interval = setInterval(() => {
        if (timer.timeRemaining > 0) {
            timer.timeRemaining--;
            updateTimerDisplay();
        } else {
            clearInterval(timer.interval);
            const task = timer.tasks[timer.currentTaskIndex];

            if (timer.currentBreak === null) {
                timer.roundsCompleted++;

                if (timer.roundsCompleted < task.rounds) {
                    alert(`Round ${timer.roundsCompleted} completado! Pausa corta.`);
                    timer.currentBreak = 'short';
                    timer.timeRemaining = task.shortBreak;
                    runTimer();
                } else {
                    alert('¡Tarea completada! Pausa larga.');
                    timer.currentBreak = 'long';
                    timer.timeRemaining = task.longBreak;
                    runTimer();
                }
            } else if (timer.currentBreak === 'short') {
                alert('Pausa corta completada! Iniciando nueva ronda.');
                timer.currentBreak = null;
                timer.timeRemaining = task.taskTime;
                runTimer();
            } else if (timer.currentBreak === 'long') {
                alert('Pausa larga completada! Tarea finalizada.');
                finishTask();
            }
        }
    }, 1000); // Actualizar cada segundo
}

function updateTimerDisplay() {
    const minutes = Math.floor(timer.timeRemaining / 60);
    const seconds = timer.timeRemaining % 60;

    let statusText = 'Tarea en ejecución';
    if (timer.currentBreak === 'short') {
        statusText = 'Pausa corta';
    } else if (timer.currentBreak === 'long') {
        statusText = 'Pausa larga';
    }

    document.getElementById("timer").textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    document.getElementById("task-title").textContent = `${timer.tasks[timer.currentTaskIndex].name} - ${statusText}`;
}

function pauseTimer() {
    clearInterval(timer.interval);
    document.getElementById('startButton').disabled = false;
}

function resetTimer() {
    clearInterval(timer.interval);
    timer.timeRemaining = timer.tasks[timer.currentTaskIndex].taskTime;
    updateTimerDisplay();
}

function finishTask() {
    if (timer.currentTaskIndex === null) {
        alert('No hay tarea en ejecución para finalizar.');
        return;
    }

    timer.tasks[timer.currentTaskIndex].completed = true;
    updateTaskList();

    clearInterval(timer.interval);
    timer.currentTaskIndex = null;
    timer.timeRemaining = 0;
    timer.roundsCompleted = 0;
    timer.currentBreak = null;

    document.getElementById("timer").textContent = "00:00";
    document.getElementById("task-title").textContent = "No hay tarea en ejecución";

    updateProgressBar();
    alert('La tarea ha sido finalizada.');
}

function updateProgressBar() {
    const completedTasks = timer.tasks.filter(task => task.completed).length;
    const totalTasks = timer.tasks.length;

    let progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const progressBar = document.getElementById('progressBar');
    progressBar.value = progress;

    const kpiValue = document.getElementById('kpi-value');
    kpiValue.textContent = `${Math.round(progress)}%`;
}
