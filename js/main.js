import Species from './Species.js'
import Animal from './Animal.js'
import Food from './Food.js'
import AnimalGraph from './AnimalGraph.js'

var canvas = document.getElementById('mainCanvas'); canvas.width = document.body.clientWidth-300; canvas.height = document.body.clientHeight
var ctx = canvas.getContext("2d");

let animals = [];
let food = [];
var animalAdded;
let graph = new AnimalGraph('animalGraph', animals, e => {
    animalAdded = e;
});

var showLines = false;
document.getElementById("drawLinesToggle").onclick = () => {
    showLines = !showLines
}

var showOldest = false;
document.getElementById("showOldestToggle").onclick = () => {
    showOldest = !showOldest
}

var speedUp = 1;
let speedUpSlider = document.getElementById("speedUpSlider");
speedUpSlider.value = speedUp
speedUpSlider.onchange = () => {
    speedUp = speedUpSlider.value
}

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
animalAdded(animals);

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
    animalAdded(animals);

    let eatenAnimals = [];
    let eatenFood = [];

    food.forEach((f) => {
        f.draw(ctx);
    });

    let animalsCopy = [...animals];
        animalsCopy.sort((a,b) => {
            if(!showOldest){
                return b.getValue() - a.getValue()
            }else{
                return b.generation - a.generation
            }
        }).filter((a) => !a.isFood)
    let bestAnimal = animalsCopy[0];

    graph.drawAnimalStats(bestAnimal);

    animals.forEach((animal) => {
        if(showLines || animal == bestAnimal)
            animal.drawAnimal(ctx, animals, food);
        else
            animal.drawAnimal(ctx);
        animal.calculateMovement(animals, food);  
        animal.updateAnimal(speedUp);


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

    //every live animal that gets eaten needs animal count reduced
    eatenAnimals.filter(animal => !animal.isFood).forEach(animal => {
        animal.species.animalCount--;
    })

    animals = animals.filter(animal => 
        animal.health > 0 &&
        !eatenAnimals.includes(animal)/* &&
        animal.x < canvas.width + animal.size &&
        animal.x > -animal.size &&
        animal.y < canvas.height + animal.size &&
        animal.y > -animal.size*/
    )

    if(animals.length > 200){
        let animalsCopy = [...animals];
        animalsCopy.sort((a,b) => 
            a.getValue() - b.getValue()
        )
        for(let i = 0; i < 100; i++){
            animalsCopy[i].isFood = true;
        }
    }

    food = food.filter(f =>
        !eatenFood.includes(f) 
    )
    animalAdded(animals);
    
    window.requestAnimationFrame(mainLoop);
}

function addFood(){
    food.push(new Food(Math.random()*canvas.width, Math.random()*canvas.height));
    setTimeout(addFood, 100/speedUp)
}
setTimeout(addFood, 100/speedUp)

function addNewSpecies(){
    let newspecies = new Species(parseInt(Math.random()*6));
    let newspeciesoffspringcount = newspecies.offspringCount;
    newspecies.offspringCount = 20;
    if(animals.length < 2)
        addRandomAnimals(20,newspecies);
    else{
        let animalsCopy = [...animals];
        animalsCopy.sort((a,b) => 
            b.getValue() - a.getValue()
        )
        let mate1 = animalsCopy[0];
        if(animalsCopy[1].species.NNshape == mate1.species.NNshape){
            let offsprings = mate1.mate(animalsCopy[1], newspecies, {x:canvas.width, y:canvas.height})
            console.log(`added ${offsprings.length} animals`)
            animals = [...animals, ...offsprings]
        }else{
            let mate2;
            for(let i = 2; i < animalsCopy.length; i++){
                if(animalsCopy[i].species.NNshape == mate1.species.NNshape){
                    mate2 = animalsCopy[i];
                    break;
                }
            }

            if(!mate2){
                addRandomAnimals(20,newspecies);
            }else{ 
                let offsprings = mate1.mate(mate2, newspecies, {x:canvas.width, y:canvas.height})
                animals = [...animals, ...offsprings]
            }
        }
    }

    newspecies.offspringCount = newspeciesoffspringcount;
        
    animalAdded(animals);
    setTimeout(addNewSpecies, 20000/speedUp);
}

setTimeout(addNewSpecies, 20000/speedUp);

function addRandomAnimals(count, species){
    for (let i = 0; i < count; i++) {
        animals.push(new Animal(Math.random()*canvas.width,Math.random()*canvas.height,species));
    }
}

window.requestAnimationFrame(mainLoop);