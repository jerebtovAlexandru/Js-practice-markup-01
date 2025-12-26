//____________________________________________________________________________________________________________________________________________________________________________

//Поставленная задача !!!!

//. Добавление фильма
//   · При вводе в поле и нажатии кнопки (или Enter) фильм добавляется в список «К просмотру».
//   · Поле очищается после добавления.
//2. Управление элементами
//   · Каждый фильм имеет две кнопки: «отметить просмотренным» (глаз) и «удалить» (крестик).
//   · При нажатии на глаз фильм перемещается в список «Просмотрено», меняет стиль (зачёркивание).
//   · При нажатии на крестик фильм удаляется из любого списка.
//3. Drag&Drop
//   · Реализовать перетаскивание фильмов между списками.
//   · Во время перетаскивания элемент должен визуально выделяться (opacity, transform).
//   · При бросании в другой список фильм должен перемещаться туда и менять статус.
//4. Статистика
//   · В верхней панели и в заголовках списков обновляются счётчики в реальном времени.
//   · Всего фильмов / К просмотру / Просмотрено.
//5. Сохранение данных
//   · Состояние списков сохраняется в localStorage, чтобы при перезагрузке страницы всё восстанавливалось.
//6. Детали
//   · Учти, что списки могут быть пустыми — показывай соответствующие сообщения.
//   · Обработай попытку добавить пустой фильм.
//   · Код должен быть модульным, без глобальных переменных в window.
//   · Используй современный JavaScript (ES6+).

//____________________________________________________________________________________________________________________________________________________________________________

//____________________________________________________________________________________________________________________________________________________________________________

// объявление массивов , элементов взаимодействия и задание на них слушателя событий

let moviesListToWatch = [];
let moviesListToWatched = [];
let targetForDD = null;
const inputEl = document.querySelector("#movieInput");
const moviesListToWatchEl = document.querySelector("#pendingList"); //!!!!!!!!!!!!!!!!!!!
const moviesListToWatchedEl = document.querySelector("#watchedList"); //!!!!!!!!!!!!!!!!!!!
const buttonAddMovie = document.querySelector("#addButton");
const btnDeleteMovie = document.querySelector(".delete-btn");

let movieName = "";

inputEl.addEventListener("input", onInputMovie);
buttonAddMovie.addEventListener("click", onAddMovie);
moviesListToWatchEl.addEventListener("click", onhandleclick);
moviesListToWatchedEl.addEventListener("click", onhandleclick);

//____________________________________________________________________________________________________________________________________________________________________________

//____________________________________________________________________________________________________________________________________________________________________________

moviesListToWatchEl.addEventListener("drop", drop);
moviesListToWatchedEl.addEventListener("drop", drop);
moviesListToWatchEl.addEventListener("dragover", (e) => e.preventDefault());
moviesListToWatchedEl.addEventListener("dragover", (e) => e.preventDefault());


function drop(event) {
    event.preventDefault();
  if (targetForDD) {
    const movieId = targetForDD.dataset.id
    
    if (this.id=== "pendingList") {
      moveMovieTo(movieId, moviesListToWatch, moviesListToWatched);
    }
     else if (this.id === "watchedList") {
       moveMovieTo(movieId, moviesListToWatched, moviesListToWatch);
     }
  }
  renderAll();
}

  function moveMovieTo(movieId, targetArray, sourceArray) {
    const index = sourceArray.findIndex((movie) => movie.id === movieId);

    const movie = sourceArray.splice(index, 1)[0];
    movie.watched = targetArray === moviesListToWatched;
    targetArray.push(movie);
  }

function addDragAndDrop() {
  const targets = document.querySelectorAll(".movie-item");

  for (const target of targets) {
    target.addEventListener("dragstart", dragStart);
    target.addEventListener("dragend", dragEnd);

    function dragStart() {
      targetForDD = this;
      this.classList.add("dragging");
      console.log(targetForDD);
    }
    function dragEnd() {
      this.classList.remove("dragging");
            targetForDD = null;
    }
  }
}

//____________________________________________________________________________________________________________________________________________________________________________

//____________________________________________________________________________________________________________________________________________________________________________

//   Данная функция renderAll - обнавляет списоки и состояние счётчиков


loadFromLocalStorage(); 
renderAll();
function renderAll() {
  renderList(moviesListToWatched, moviesListToWatchedEl, true),
  renderList(moviesListToWatch, moviesListToWatchEl, false);

  renderOfAllCounters();
  addDragAndDrop();
    saveToLocalStorage();

}

