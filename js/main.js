import Species from './Species.js'
import Animal from './Animal.js'

var canvas = document.getElementById('mainCanvas'); canvas.width = document.body.clientWidth; canvas.height = document.body.clientHeight
var ctx = canvas.getContext("2d");

let animals = [];

/*let minorSpecies = new Species();
for (let i = 0; i < 100; i++) {
    animals.push(new Animal(Math.random()*canvas.width,Math.random()*canvas.height,minorSpecies));
}
let dangerSpecies = new Species(2);
for (let i = 0; i < 100; i++) {
    animals.push(new Animal(Math.random()*canvas.width,Math.random()*canvas.height,dangerSpecies));
}*/

for(let foodChainEval = 0; foodChainEval < 5; foodChainEval++){
    let newspecies = new Species(foodChainEval);
    for (let i = 0; i < 20; i++) {
        animals.push(new Animal(Math.random()*canvas.width,Math.random()*canvas.height,newspecies));
    }
}
/*let params = animals[0].getInputParameters(animals);
ctx.beginPath()
ctx.moveTo(animals[0].x, animals[0].y)  
ctx.lineTo(animals[0].x + Math.cos(params.friend_direction)*(params.closest_friend_distance), animals[0].y + Math.sin(params.friend_direction)*(params.closest_friend_distance))
ctx.stroke()*/

function mainLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let eatenAnimals = [];

    animals.forEach((animal) => {
        animal.calculateMovement(animals);  
        animal.updateAnimal();
        animal.drawAnimal(ctx);

        if(animal.canEat){
            eatenAnimals.push(animal.canEat);
            animal.foodInventory += animal.canEat.foodInventory + 1;
        }

        if(animal.x > canvas.width - animal.size){
            animal.x = canvas.width - animal.size;
        }

        if(animal.x < animal.size){
            animal.x = animal.size
        }

        if(animal.y > canvas.height - animal.size){
            animal.y = canvas.height - animal.size;
        }

        if(animal.y < animal.size){
            animal.y = animal.size
        }

    })

    animals = animals.filter(animal => 
        animal.health > 0 && !eatenAnimals.includes(animal)
    )
    
    window.requestAnimationFrame(mainLoop);
}

window.requestAnimationFrame(mainLoop);