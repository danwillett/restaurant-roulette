// Linked to homepage

// DOM elements related to restaurant search
const searchBtnEl = document.getElementById("searchBtn");
const searchFieldEl = document.getElementById("cuisine");
const categoryListEl = document.getElementById("show-list");
const cuisineEl = document.getElementById("filters");
const locationBtn = document.getElementById("location-dropdown");
const locationSubmitBtn = document.getElementById("location-submit");

// Delete cuisine filters
const deleteBtn = (event) => {
  event.preventDefault();
  event.stopPropagation();

  event.target.remove();
};

// retrieves filter ids from user-selected filters
const getFilters = (event) => {
  let currentCuisines = [...cuisineEl.children];
  let filterIds = currentCuisines.map((obj) => obj.id);
  return filterIds;
};

// adds new filters as users type in categories they would like to add
const addFilters = async () => {
  const categoriesObj = await fetch("/api/yelp/categories");
  const categories = await categoriesObj.json();
  console.log(categories);

  // as user adds new keys to search field, add updated suggested list of categories
  searchFieldEl.addEventListener("keyup", async (event) => {
    event.preventDefault();
    var searchText = event.target.value;
    if (!searchText == "") {
      let regexp = new RegExp(searchText, "i");
      let matchList = categories.filter((x) => regexp.test(x.title));
      console.log("filling in");
      console.log(matchList);
      let categoryTitles = matchList.map((cat) => cat.title);

      // if existing list items no longer match, delete them
      let listItems = categoryListEl.children;
      console.log(listItems);
      for (let i = 0; i < listItems.length; i++) {
        let listId = listItems[i].id;
        console.log(listId);
        if (!categoryTitles.includes(listId)) {
          listItems[i].remove();
        }
      }

      // Show lists once text is longer than 3
      if (searchText.length >= 3) {
        matchList.forEach((cat) => {
          // if there's already a list item with this cat, don't make a new one
          if (document.getElementById(cat.title) == null) {
            let catItem = document.createElement("button");
            catItem.setAttribute(
              "class",
              "list-group-item list-group-item-action border-1 btn btn-info"
            );
            catItem.setAttribute("id", cat.title);
            catItem.setAttribute("data-alias", cat.alias);
            catItem.textContent = cat.title;
            categoryListEl.appendChild(catItem);
          }
        });
      } else {
        categoryListEl.innerHTML = "";
      }
    }
    // create filters group element
    categoryListEl.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      console.log(event.target);
      let category = event.target.getAttribute("id");
      let alias = event.target.getAttribute("data-alias");
      console.log(alias);
      let filters = getFilters(event);

      console.log(filters);

      if (!filters.includes(category)) {
        let newFilter = document.createElement("li");
        newFilter.setAttribute("id", category);
        newFilter.setAttribute("class", "list-group-item filter");
        newFilter.setAttribute("data", alias);
        newFilter.textContent = category;
        cuisineEl.appendChild(newFilter);
      }

      categoryListEl.innerHTML = "";
      searchFieldEl.value = "";
    });
  });
};

addFilters();

// updates user location when submiting user location form
locationSubmitBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  let city = document.getElementById("dropdown-city").value;
  let state = document.getElementById("dropdown-state").value;

  if (!city == "" && !state == "") {
    locationBtn.removeAttribute("data-city");
    locationBtn.removeAttribute("data-state");
    locationBtn.setAttribute("data-city", city);
    locationBtn.setAttribute("data-state", state);

    locationBtn.textContent = city + ", " + state;
  } else {
    alert("Please include both city and state information.");
  }
});

// find restaurants matching filters categories
searchBtnEl.addEventListener("click", async (event) => {
  event.preventDefault();
  event.stopPropagation();

  // cuisine filters
  let currentCuisines = cuisineEl.children;
  let aliases;
  for (let i = 0; i < currentCuisines.length; i++) {
    console.log(currentCuisines[i]);
    if (i == 0) {
      aliases = currentCuisines[i].getAttribute("data");
    } else {
      aliases = aliases.concat("_", currentCuisines[i].getAttribute("data"));
    }
  }

  // location filter
  let city = locationBtn.getAttribute("data-city");
  let state = locationBtn.getAttribute("data-state");
  let searchTerm = searchFieldEl.value;

  // need a city, state, and term query parameter
  const result = await fetch(
    `/api/yelp/search?categories=${aliases}&city=${city}&state=${state}&term=${searchTerm}`
  );
  let resultObj = await result.json();
  console.log(resultObj);
  generateModal(resultObj);
});

// Deletes filters on click
cuisineEl.addEventListener("click", deleteBtn);

// Summarizes key restaurant information in a modal

const titleEl = document.getElementById("restaurant-name");
const addressEl = document.getElementById("address");
const phoneEl = document.getElementById("phone");
const imageEl = document.getElementById("restaurant-img");
const priceEl = document.getElementById("price");
const ratingEl = document.getElementById("rating");
const typeEl = document.getElementById("type");
const webBtn = document.getElementById("website");

// function adds restaurant details to modal and toggle display
const generateModal = (restaurantObj) => {
  titleEl.textContent = restaurantObj.name;
  addressEl.textContent =
    "Address: " +
    restaurantObj.location.address1 +
    ", " +
    restaurantObj.location.city +
    ", " +
    restaurantObj.location.state;
  phoneEl.textContent = "Phone: " + restaurantObj.display_phone;
  priceEl.textContent = "Price: " + restaurantObj.price;
  ratingEl.textContent = "Rating: " + restaurantObj.rating;

  imageEl.style.backgroundImage = `url(${restaurantObj.photos[0]})`;
  imageEl.style.backgroundPosition = "center";
  imageEl.style.backgroundSize = "cover";
  imageEl.style.minHeight = "300px";

  let catDisplay;
  if (restaurantObj.categories.length > 1) {
    let cats = restaurantObj.categories.map((cat) => cat.title);
    catDisplay = cats.join(" | ");
  } else {
    catDisplay = restaurantObj.categories[0].title;
  }
  typeEl.textContent = catDisplay;

  webBtn.setAttribute("href", restaurantObj.url);

  // setAttribute('src', restaurantObj.photos[0])

  const myModal = new bootstrap.Modal(
    document.getElementById("restaurant-modal")
  );
  myModal.toggle();
};
