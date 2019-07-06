class AnimalGraph{
    constructor(canvas_id, animals, registerAnimalAdded){
        this.canvas = document.getElementById(canvas_id);
        this.ctx = this.canvas.getContext("2d");
        this.animals = animals;
        this.registerEventListeners();
        let that = this;
        registerAnimalAdded(function(animals){that.registerEventListeners(animals)});
        this.registerEventListeners = this.registerEventListeners.bind(this);
        this.drawGraph = this.drawGraph.bind(this);
    }

    getSpecies(){
        let out = [];
        for (const animal of this.animals) {
            if(!out.includes(animal.species) && !animal.isFood){
                out.push(animal.species);
            }
        }
        return out;
    }

    registerEventListeners(animals){
        if(animals && this.animals != animals){
            this.animals = animals;
        }
        this.getSpecies().forEach(species => {
            species.onanimalcountchange = this.drawGraph;
        });
    }

    drawGraph(){
        let ctx = this.ctx;
        this.getSpecies().forEach(s => {
            console.log(`%c ${s.animalCount}`, `background: ${s.color}; color: white`);
        });
        console.log("")
    }
}

export default AnimalGraph;