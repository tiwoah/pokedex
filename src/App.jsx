import { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import PokemonList from "./components/PokemonList";
import { getTypeIcon } from "./utils/getTypeIcon.js";
import { getFavorites } from "./utils/favorites";
import LoadingPage from "./components/LoadingPage";
import logo from "./assets/logo.png";
import InfoPanel from "./components/InfoPanel";

function App() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [scrollY, setScrollY] = useState(0);

  const [pokemonTypesData, setPokemonTypesData] = useState([]); // type --> normal, fighting, etc...
  const [rawPokemonData, setRawPokemonData] = useState([]); // {{id, name}, {id, name}}
  const [pokemonData, setPokemonData] = useState([]); // {{id, name}, {id, name}}

  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataExtend, setDataExtend] = useState(20);

  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  const [btnContainerOffScreen, setBtnContainerOffScreen] = useState(false);
  const [buttonContainerHeight, setButtonContainerHeight] = useState(0);

  const myRef = useRef();
  const refButtonContainer = useRef();

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
    setPokemonDataFromRaw(40, true, favorites);
  };

  const fetchData = async () => {
    if (!loading) {
      console.log("Fetching data.");
      continuePokemonData(dataExtend);
    }
  };

  let initialButtonContainerTop = 696969;
  let offset = -20;
  let btnContainerBottomPadding = 70;
  const handleScroll = (event) => {
    setScrollY(window.scrollY);

    if (loading || infoPanelOpen) {
      window.scrollTo(0, scrollY);
    }

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

    if (refButtonContainer.current) {
      let top = refButtonContainer.current.getBoundingClientRect().top;
      setButtonContainerHeight(refButtonContainer.current.offsetHeight);

      initialButtonContainerTop == 696969
        ? (initialButtonContainerTop = top + window.scrollY + offset)
        : initialButtonContainerTop;

      console.log(window.scrollY);

      if (window.scrollY > initialButtonContainerTop) {
        setBtnContainerOffScreen(true);
      } else {
        initialButtonContainerTop = top + window.scrollY + offset;
        setBtnContainerOffScreen(false);
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 5000);

    if (loading || infoPanelOpen) {
      window.addEventListener("scroll", handleScroll);
    } else {
      window.removeEventListener("scroll", handleScroll);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [rawPokemonData, pokemonData, infoPanelOpen]);

  useEffect(() => {
    initData();

    if (refButtonContainer.current) {
      setButtonContainerHeight(refButtonContainer.current.offsetHeight);
    }

    const handleResize = () => {
      setScreenWidth(window.innerWidth);

      if (refButtonContainer.current) {
        setButtonContainerHeight(refButtonContainer.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <LoadingPage />
      {
        <div
          className={`main ${loading | infoPanelOpen ? "no-scroll" : ""} ${
            infoPanelOpen ? "blurred-background" : ""
          }`}
        >
          <div className="main-title">
            {/* <div className="main-title-text">POKÉDEX</div> */}
            <img className="main-title-img no-pointer-events" src={logo}></img>

            <button className="button-favorite" onClick={handleFavoritesClick}>
              <img
                className="button-favorite-img"
                src="https://www.svgrepo.com/show/114534/favorite.svg"
              ></img>
            </button>
          </div>

          <div
            className={`button-container ${
              btnContainerOffScreen ? "sticky" : ""
            }`}
            ref={refButtonContainer}
          >
            <button
              key={"all"}
              id={"all"}
              onClick={() => onTypeButtonClick("all")}
              className={"button card-all "}
            >
              <img
                className="button-img"
                src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/581e2efc-8fab-47ca-9536-3770aab24ea4/d2joc5j-c2562d13-9dbe-4747-b70b-03e25d3abb80.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzU4MWUyZWZjLThmYWItNDdjYS05NTM2LTM3NzBhYWIyNGVhNFwvZDJqb2M1ai1jMjU2MmQxMy05ZGJlLTQ3NDctYjcwYi0wM2UyNWQzYWJiODAucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.7RCqdHsS0eXFQ4PjKi-Nusb3gfY259k3RIeHZv4rlKs"
              ></img>
              {screenWidth > 600 ? "ALL" : ""}
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

          <div
            className="container"
            ref={myRef}
            style={{
              paddingTop: btnContainerOffScreen
                ? `${
                    buttonContainerHeight + offset + btnContainerBottomPadding
                  }px`
                : "0",
            }}
          >
            <PokemonList
              pokemonData={pokemonData}
              dataLoading={dataLoading}
              setSelectedPokemon={setSelectedPokemon}
              setInfoPanelOpen={setInfoPanelOpen}
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
      {infoPanelOpen && selectedPokemon && (
        <InfoPanel
          data={selectedPokemon}
          onClose={() => setInfoPanelOpen(false)}
        />
      )}
    </>
  );
}

export default App;
