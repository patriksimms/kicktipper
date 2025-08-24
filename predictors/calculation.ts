import { Match } from "../helper/match";
import { PredictorBase } from "./base";

export class CalculationPredictor extends PredictorBase {
  MAX_GOALS = 5;
  DOMINATION_THRESHOLD = 9;
  DRAW_THRESHOLD = 1.3;
  NONLINEARITY = 0.5;

  predict(match: Match): [number, number] {
    const difference = Math.abs(match.rateHome - match.rateAway);

    if (difference < this.DRAW_THRESHOLD) {
      return [1, 1];
    }

    const totalGoals = Math.round(
      Math.min(difference / this.DOMINATION_THRESHOLD, 1) * this.MAX_GOALS
    );

    const ratio =
      Math.pow(
        (match.rateHome > match.rateAway
          ? match.rateHome / match.rateAway
          : match.rateAway / match.rateHome) /
          (match.rateHome + match.rateAway),
        this.NONLINEARITY
      );

    let winner = Math.round(totalGoals * ratio);
    let loser = Math.round(totalGoals * (1.0 - ratio));

    if (winner <= loser) {
      winner += 1;
    }

    if (match.rateHome > match.rateAway) {
      return [loser, winner];
    } else {
      return [winner, loser];
    }
  }
}
