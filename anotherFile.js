class FilmListApp {
  constructor() {
    this.moviesListToWatch = [];
    this.moviesListToWatched = [];
    this.targetForDD = null;
    this.movieName = "";

    this.inputEl = document.querySelector("#movieInput");
    this.moviesListToWatchEl = document.querySelector("#pendingList");
    this.moviesListToWatchedEl = document.querySelector("#watchedList");
    this.buttonAddMovie = document.querySelector("#addButton");
    this.btnDeleteMovie = document.querySelector(".delete-btn");
  }

  init = () => {
    this.inputEl.addEventListener("input", this.onInputMovie);
    this.buttonAddMovie.addEventListener("click", this.onAddMovie);
    this.moviesListToWatchEl.addEventListener("click", this.onhandleclick);
    this.moviesListToWatchedEl.addEventListener("click", this.onhandleclick);

    this.moviesListToWatchEl.addEventListener("drop", this.drop);
    this.moviesListToWatchedEl.addEventListener("drop", this.drop);
    this.moviesListToWatchEl.addEventListener("dragover", (e) =>
      e.preventDefault()
    );
    this.moviesListToWatchedEl.addEventListener("dragover", (e) =>
      e.preventDefault()
    );

    this.addDragAndDrop();
    this.loadFromLocalStorage();
    this.renderAll();
  };

  renderAll = () => {
    this.renderList(this.moviesListToWatched, this.moviesListToWatchedEl, true),
      this.renderList(this.moviesListToWatch, this.moviesListToWatchEl, false);

    this.renderOfAllCounters();
    this.addDragAndDrop();
    this.saveToLocalStorage();
  };

  renderOfAllCounters = () => {
    document.querySelector("#totalCount").textContent =
      this.moviesListToWatch.length + this.moviesListToWatched.length;
    document.querySelector("#pendingCount").textContent =
      this.moviesListToWatch.length;
    document.querySelector("#watchedCount").textContent =
      this.moviesListToWatched.length;
    document.querySelector("#pendingCounter").textContent =
      this.moviesListToWatch.length;
    document.querySelector("#watchedCounter").textContent =
      this.moviesListToWatched.length;
  };

  renderList = (movies, container, isWatched) => {
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
  };

  onInputMovie = (event) => {
    this.movieName = event.currentTarget.value;
  };

  isDuplicateMovie = (movieName) => {
    const moviesLists = [
      ...this.moviesListToWatch,
      ...this.moviesListToWatched,
    ];
    return moviesLists.some(
      (movie) => movie.name.toUpperCase() === this.movieName.toUpperCase()
    );
  };

  onAddMovie = () => {
    if (this.movieName !== "") {
      if (this.isDuplicateMovie(this.movieName)) {
        this.inputEl.value = "";
        return;
      }

      const movie = {
        name: this.movieName,
        id: Date.now().toString(15) + Math.random().toString(15),
        watched: false,
      };

      this.moviesListToWatch.push(movie);
      this.inputEl.value = "";
      this.movieName = "";
      this.renderAll();
    }
  };

  onhandleclick = (event) => {
    const btn = event.target;

    const movieItem = btn.closest(".movie-item");
    const movieId = movieItem.dataset.id;
    const action = btn.dataset.action;

    if (action === "delete") {
      this.deleteMovie(movieId);
    } else if (action === "watch") {
      this.replaceMovieToWatched(movieId);
    } else if (action === "unwatch") {
      this.replaceBackMovieToWatch(movieId);
    }
  };

  deleteMovie = (movieId) => {
    this.moviesListToWatch = this.moviesListToWatch.filter(
      (movie) => movie.id !== movieId
    );
    this.moviesListToWatched = this.moviesListToWatched.filter(
      (movie) => movie.id !== movieId
    );
    this.renderAll();
  };

  replaceMovieToWatched = (movieId) => {
    const index = this.moviesListToWatch.findIndex(
      (movie) => movie.id === movieId
    );

    if (index !== -1) {
      const movie = this.moviesListToWatch.splice(index, 1)[0];
      movie.watched = true;
      this.moviesListToWatched.push(movie);
      this.renderAll();
    }
  };

  replaceBackMovieToWatch = (movieId) => {
    const index = this.moviesListToWatched.findIndex(
      (movie) => movie.id === movieId
    );

    if (index !== -1) {
      const movie = this.moviesListToWatched.splice(index, 1)[0];
      movie.watched = false;
      this.moviesListToWatch.push(movie);
      this.renderAll();
    }
  };

  saveToLocalStorage = () => {
    const data = {
      watch: this.moviesListToWatch,
      watched: this.moviesListToWatched,
    };

    localStorage.setItem("movies", JSON.stringify(data));
  };

  loadFromLocalStorage = () => {
    const data = localStorage.getItem("movies");

    if (!data) return;

    const parsed = JSON.parse(data);

    this.moviesListToWatch = parsed.watch;
    this.moviesListToWatched = parsed.watched;
  };

  addDragAndDrop = () => {
    const targets = document.querySelectorAll(".movie-item");

    for (const target of targets) {
      target.addEventListener("dragstart", (e) => {
        this.targetForDD = target; 
        target.classList.add("dragging");
      });

      target.addEventListener("dragend", (e) => {
        target.classList.remove("dragging");
        this.targetForDD = null;
      });
    }
  };

  drop = (event) => {
    event.preventDefault();
    if (this.targetForDD) {
      const movieId = this.targetForDD.dataset.id;
       const targetListId = event.currentTarget.id;
      if (targetListId === "pendingList") {
        this.moveMovieTo(
          movieId,
          this.moviesListToWatch,
          this.moviesListToWatched
        );
      } else if (targetListId === "watchedList") {
        this.moveMovieTo(
          movieId,
          this.moviesListToWatched,
          this.moviesListToWatch
        );
      }
    }
    this.renderAll();
  };

  moveMovieTo = (movieId, targetArray, sourceArray) => {
    const index = sourceArray.findIndex((movie) => movie.id === movieId);

    const movie = sourceArray.splice(index, 1)[0];
    movie.watched = targetArray === this.moviesListToWatched;
    targetArray.push(movie);
  };
}

const App =  new FilmListApp();
App.init()


//class MyClass {
//  constructor() {
//    // 1. данные
//    // 2. состояние
//    // 3. зависимости
//  }
//
//  // 4. публичные методы
//  start() {}
//
//  // 5. логика
//  process() {}
//
//  // 6. вспомогательные
//  helper() {}
//}