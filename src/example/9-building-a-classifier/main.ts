import { classifySentiment } from "./generate-enum";

const result = await classifySentiment(
    'I am not sure how i feel i failed in my exam',
)

console.log(result);