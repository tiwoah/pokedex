import React, { useState, useEffect } from "react";
import PokemonCard from "./PokemonCard";

export default function PokemonList({
  pokemonData,
  dataLoading,
  setSelectedPokemon,
  setInfoPanelOpen,
}) {
  return (
    <>
      {pokemonData.map((p) => (
        <PokemonCard
          key={p.id}
          data={p}
          setSelectedPokemon={setSelectedPokemon}
          setInfoPanelOpen={setInfoPanelOpen}
        />
      ))}
      {pokemonData.length < 1 && !dataLoading ? (
        <div>Click the star to add a Pokémon to favorites!</div>
      ) : (
        <></>
      )}
      {dataLoading && (
        <div className="page-loader">
          <img
            className="page-spinner"
            src="https://img.icons8.com/?size=512&id=FSKmFQT9ret9&format=png"
          ></img>
        </div>
      )}
    </>
  );
}
