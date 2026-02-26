export default class ScoringSystem{ 
    constructor(){ 
        this.score = 0; } 
    add(points){ 
        this.score += points; return this.score; 
        }
         
    reset(){ 
        this.score = 0; } getScore(){ return this.score; 
    } 
}