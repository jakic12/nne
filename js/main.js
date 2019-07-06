import Species from './Species.js'
import Animal from './Animal.js'
import Food from './Food.js'

var canvas = document.getElementById('mainCanvas'); canvas.width = document.body.clientWidth; canvas.height = document.body.clientHeight
var ctx = canvas.getContext("2d");

let animals = [];
let food = [];

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

for(let i = 0; i < 100; i++){
    food.push(new Food(Math.random()*canvas.width, Math.random()*canvas.height));
}
/*let params = animals[0].getInputParameters(animals);
ctx.beginPath()
ctx.moveTo(animals[0].x, animals[0].y)  
ctx.lineTo(animals[0].x + Math.cos(params.friend_direction)*(params.closest_friend_distance), animals[0].y + Math.sin(params.friend_direction)*(params.closest_friend_distance))
ctx.stroke()*/

function mainLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let eatenAnimals = [];
    let eatenFood = [];

    food.forEach((f) => {
        f.draw(ctx);
    });

    animals.forEach((animal) => {
        animal.calculateMovement(animals, food);  
        animal.updateAnimal();
        animal.drawAnimal(ctx, animals, food);

        if(animal.canEat){
            if(animals.includes(animal.canEat)){
                eatenAnimals.push(animal.canEat);
                animal.foodInventory += animal.canEat.foodInventory + 1;
            }else{
                eatenFood.push(animal.canEat);
                animal.foodInventory += 1;
            }
        }

        if(animal.canMate){
            let offsprings = animal.mate(animal.canMate);
            if(offsprings instanceof Array)
                animals = [...animals, ...offsprings];
            else
                animals.push(offsprings);
        }

        if(animal.x > canvas.width + animal.size){
            animal.x = animal.size;
        }

        if(animal.x < -animal.size){
            animal.x = canvas.width - animal.size
        }

        if(animal.y > canvas.height + animal.size){
            animal.y = animal.size;
        }

        if(animal.y < animal.size){
            animal.y = canvas.height - animal.size
        }

    })

    animals = animals.filter(animal => 
        animal.health > 0 &&
        !eatenAnimals.includes(animal)/* &&
        animal.x < canvas.width + animal.size &&
        animal.x > -animal.size &&
        animal.y < canvas.height + animal.size &&
        animal.y > -animal.size*/
    )

    food = food.filter(f => 
        !eatenFood.includes(f)    
    )
    
    window.requestAnimationFrame(mainLoop);
}

setInterval(() => {
    food.push(new Food(Math.random()*canvas.width, Math.random()*canvas.height));
}, 100)

window.requestAnimationFrame(mainLoop);