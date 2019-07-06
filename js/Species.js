class Species{
    /**
     * @param {number} fc_eval foodchain evaluation - how predatory the animal is, it can eat animals with a lower score if carnivore and can be eaten by animals with a lower score
     * @param {boolean} carnivore can it eat other animals?
     * @param {speed} speed initial speed of the species
     */
    constructor(fc_eval = 1, NNshape = [11, 10, 3], carnivore = true, speed = 3, color = getRandomColor()){
        this.fc_eval = fc_eval;
        this.carnivore = carnivore;
        this.color = color;
        this.speed = speed;
        this.NNshape = NNshape;
        this.offspringCount = parseInt(10/fc_eval);
    }    
}

function getRandomColor(){
    return "#" + ('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)
}

export default Species;