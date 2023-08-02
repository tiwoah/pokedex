import React, { useState, useEffect } from "react";
import PokemonCard from "./PokemonCard";

export default function PokemonList({ pokemonData, dataLoading }) {
  return (
    <>
      {pokemonData.map((p) => (
        <PokemonCard key={p.id} data={p} />
      ))}
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
