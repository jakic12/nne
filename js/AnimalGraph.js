import Species from './Species.js'
import NeuralNetwork from './NeuralNetwork.js';


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
        out.sort((a,b) => b.fc_eval - a.fc_eval)
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
        let prevSum = 0;
        this.getSpecies().forEach(s => {
            console.log(`%c ${s.animalCount} ${s.fc_eval}`, `background: ${s.color}; color: white`);
            ctx.fillStyle = s.color;
            let height = (s.animalCount/this.animals.length)*this.canvas.height;
            ctx.fillRect(
                0,
                prevSum,
                this.canvas.width,
                prevSum+height
            )
            prevSum+=height;
        });
        console.log("sum: " + this.animals.length)
    }

    drawAnimalStats(animal){
        let statsDiv = document.getElementById("stats");
        while (statsDiv.firstChild) {
            statsDiv.removeChild(statsDiv.firstChild);
        }
        for (const key of Object.getOwnPropertyNames(animal)) {
            var node = document.createElement("DIV"); 
            if(animal[key] instanceof Species){
                var textnode = document.createTextNode(`${key} => ${animal[key].color}`);
                node.style = `background:${animal[key].color}`;
            }else if(animal[key] instanceof NeuralNetwork){
                var textnode = document.createTextNode(`${key} => [${animal[key].shape}]`);
            }else{
                var textnode = document.createTextNode(`${key} => ${animal[key]}`);         
            }             
            node.appendChild(textnode);                              
            statsDiv.appendChild(node);
        }

    }
}

export default AnimalGraph;