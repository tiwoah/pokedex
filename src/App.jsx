import { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import PokemonList from "./components/PokemonList";
import { getTypeIcon } from "./utils/getTypeIcon.js";
import { getFavorites } from "./utils/favorites";
import LoadingPage from "./components/LoadingPage";

function App() {
  const [pokemonTypesData, setPokemonTypesData] = useState([]); // type --> normal, fighting, etc...
  const [rawPokemonData, setRawPokemonData] = useState([]); // {{id, name}, {id, name}}
  const [pokemonData, setPokemonData] = useState([]); // {{id, name}, {id, name}}

  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [dataExtend, setDataExtend] = useState(20);

  const myRef = useRef();

  const allPokemonURL =
    "https://pokeapi.co/api/v2/pokemon?&limit=100000&offset=0";

  let alreadyBottom = false; //edgy debounce

  const initData = async () => {
    if (!initialized) {
      setLoading(false);

      const response = await axios.get(allPokemonURL);

      setRawPokemonData(response.data.results);
      setPokemonDataFromRaw(20, true, response.data.results);

      const response2 = await axios.get("https://pokeapi.co/api/v2/type");
      setPokemonTypesData(response2.data.results);

      setLoading(false);
      const loadingContainer = document.querySelector(".loading-container");
      loadingContainer.classList.add("fade-out");
      setInitialized(true);
    }
  };

  const setPokemonDataFromRaw = async (
    maxCount,
    newRaw,
    raw = rawPokemonData
  ) => {
    setDataLoading(true);
    if (newRaw) {
      setRawPokemonData(raw);
    }
    const tempArray = [];
    setPokemonData([]); // without this, its too efficient. (prevents re-rendering cards causing some to not fade in)
    for (let count = 0; count < raw.length; count++) {
      const result = await axios.get(
        raw[count].url == null ? raw[count].pokemon.url : raw[count].url // if null, its getting pokemon list from api/Type
      );
      tempArray.push(result.data);
      if (count > maxCount - 1) break;
    }
    tempArray.sort((a, b) => (a.id > b.id ? 1 : -1));
    setPokemonData(tempArray);
    setDataLoading(false);
  };

  const continuePokemonData = async (maxCount) => {
    setDataLoading(true);
    const tempArray = [...pokemonData];
    const raw = rawPokemonData;
    console.log(tempArray.length);

    for (let count = tempArray.length; count < maxCount; count++) {
      if (count > raw.length - 1) {
        console.log("reached end");
        break;
      }
      const result = await axios.get(
        raw[count].url == null ? raw[count].pokemon.url : raw[count].url // if null, its getting pokemon list from api/Type
      );
      tempArray.push(result.data);
    }
    setPokemonData(tempArray);
    setDataLoading(false);
  };

  const onTypeButtonClick = async (p) => {
    const urlFetch = p == "all" ? allPokemonURL : p.url;
    console.log("type clicked:", p.name);
    const response = await axios.get(urlFetch);

    setPokemonDataFromRaw(
      40,
      true,
      response.data.pokemon == null
        ? response.data.results
        : response.data.pokemon
    );
  };

  const handleFavoritesClick = async () => {
    const favorites = getFavorites();
    console.log(favorites);
    setPokemonDataFromRaw(40, true, favorites);
  };

  useEffect(() => {
    // console.log("Rendering...", pokemonData, rawPokemonData);
    console.log("Render");
    setTimeout(() => {
      setLoading(false);
    }, 5000);

    const fetchData = async () => {
      if (!loading) {
        continuePokemonData(pokemonData.length + dataExtend);
        console.log("FETCH?");
      }
    };

    const handleScroll = () => {
      if (myRef.current) {
        const { bottom } = myRef.current.getBoundingClientRect();
        const threshold = 0.8;
        const isAtBottom = bottom * 0.8 <= window.innerHeight;

        if (isAtBottom) {
          if (!alreadyBottom) {
            fetchData();
            alreadyBottom = true;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [rawPokemonData, pokemonData]);

  useEffect(() => {
    initData();
  }, []);

  return (
    <>
      <LoadingPage />
      {
        <div className={`main ${!loading ? "no-scroll" : ""} `}>
          <div className="main-title">
            <div className="main-title-text">POKÉDEX</div>

            <button className="button-favorite" onClick={handleFavoritesClick}>
              favorites
            </button>
          </div>

          <div className="button-container">
            <button
              key={"all"}
              id={"all"}
              onClick={() => onTypeButtonClick("all")}
              className={"button card-all "}
            >
              <div className="button-img">◼</div>
              <div className="">ALL</div>
            </button>
            {pokemonTypesData.map((p) => {
              if ((p.name == "unknown") | (p.name == "shadow")) return;
              const typeImg = getTypeIcon(p.name);

              return (
                <button
                  key={p.name}
                  id={p.name}
                  onClick={() => onTypeButtonClick(p)}
                  className={"button card-" + p.name}
                >
                  <img className="button-img" src={typeImg}></img>
                  {p.name}
                </button>
              );
            })}
          </div>

          <div className="container" ref={myRef}>
            {/* {isListLoading && (
              <div className="page-loader">
                <img
                  className="page-spinner"
                  src="https://img.icons8.com/?size=512&id=FSKmFQT9ret9&format=png"
                ></img>
              </div>
            )} */}
            <PokemonList
              pokemonData={pokemonData}
              dataLoading={dataLoading}
            ></PokemonList>
          </div>

          {/* <div className="scroll-arrow-container">
            <img
              className="scroll-arrow"
              src="https://cdn-icons-png.flaticon.com/512/608/608336.png"
            ></img>
          </div> */}
        </div>
      }
    </>
  );
}

export default App;
