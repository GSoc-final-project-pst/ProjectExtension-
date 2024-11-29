class FeedCleaner {
    constructor() {
        this.model = null;
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            await this.loadModel();
            this.initialized = true;
        }
    }

    async loadModel() {
        try {
            const model = tf.sequential();
            
            // Add layers
            model.add(tf.layers.dense({
                units: 16,
                activation: 'relu',
                inputShape: [10]
            }));
            
            model.add(tf.layers.dense({
                units: 8,
                activation: 'relu'
            }));
            
            model.add(tf.layers.dense({
                units: 1,
                activation: 'sigmoid'
            }));

            model.compile({
                optimizer: tf.train.adam(0.001),
                loss: 'binaryCrossentropy',
                metrics: ['accuracy']
            });

            this.model = model;
            await this.trainModel(); 
        } catch (error) {
            console.error('Error loading model:', error);
        }
    }

    async trainModel() {
        const trainingData = tf.randomNormal([100, 10]);
        const labels = tf.randomUniform([100, 1]);

        await this.model.fit(trainingData, labels, {
            epochs: 5,
            batchSize: 32
        });
    }

    extractFeatures(postElement) {
        const text = postElement.innerText || '';
        const features = new Array(10).fill(0);

        features[0] = text.length / 1000; 
        features[1] = (text.match(/sponsored/gi) || []).length;
        features[2] = (text.match(/suggested/gi) || []).length;
        features[3] = (text.match(/ad/gi) || []).length;
       

        return tf.tensor2d([features]);
    }

    async predictPost(postElement) {
        try {
            const features = this.extractFeatures(postElement);
            const prediction = this.model.predict(features);
            const score = await prediction.data();
            return score[0];
        } catch (error) {
            console.error('Prediction error:', error);
            return 0;
        }
    }
}
