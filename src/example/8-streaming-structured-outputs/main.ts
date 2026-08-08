import { streamRecipe } from './structured-output';

const recipe = await streamRecipe('How to make a  hyderabadi Biriyani ');

console.log('Final recipe:');
console.log(JSON.stringify(recipe, null, 2));