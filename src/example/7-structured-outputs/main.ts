import { createRecipe } from './structured-output';

const recipe = await createRecipe('A simple tomato rice recipe for two people');

console.log(JSON.stringify(recipe, null, 2));
