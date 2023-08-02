import normal from '../assets/pokemonTypes/normal.svg';
import fighting from '../assets/pokemonTypes/fighting.svg';
import flying from '../assets/pokemonTypes/flying.svg';
import poison from '../assets/pokemonTypes/poison.svg';
import ground from '../assets/pokemonTypes/ground.svg';
import rock from '../assets/pokemonTypes/rock.svg';
import bug from '../assets/pokemonTypes/bug.svg';
import ghost from '../assets/pokemonTypes/ghost.svg';
import steel from '../assets/pokemonTypes/steel.svg';
import fire from '../assets/pokemonTypes/fire.svg';
import water from '../assets/pokemonTypes/water.svg';
import grass from '../assets/pokemonTypes/grass.svg';
import electric from '../assets/pokemonTypes/electric.svg';
import psychic from '../assets/pokemonTypes/psychic.svg';
import ice from '../assets/pokemonTypes/ice.svg';
import dragon from '../assets/pokemonTypes/dragon.svg';
import dark from '../assets/pokemonTypes/dark.svg';
import fairy from '../assets/pokemonTypes/fairy.svg';

export const getTypeIcon = (type) => {
  switch (type) {
    case 'normal':
      return normal;
    case 'fighting':
      return fighting;
    case 'flying':
      return flying;
    case 'poison':
      return poison;
    case 'ground':
      return ground;
    case 'rock':
      return rock;
    case 'bug':
      return bug;
    case 'ghost':
      return ghost;
    case 'steel':
      return steel;
    case 'fire':
      return fire;
    case 'water':
      return water;
    case 'grass':
      return grass;
    case 'electric':
      return electric;
    case 'psychic':
      return psychic;
    case 'ice':
      return ice;
    case 'dragon':
      return dragon;
    case 'dark':
      return dark;
    case 'fairy':
      return fairy;
    default:
      console.error(`Image not found for type: ${type}`);
      return null;
  }
};
