import { Team } from "./team.model";

export interface League {
    _id: string,
    name: string,
    owner: string,
    teams: Team[],
    public: boolean,
    requested: string[]
}