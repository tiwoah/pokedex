import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function InfoPanel({ data, onClose }) {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [flavorText, setFlavorText] = useState("");
  const [loading, setLoading] = useState(true);

  let wasInside = false;

  const handleInsideClick = () => {
    wasInside = true;
  };

  const handleOutsideClick = () => {
    if (wasInside) {
    } else {
      onClose();
    }
    wasInside = false;
  };

  const getRandomFlavorText = (dataa) => {
    let item;
    while (true) {
      item =
        dataa.flavor_text_entries[
          Math.floor(Math.random() * dataa.flavor_text_entries.length)
        ];
      if (item.language.name === "en") {
        return item.flavor_text;
      }
    }
  };

  useEffect(() => {
    if (!data) return;

    const fetchPokemonDetails = async () => {
      try {
        const response = await axios.get(
          "https://pokeapi.co/api/v2/pokemon-species/" + data.id
        );
        setPokemonDetails(response.data);
        setLoading(false);

        setFlavorText(getRandomFlavorText(response.data));
      } catch (error) {
        console.error("Error fetching Pokemon details:", error);
        setLoading(false);
      }
    };

    fetchPokemonDetails();
  }, [loading, data]);

  //   clicking inside: INSIDE --> OUTSIDE
  return (
    <div className="panel blurIn" onClick={handleOutsideClick}>
      <div
        className={"panel-bg shine card-" + data.types[0].type.name}
        onClick={handleInsideClick}
      >
        <div className="panel-img-container no-pointer-events">
          <img
            className="panel-pokemon-img"
            src={
              data.sprites.other.home.front_shiny !== null
                ? data.sprites.other.home.front_shiny
                : data.sprites.other["official-artwork"].front_default
            }
          ></img>
        </div>

        <div className="panel-container">
          <div className="panel-container-detail no-pointer-events">
            <img
              className="panel-container-detail-bg"
              src="https://img.icons8.com/?size=512&id=FSKmFQT9ret9&format=png"
            ></img>
          </div>

          <div className="panel-container-info">
            <div className="panel-container-id">
              #{data.id.toString().padStart(3, "0")}
            </div>
            <div className="panel-container-name">{data.name}</div>
            <div className="panel-container-height">
              Height: {data.height / 10}m
            </div>
            <div className="panel-container-weight">
              Weight: {data.weight / 10}kg
            </div>
            <div className="panel-container-flavor">{flavorText}</div>
            {/* <div className="panel-info-buttons">
              <button>Stats</button>
              <button>Evolution</button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
