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

  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [dataExtend, setDataExtend] = useState(20);

  const myRef = useRef();

  const allPokemonURL =
    "https://pokeapi.co/api/v2/pokemon?&limit=100000&offset=0";

  let alreadyBottom = false; //edgy debounce

  const initData = async () => {
    const response = await axios.get(allPokemonURL);

    setRawPokemonData(response.data.results);
    setPokemonDataFromRaw(20, true, response.data.results);

    const response2 = await axios.get("https://pokeapi.co/api/v2/type");
    setPokemonTypesData(response2.data.results);

    setLoading(false);
    const loadingContainer = document.querySelector(".loading-container");
    loadingContainer.classList.add("fade-out");
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
    // for (let count = 0; count < raw.length; count++) {
    //   const result = await axios.get(
    //     raw[count].url == null ? raw[count].pokemon.url : raw[count].url // if null, its getting pokemon list from api/Type
    //   );
    //   tempArray.push(result.data);
    //   if (count > maxCount - 1) break;
    // }
    // tempArray.sort((a, b) => (a.id > b.id ? 1 : -1));
    // setPokemonData(tempArray);
    // setDataLoading(false);

    // Fetch the data for all Pokemon concurrently using Promise.all()
    const fetchPromises = raw.slice(0, maxCount).map((pokemon) => {
      const url = pokemon.url == null ? pokemon.pokemon.url : pokemon.url;
      return axios.get(url);
    });

    try {
      const results = await Promise.all(fetchPromises);
      const tempArray = results.map((response) => response.data);
      tempArray.sort((a, b) => (a.id > b.id ? 1 : -1));
      setPokemonData(tempArray);
    } catch (error) {
      console.error("Error fetching Pokemon data:", error);
    }

    setDataLoading(false);
  };

  const continuePokemonData = async (maxCount) => {
    setDataLoading(true);
    const tempArray = [...pokemonData];
    // const raw = rawPokemonData;

    // console.log("Iterating.");
    // for (let count = tempArray.length; count < maxCount; count++) {
    //   if (count > raw.length - 1) {
    //     console.log("Finished list.");
    //     break;
    //   }
    //   const result = await axios.get(
    //     raw[count].url == null ? raw[count].pokemon.url : raw[count].url // if null, its getting pokemon list from api/Type
    //   );
    //   tempArray.push(result.data);
    // }
    // console.log("Finished iterating.");
    // setPokemonData(tempArray);
    // setDataLoading(false);

    const raw = rawPokemonData.slice(
      tempArray.length,
      tempArray.length + maxCount
    );

    // Fetch the data for the next batch of Pokemon concurrently using Promise.all()
    const fetchPromises = raw.map((pokemon) => {
      const url = pokemon.url == null ? pokemon.pokemon.url : pokemon.url;
      return axios.get(url);
    });

    try {
      const results = await Promise.all(fetchPromises);
      const newData = results.map((response) => response.data);
      setPokemonData([...tempArray, ...newData]);
    } catch (error) {
      console.error("Error fetching Pokemon data:", error);
    }

    setDataLoading(false);
  };

  const onTypeButtonClick = async (p) => {
    const urlFetch = p == "all" ? allPokemonURL : p.url;
    // console.log("type clicked:", p.name);
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
    // console.log(favorites);
    setPokemonDataFromRaw(40, true, favorites);
  };

  useEffect(() => {
    // console.log("Rendering...", pokemonData, rawPokemonData);
    // console.log("Render");
    setTimeout(() => {
      setLoading(false);
    }, 5000);

    const fetchData = async () => {
      if (!loading) {
        console.log("Fetching data.");
        continuePokemonData(dataExtend);
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

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Effect to add event listener for screen resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <LoadingPage />
      {
        <div className={`main ${!loading ? "no-scroll" : ""} `}>
          <div className="main-title">
            <div className="main-title-text">POKÉDEX</div>

            <button className="button-favorite" onClick={handleFavoritesClick}>
              <img
                className="button-favorite-img"
                src="https://www.svgrepo.com/show/114534/favorite.svg"
              ></img>
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
                  {screenWidth > 600 ? p.name : ""}
                </button>
              );
            })}
          </div>

          <div className="container" ref={myRef}>
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
