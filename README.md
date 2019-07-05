# Neural Network ecosystem
This project provides an ecosystem of Animals, wich in theory work together and hunt other animals.

# Animal
Each Animal has a few goals
It has a hunger meter, health meter and reproductive urge meter
If the the hunger meter reaches 100, first it will try to eat an animal from its inventory
if the inventory is empty its health will start decaying
if health reaches 0 it will die
An animal eats another animal by touching it - the animal wich has a lower foodChainEvaluation score, dies
the animal that ate it also gets all the food in the dead animal inventory

# Species
Each animal has a species.
Each species has unique properties.
The food chain evaluation - fc_eval represents how strong the animal is.
If two animals with a different score touch, one gets eaten or put into the inventory
If two animals with the same score touch, a friendly encounter happens -- dont know what yet

# Neural network part
The neural network inputs are:
closest predator distance
predator direction
closest friend distance
friend direction
closest food distance
food direction
hunger
reproductive urge
ammount of food

Outputs:
forward, strafe, turn
