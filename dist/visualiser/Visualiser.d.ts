export default abstract class Visualiser {
    /**
     * Create a NeoVis visualiser instance from neo4j db config
     */
    constructor();
    /**
     * Tell the visualiser to render
     */
    abstract refresh(): void;
}
export { Visualiser };
