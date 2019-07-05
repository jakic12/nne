class NeuralNetwork{
    /**
     * @param {Array<number>} shape 
     */
    constructor(shape){
        this.neurons = []
        this.synapses = []
        this.biases = []
        this.shape = shape;
        for (let i = 0; i < shape.length; i++) {
            this.neurons[i] = Array.from({length: shape[i]}, () => 0)
            if(i != 0)
                this.biases[i] = Array.from({length: shape[i]}, () => Math.random() * 2-1)
            if(i+1 < shape.length){
                this.synapses[i] = []
                for (let j = 0; j < shape[i+1]; j++) {
                    this.synapses[i][j] = Array.from({length: shape[i]}, () => Math.random() * 2-1)
                }
            }  
        }

        //console.log(this.neurons, this.synapses, this.biases)
    }

    forward(data){
        if(data.length != this.shape[0])
            throw "data array length doesn't match network input length";
        
        this.neurons[0] = data;
        for (let i = 1; i < this.shape.length; i++) {
            let layerArray = this.matrixVectorDotProduct(this.synapses[i-1], this.neurons[i-1]);
            this.neurons[i] = this.activate(
                this.biases[i].map((bias,j) => 
                    layerArray[j] + bias
                )
            )
        }
        return this.neurons[this.neurons.length - 1]
    }

    vectorVectorDotProduct(a,b){
        if(!a instanceof Array || !b instanceof Array)
            throw "a and or b are not arrays";

        if(a.length != b.length)
            throw `the arrays have to be equal lengths (${a.length} != ${b.length})`;
        
        a = [...a]
        b = [...b]
        a = a.map((v, i) => v * b[i]);
        return a.reduce((p, v) => p+v,0);
    }

    matrixVectorDotProduct(a,b){
        if(!a instanceof Array || !b instanceof Array)
            throw "a and or b are not arrays";
        
        if(!a[0] instanceof Array)
            throw "a should be a 2d array"
        
        if(a[0].length != b.length)
            throw `Invalid array dimentions (${a[0].length} != ${b.length})`;
        
        let out = [];
        for (let i = 0; i < a.length; i++) {
            out[i] = this.vectorVectorDotProduct(a[i], b);
        }
        return out;
    }

    activate(a, fn = Math.tanh){
        return a.map((v) => {
            if(v instanceof Array){
                return this.activate(v)
            }else{
                return fn(v)
            }
        })
    }
}

export default NeuralNetwork