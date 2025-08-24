import { Match } from "../helper/match";

export abstract class PredictorBase {
  abstract predict(match: Match): [number, number];
}

export function getPredictors() {
  return {
    CalculationPredictor:
      require("./calculation").CalculationPredictor,
    SimplePredictor: require("./simple").SimplePredictor,
  };
}
