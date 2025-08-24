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
    // console.log('d', rateHome)
    this.rateHome = parseFloat(rateHome);
    this.rateAway = parseFloat(rateAway);
    this.rateDraw = parseFloat(rateDraw);
  }

  toString() {
    let date = 'UNKNOWN'
    if (this.date.toString() !== 'Invalid Date') {
      date = this.date.toISOString().split('T')[0]!
    }
    return `${this.home} vs ${this.away} (${date}) (${this.rateHome};${this.rateAway};${this.rateDraw})`;
  }
}