// Рендер всех счётчиков в одной  функции
function renderOfAllCounters() {
  document.querySelector("#totalCount").textContent =
    moviesListToWatch.length + moviesListToWatched.length;
  document.querySelector("#pendingCount").textContent =
    moviesListToWatch.length;
  document.querySelector("#watchedCount").textContent =
    moviesListToWatched.length;
  document.querySelector("#pendingCounter").textContent =
    moviesListToWatch.length;
  document.querySelector("#watchedCounter").textContent =
    moviesListToWatched.length;
}

// Рендер одного элемента списка , и container.innerHTML в документ
function renderList(movies, container, isWatched) {
  const markup = movies.map(
    (movie) =>
      `<li class ="movie-item " data-id="${movie.id}" draggable="true">
      <span class = 'movie-title ${isWatched ? "watched" : ""}' > ${
        movie.name
      } </span>
      <div class="movie-actions">
                 <button class="action-btn watch-btn" data-action ="${
                   isWatched ? "unwatch" : "watch"
                 }" >
                     ${isWatched ? "↩️" : "👁️"}
                 </button>
                 <button class="action-btn delete-btn" data-action ='delete'>
                     🗑️
                 </button>
             </div>
      </li>`
  );
  container.innerHTML = markup.join("");
  
}

//____________________________________________________________________________________________________________________________________________________________________________

function saveToLocalStorage() {
  const data = {
    watch: moviesListToWatch,
    watched: moviesListToWatched,
  };

  localStorage.setItem("movies", JSON.stringify(data));
}

function loadFromLocalStorage() {

  const data = localStorage.getItem("movies");

  if (!data) return;

  const parsed = JSON.parse(data);

  moviesListToWatch = parsed.watch;
  moviesListToWatched = parsed.watched;
}


//____________________________________________________________________________________________________________________________________________________________________________

// Данная функция Делегация списков  , ловит на какую кнопку внутри элемента было произведено действие и в последствии делает определённые дейсвия
function onhandleclick(event) {
  const btn = event.target;

  const movieItem = btn.closest(".movie-item");
  const movieId = movieItem.dataset.id;
  const action = btn.dataset.action;

  if (action === "delete") {
    deleteMovie(movieId);
  } else if (action === "watch") {
    replaceMovieToWatched(movieId);
  } else if (action === "unwatch") {
    replaceBackMovieToWatch(movieId);
  }
}

function deleteMovie(movieId) {
  moviesListToWatch = moviesListToWatch.filter((movie) => movie.id !== movieId);
  moviesListToWatched = moviesListToWatched.filter(
    (movie) => movie.id !== movieId
  );
  renderAll();
}

function replaceMovieToWatched(movieId) {
  const index = moviesListToWatch.findIndex((movie) => movie.id === movieId);

  if (index !== -1) {
    const movie = moviesListToWatch.splice(index, 1)[0];
    movie.watched = true;
    moviesListToWatched.push(movie);
    renderAll();
  }
}

function replaceBackMovieToWatch(movieId) {
  const index = moviesListToWatched.findIndex((movie) => movie.id === movieId);

  if (index !== -1) {
    const movie = moviesListToWatched.splice(index, 1)[0];
    movie.watched = false;
    moviesListToWatch.push(movie);
    renderAll();
  }
}

//____________________________________________________________________________________________________________________________________________________________________________

//____________________________________________________________________________________________________________________________________________________________________________

// делает запись в переменную с именем  фильма которое вводят в Input
function onInputMovie(event) {
  movieName = event.currentTarget.value;
}

// делает проверку имени которое может повторяться , при повторении введёного имени в Input , имя не доавляется в список для желаемого просмотра
function isDuplicateMovie(movieName) {
  const moviesLists = [...moviesListToWatch, ...moviesListToWatched];
  return moviesLists.some(
    (movie) => movie.name.toUpperCase() === movieName.toUpperCase()
  );
}

function onAddMovie() {
  if (movieName !== "") {
    if (isDuplicateMovie(movieName)) {
      inputEl.value = "";
      return;
    }

    const movie = {
      name: movieName,
      id: Date.now().toString(15) + Math.random().toString(15),
      watched: false,
    };

    moviesListToWatch.push(movie);
    inputEl.value = "";
    movieName = "";
    renderAll();
  }
}
//____________________________________________________________________________________________________________________________________________________________________________
