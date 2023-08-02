let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const api = "https://pokeapi.co/api/v2/pokemon/";

export const toggleFavorited = (id) => {
  console.log("toggling.. :", id);
  const adding = { id: id, url: api + id };

  const isExisting = favorites.some((element) => element.id === adding.id);
  if (isExisting) {
    const updatedFavorites = favorites.filter(
      (element) => element.id !== adding.id
    );
    favorites = updatedFavorites;
  } else {
    favorites.push(adding);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
};

export const isFavorite = (id) => {
  return favorites.some((element) => element.id === id);
};

export const getFavorites = () => {
  return favorites;
};
