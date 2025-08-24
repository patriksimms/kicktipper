import { parse } from "date-fns";

export class Match {
  home: string;
  away: string;
  date: Date;
  rateHome: number;
  rateAway: number;
  rateDraw: number;

  constructor(
    home: string,
    away: string,
    dateStr: string,
    rateHome: string,
    rateAway: string,
    rateDraw: string
  ) {
    this.home = home.trim();
    this.away = away.trim();
    this.date = parse(dateStr.trim(), 'dd.MM.yy HH:mm', new Date());
    this.rateHome = parseFloat(rateHome);
    this.rateAway = parseFloat(rateAway);
    this.rateDraw = parseFloat(rateDraw);
  }

  toString() {
    return `${this.home} vs ${this.away} (${this.date.toISOString()})`;
  }
}
