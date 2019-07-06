import NeuralNetwork from './NeuralNetwork.js';

class Animal {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {Species} species 
     */
    constructor(x, y, species, neuralNet = null){
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
        this.canMate = null;

        this.isFood = false;
        this.lifespan = 0;

        this.hungerCoefficient = Math.random()*0.05+0.1
        this.hungerDieCoefficient = Math.random()*0.05+0.1
        this.lifespanCoefficient = Math.random()*0.02+0.03

        if(neuralNet)
            this.neuralNetwork = neuralNet
        else
            this.neuralNetwork = new NeuralNetwork(species.NNshape);
        species.animalCount++;
    }

    calculateMovement(animals, food){
        if(this.isFood)
            return;

        animals = animals.filter(el => el != this);

        let params = this.getInputParameters(animals, food);

        // put here for optimisation reasons
        this.canEat = this.calculateCanEat(params); 
        this.canMate = this.calculateCanMate(params);

        let acceptParams = [
            "closest_predator_distance",
            "predator_direction",
            "closest_friend_distance",
            "friend_direction",
            "closest_food_distance",
            "food_direction",
            "closest_lover_distance",
            "lover_direction",
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

        nnInputs[0] /= 500;
        nnInputs[1] /= Math.PI*2;
        nnInputs[2] /= 500;
        nnInputs[3] /= Math.PI*2;
        nnInputs[4] /= 500;
        nnInputs[5] /= Math.PI*2;
        nnInputs[6] /= 500;
        nnInputs[7] /= Math.PI*2;
        nnInputs[8] /= 100;
        nnInputs[9] /= 100;

        let result = this.neuralNetwork.forward(nnInputs);
        this.forward = result[0];
        this.strafe = result[1];
        this.turn = result[2];
    }

    updateAnimal(){
        if(!this.isFood){
            this.a = this.turn*2*Math.PI;
            this.x += Math.cos(this.a)*this.forward + Math.cos(this.a+Math.PI/2)*this.strafe
            this.y += Math.sin(this.a)*this.forward + Math.sin(this.a+Math.PI/2)*this.strafe
            if(this.hunger >= 100 && this.foodInventory > 0){
                this.foodInventory--;
                this.hunger = 0;
            }else if(this.hunger >= 100){
                this.health -= this.hungerDieCoefficient;
            }else{
                this.hunger += this.hungerCoefficient;
            }

            if(this.reproductiveUrge < 100)
                this.reproductiveUrge += 0.1;

            if(this.lifespan < 100)
                this.lifespan += this.lifespanCoefficient;
            else{
                this.species.animalCount--;
                this.isFood = true;
            }
        }
    }

    getInputParameters(animals, food){
        if(!this.isFood){
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
                closest_lover_distance:Infinity,
                lover_direction:NaN,
                lover:null,
                hunger:this.hunger,
                reproductiveUrge:this.reproductiveUrge,
                ammount_of_food:this.foodInventory
            };

            for (const animal of animals) {
                let distance = this.calcDistance(animal);
                let direction = this.calcDirection(animal);
                if(animal.species.fc_eval > this.species.fc_eval && !animal.isFood){
                    //if the animal is a predator
                    if(params.closest_predator_distance > distance){
                        params.closest_predator_distance = distance;
                        params.predator_direction = direction;
                        params.predator = animal;
                    }
                }else if((animal.species.fc_eval < this.species.fc_eval || animal.isFood) && this.species.carnivore){
                    //if the animal is food
                    if(params.closest_food_distance > distance){
                        params.closest_food_distance = distance;
                        params.food_direction = direction;
                        params.food = animal;
                    }
                }else if(animal.species === this.species && !animal.isFood){
                    //if the animal is a potential lover
                    if(params.closest_lover_distance > distance){
                        params.closest_lover_distance = distance;
                        params.lover_direction = direction;
                        params.lover = animal;
                    }
                }else{
                    //if the animal is a friend
                    if(params.closest_friend_distance > distance && !animal.isFood){
                        params.closest_friend_distance = distance;
                        params.friend_direction = direction;
                        params.friend = animal;
                    }
                }
            }
        

            for(const f of food){
                let distance = this.calcDistance(f);
                let direction = this.calcDirection(f);

                if(params.closest_food_distance > distance){
                    params.closest_food_distance = distance;
                    params.food_direction = direction;
                    params.food = f;
                }
            }
            return params;
        }
    }

    calcDistance(animal){
        return Math.sqrt((this.x - animal.x)**2 + (this.y - animal.y)**2);
    }

    calcDirection(animal){
        return Math.atan2((animal.y-this.y), (animal.x-this.x));
    }
    
    drawAnimal(ctx, animals, food){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.fillStyle = this.isFood? "#555" : this.species.color;
        ctx.fill();

        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + Math.cos(this.a)*(this.size+10), this.y + Math.sin(this.a)*(this.size+10))
        ctx.stroke()

        ctx.font = "10px Arial";
        ctx.fillText(`h:${parseInt(this.health)} f:${parseInt(this.foodInventory)} hu:${parseInt(this.hunger)} ru ${parseInt(this.reproductiveUrge)}`, this.x, this.y - this.size - 20);

        if(animals && food){
            let params = this.getInputParameters(animals, food);
            if(!params)
                return
            if(params.food){
                ctx.strokeStyle = "green";
                ctx.beginPath()
                ctx.moveTo(this.x, this.y)  
                ctx.lineTo(params.food.x, params.food.y)
                ctx.stroke()
            }
        
            if(params.predator){
                ctx.strokeStyle = "red";
                ctx.beginPath()
                ctx.moveTo(this.x, this.y)  
                ctx.lineTo(params.predator.x, params.predator.y)
                ctx.stroke()
            }

            if(params.lover){
                ctx.strokeStyle = "pink";
                ctx.beginPath()
                ctx.moveTo(this.x, this.y)  
                ctx.lineTo(params.lover.x, params.lover.y)
                ctx.stroke()
            }

            if(params.friend){
                ctx.strokeStyle = "blue";
                ctx.beginPath()
                ctx.moveTo(this.x, this.y)  
                ctx.lineTo(params.friend.x, params.friend.y)
                ctx.stroke()
            }
        }
    }
    calculateCanEat(params){
        if(!this.food)
        if(params.closest_food_distance < this.size + params.food.size)
            return params.food;
    }

    calculateCanMate(params){
        if(!this.food)
        if(params.closest_lover_distance < this.size && this.reproductiveUrge >= 100 && params.lover.reproductiveUrge){
            return params.lover;
        }
    }

    mate(animal){
        if(!this.food && !animal.food){
            this.reproductiveUrge = 0;
            animal.reproductiveUrge = 0;
            
            let offsprings = [];
            for(let i = 0; i < this.species.offspringCount; i++){
            
                let offspring = new Animal(
                    animal.x,
                    animal.y,
                    animal.species,
                    this.neuralNetwork.crossOver(animal.neuralNetwork)
                );
                offspring.hungerCoefficient = (Math.random() >= 0.5)? this.hungerCoefficient : animal.hungerCoefficient;
                offspring.hungerDieCoefficient = (Math.random() >= 0.5)? this.hungerDieCoefficient : animal.hungerDieCoefficient;
                offsprings.push(offspring);
            }
            return offsprings;
        }
    }

    variate(value, amount = 0.2){
        return value + (Math.random()-0.5)*2*amount
    }
}

export default Animal; 