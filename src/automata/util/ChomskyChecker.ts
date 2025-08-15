import { CFG } from "../context-free/CFG";

export class ChomskyChecker{
    private readonly cfg : CFG;
    public constructor(cfg : CFG){
        this.cfg = cfg;
    }
    
}