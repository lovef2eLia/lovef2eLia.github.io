const BASE_URL = 'https://webdev.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/movies';
const POSTER_URL = BASE_URL + '/posters';
const MOVIES_PER_PAGE = 12;
const DEFAULT_PAGE = 1;

let filterMovies = [];
const movies = [];
const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const paginator = document.querySelector('#paginator');
const viewMode = document.querySelector('#viewMode');

function renderMovieList(data) {
  let rawHTML = '';

  data.forEach((item) => {
    if (dataPanel.classList.contains('listViewMode')) {
      console.log('list view mode');
      rawHTML += `
      <div class="row-sm-3">
        <div class="mb-2">
          <div class="list d-flex justify-content-between">
            <div class="list-body col-4">
              <h5 class="list-title">${item.title}</h5>
            </div>
            <div class="list-footer col-5">
              <button
                class="btn btn-primary btn-show-movie"
                data-bs-toggle="modal"
                data-bs-target="#movie-modal"
                data-id="${item.id}"
              >
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`;
      dataPanel.innerHTML = rawHTML;
      return;
    }

    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL}/${item.image}" class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button
                class="btn btn-primary btn-show-movie"
                data-bs-toggle="modal"
                data-bs-target="#movie-modal"
                data-id="${item.id}"
              >
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  dataPanel.innerHTML = rawHTML;
  console.log('success to repaint HTML');
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title');
  const modalImage = document.querySelector('#movie-modal-image');
  const modalDate = document.querySelector('#movie-modal-date');
  const modalDescription = document.querySelector('#movie-modal-description');

  axios
    .get(`${INDEX_URL}/${id}`)
    .then((response) => {
      const data = response.data.results;

      modalTitle.innerText = data.title;
      modalDate.innerText = `Release date: ${data.release_date}`;
      modalDescription.innerText = data.description;
      modalImage.innerHTML = `<img src="${POSTER_URL}/${data.image}" alt="movie-poster" class="img-fluid">`;
    })
    .catch((error) => console.log(error));
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMoviesList')) || [];
  let movie = movies.find((movie) => movie.id === id);
  list.some((movie) => movie.id === id)
    ? (function () {
        alert(`${movie.title}電影已經在收藏清單中`);
      })()
    : list.push(movie);

  localStorage.setItem('favoriteMoviesList', JSON.stringify(list));
}

function getMoviesByPage(page, data) {
  let movie = data.slice(MOVIES_PER_PAGE * (page - 1), MOVIES_PER_PAGE * page);

  return movie;
}

function renderPagination(amount) {
  let raw = '';
  let pagination = Math.ceil(amount / MOVIES_PER_PAGE);

  for (let page = 1; page <= pagination; page++) {
    raw += `<li class="page-item">
    <a class="page-link" href="#" data-page="${page}">
      ${page}
    </a>
  </li>`;
  }
  paginator.innerHTML = raw;
}

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault();

  let keyword = searchInput.value.trim().toLowerCase();

  filterMovies = movies.filter((movie) => {
    return movie.title.toLowerCase().includes(keyword);
  });

  if (filterMovies.length === 0) {
    return alert('cannot find movies with keyword: ' + keyword);
  }

  renderPagination(filterMovies.length);

  keyword.length === 0
    ? (function () {
        renderMovieList(movies);
        let alertId = setTimeout(() => {
          alert('input valid string length at least more than one letter');
          console.log('success to set Timeout');
        }, 200);
      })()
    : renderMovieList(getMoviesByPage(DEFAULT_PAGE, filterMovies));
});

dataPanel.addEventListener('click', function onPanelClicked(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(Number(e.target.dataset.id));
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(e.target.dataset.id));
  }
});

paginator.addEventListener('click', function onPaginationClicked(e) {
  let movie = filterMovies.length ? filterMovies : movies;

  if (e.target.matches('a[data-Page]')) {
    let page = Number(e.target.dataset.page);
    renderMovieList(getMoviesByPage(page, movie));
  }
});

viewMode.addEventListener('click', function onViewModeClicked(e) {
  if (e.target.classList.contains('listMode')) {
    console.log('list mode');
    dataPanel.classList.add('listViewMode');
    dataPanel.classList.remove('cardViewMode');
    renderMovieList(getMoviesByPage(DEFAULT_PAGE, movies));
  } else if (e.target.classList.contains('cardMode')) {
    dataPanel.classList.add('cardViewMode');
    dataPanel.classList.remove('listViewMode');
    renderMovieList(getMoviesByPage(DEFAULT_PAGE, movies));
  }
});

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results);
  renderMovieList(getMoviesByPage(DEFAULT_PAGE, movies));
  renderPagination(movies.length);
});
