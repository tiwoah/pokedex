import React, { useEffect } from "react";
import { useState, useRef } from "react";
import axios from "axios";
import { toggleFavorited, isFavorite } from "../utils/favorites";

export default function PokemonCard({ data }) {
  const [backgroundImage, setBackgroundImage] = useState("");
  const [favToggled, setFavToggled] = useState(isFavorite(data.id));
  const [loaded, setLoaded] = useState(false);

  const activeImageURL = "https://www.svgrepo.com/show/114534/favorite.svg";
  const inactiveImageURL = "https://www.svgrepo.com/show/493935/favorite.svg";

  const myRef = useRef();

  const [isBlurIn, setBlurIn] = useState(true);

  const update = (active) => {};

  const handleClick = () => {
    toggleFavorited(data.id);
    setFavToggled(isFavorite(data.id));
  };

  useEffect(() => {
    if (favToggled) {
      myRef.current.style.backgroundImage = `url(${activeImageURL})`;
      myRef.current.style.opacity = 1;
    } else {
      myRef.current.style.backgroundImage = `url(${inactiveImageURL})`;
      myRef.current.style.opacity = 0.35;
      console.log("No");
    }

    if (loaded) {
      const timeoutId = setTimeout(() => {
        setBlurIn(false);
      }, 320);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [loaded, favToggled]);

  return (
    <div
      className={
        `pokemon-card ${isBlurIn ? "blurIn no-pointer-events" : ""} card-` +
        data.types[0].type.name
      }
      style={loaded ? {} : { display: "none" }}
    >
      <div className="pokemon-card-detail">
        <img
          className="pokemon-img-bg"
          src="https://img.icons8.com/?size=512&id=FSKmFQT9ret9&format=png"
        ></img>
        <div className="pokemon-card-dots"></div>
      </div>
      <div className="pokemon-card-container">
        <div className="pokemon-id">#{data.id.toString().padStart(3, "0")}</div>
        <div className="pokemon-name">{data.name}</div>
        <div className="pokemon-types">
          {data.types.map((p) => {
            return (
              <div
                key={data.id + p.type.name}
                className={"tag tag-" + p.type.name}
              >
                {p.type.name}
              </div>
            );
          })}
        </div>
      </div>

      <img
        className="pokemon-img"
        src={
          data.sprites.other.home.front_default !== null
            ? data.sprites.other.home.front_default
            : data.sprites.other["official-artwork"].front_default
        }
        onLoad={() => setLoaded(true)}
      ></img>
      <button
        className={`pokemon-card-favorite ${favToggled ? "bob" : "not"} `}
        onClick={handleClick}
        ref={myRef}
      ></button>
    </div>
  );
}
