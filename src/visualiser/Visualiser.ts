export default abstract class Visualiser {

    /**
     * Create a NeoVis visualiser instance from neo4j db config
     */
    constructor() {
        console.log("Visualiser instance initiated!");
    }

    /**
     * Tell the visualiser to render
     */
    public abstract refresh(): void;
}

export { Visualiser };
