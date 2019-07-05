import NeuralNetwork from './NeuralNetwork.js';

class Animal {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {Species} species 
     */
    constructor(x, y, species){
        this.species = species
        this.x = x
        this.y = y
        this.speed = this.variate(species.speed)
        this.size = 10;//pixel representation

        //angle that the animal is facing
        this.a = Math.random()*Math.PI*2
        //controls
        this.forward = 0
        this.strafe = 0
        this.turn = 0
        
        //main animal variables for survival
        this.hunger = 0
        this.health = 100
        this.reproductiveUrge = 0
        this.foodInventory = 0
        this.canEat = null;

        this.hungerCoefficient = 0.2//Math.random()*0.2+0.1
        this.hungerDieCoefficient = 0.2//Math.random()*0.2+0.1

        this.neuralNetwork = new NeuralNetwork(species.NNshape);
    }

    calculateMovement(animals){
        animals = animals.filter(el => el != this);

        let params = this.getInputParameters(animals);

        this.canEat = this.calculateCanEat(params); // put here for optimisation reasons

        let acceptParams = [
            "closest_predator_distance",
            "predator_direction",
            "closest_friend_distance",
            "friend_direction",
            "closest_food_distance",
            "food_direction",
            "hunger",
            "reproductiveUrge",
            "ammount_of_food"
        ]

        let nnInputs = [];
        for (const key in params) {
            if(!acceptParams.includes(key))
                continue;
            
            if(params[key] == Infinity){
                nnInputs.push(-1);
            }else if(isNaN(params[key])){
                nnInputs.push(0);
            }else{
                nnInputs.push(params[key]);
            }
        }

        let result = this.neuralNetwork.forward(nnInputs);
        this.forward = result[0];
        this.strafe = result[1];
        this.turn = result[2];
    }

    updateAnimal(){
        this.a = this.turn*2*Math.PI;
        this.x += Math.cos(this.a)*this.forward + Math.cos(this.a+Math.PI/2)*this.strafe
        this.y += Math.sin(this.a)*this.forward + Math.sin(this.a+Math.PI/2)*this.strafe
        if(this.hunger >= 100 && this.foodInventory > 0){
            this.foodInventory--;
            this.hunger = 0;
        }else if(this.hunger >= 100){
            this.health -= this.hungerDieCoefficient;
            console.log("animal is starving");
        }else{
            this.hunger += this.hungerCoefficient;
        }

        this.reproductiveUrge += 0.2;
    }

    getInputParameters(animals){
        animals = animals.filter(el => el != this);
        let params = {
            closest_predator_distance:Infinity,
            predator_direction:NaN,
            predator:null,
            closest_friend_distance:Infinity,
            friend_direction:NaN,
            friend:null,
            closest_food_distance:Infinity,
            food_direction:NaN,
            food:null,
            hunger:this.hunger,
            reproductiveUrge:this.reproductiveUrge,
            ammount_of_food:this.foodInventory
        };

        for (const animal of animals) {
            let distance = this.calcDistance(animal);
            let direction = this.calcDirection(animal);
            if(animal.species.fc_eval > this.species.fc_eval){
                //if the animal is a predator
                if(params.closest_predator_distance > distance){
                    params.closest_predator_distance = distance;
                    params.predator_direction = direction;
                    params.predator = animal;
                }
            }else if(animal.species.fc_eval < this.species.fc_eval && this.species.carnivore){
                //if the animal is food
                if(params.closest_food_distance > distance){
                    params.closest_food_distance = distance;
                    params.food_direction = direction;
                    params.food = animal;
                }
            }else{
                //if the animal is a friend
                if(params.closest_friend_distance > distance){
                    params.closest_friend_distance = distance;
                    params.friend_direction = direction;
                    params.friend = animal;
                }
            }
        }
        return params;
        console.log(params);
    }

    calcDistance(animal){
        return Math.sqrt((this.x - animal.x)**2 + (this.y - animal.y)**2);
    }

    calcDirection(animal){
        return Math.atan2((animal.y-this.y), (animal.x-this.x));
    }
    
    drawAnimal(ctx){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.fillStyle = this.species.color;
        ctx.fill();

        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + Math.cos(this.a)*(this.size+10), this.y + Math.sin(this.a)*(this.size+10))
        ctx.stroke()

        ctx.font = "10px Arial";
        ctx.fillText(`h:${parseInt(this.health)} f:${parseInt(this.foodInventory)} hu:${parseInt(this.hunger)}`, this.x, this.y - this.size - 50);
    }

    calculateCanEat(params){
        if(params.closest_food_distance < this.size)
            return params.food;
    }

    variate(value, amount = 0.2){
        return value + (Math.random()-0.5)*2*amount
    }
}

export default Animal; 