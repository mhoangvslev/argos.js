export default class Watcher {

    /**
     * Create a watcher
     * @param {string} contractAddr 
     */
    constructor(contractAddr, API) {
        const etherScanAPI = config.etherscan.api;
        this._provider = new ethers.providers.EtherscanProvider('homestead', etherScanAPI);
        this._contractAddr = contractAddr;
        this._dbService = dbService;

        this._contract = new ethers.Contract(this._contractAddr, abi, this._provider);
        console.log(this._contract);
    }

    async getEvents(eventName, fromBlock = 0, toBlock = 'latest') {

    }

    async watchEvents() {

    }
}