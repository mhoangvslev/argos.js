"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var neo4j_driver_1 = require("neo4j-driver");
var DatabaseFactory_1 = require("../factory/DatabaseFactory");
var Watcher_1 = require("./Watcher");
var EthereumWatcher = /** @class */ (function (_super) {
    __extends(EthereumWatcher, _super);
    /**
     * Create a watcher for Ethereum blockchain
     * @param {string} contractAddr the address of the verified contract
     * @param {string} abi the ABI of the verified contract
     * @param {number} providerType the Etherscan API Token
     * @param {DatabaseConstructorType} dbType the database servcice constructor
     * @param {ProviderConfig} providerConfig the loaded config file
     * @param {boolean} clearDB retrieve from genesis block instead of the latest in DB (db cleared)
     * @param {string} exportDir export dir
     * @returns {EthereumWatcher} Ethereum instance
     */
    function EthereumWatcher(contractAddr, abi, providerType, dbType, providerConfig, clearDB, exportDir) {
        var _this = _super.call(this) || this;
        /**
         * Call the right provider for the contract
         * @param {ProviderEnum} providerType the provider type
         * @param {ProviderConfig} config the loaded config file
         * @returns {ethers.providers.BaseProvider} a provider
         */
        function getProvider(providerType, config) {
            switch (providerType) {
                case 0 /* defaultProvider */:
                default:
                    return ethers_1.ethers.getDefaultProvider();
                case 1 /* EtherscanProvider */:
                    return new ethers_1.ethers.providers.EtherscanProvider(ethers_1.ethers.utils.getNetwork(config.etherscan.network), config.etherscan.api);
                case 2 /* InfuraProvider */:
                    console.log("Infura");
                    return new ethers_1.ethers.providers.InfuraProvider(ethers_1.ethers.utils.getNetwork(config.infura.network), config.infura.projectId);
                case 3 /* JsonRpcProvider */:
                    console.log("JSON-RPC");
                    var urlString = (config.jsonrpc.username == "") ? config.jsonrpc.url : {
                        url: config.jsonrpc.url,
                        user: config.jsonrpc.username,
                        password: config.jsonrpc.password,
                        allowInsecure: config.jsonrpc.allowInsecure
                    };
                    return new ethers_1.ethers.providers.JsonRpcProvider(urlString, ethers_1.ethers.utils.getNetwork(config.jsonrpc.network));
                case 4 /* Web3Provider */:
                    return new ethers_1.ethers.providers.Web3Provider({ host: config.web3.host });
                case 5 /* IpcProvider */:
                    return new ethers_1.ethers.providers.IpcProvider(config.ipc.path, ethers_1.ethers.utils.getNetwork(config.ipc.network));
            }
        }
        _this._contractAddr = contractAddr;
        _this._dbType = dbType;
        _this._dbService = undefined;
        _this._clearDB = clearDB;
        _this._config = providerConfig;
        _this._provider = getProvider(providerType, providerConfig);
        _this._contract = new ethers_1.ethers.Contract(_this._contractAddr, abi, _this._provider);
        _this._exportDir = exportDir;
        _this._infos = new Map();
        _this._event = undefined;
        _this._timeout = _this._config.timeout;
        _this.initOnce().then(function () { console.log("Ethereum Watcher initiated!"); });
        return _this;
    }
    /**
     * Watch event with particular model
     * @param {string} eventName name of the event, usually 'Transfer'
     * @param {Neode.SchemaObject} dbModel the model loaded via require()
     * @param {number} fromDate timestamp
     * @param {number} toDate timestamp
     */
    EthereumWatcher.prototype.watchEvents = function (eventName, fromDate, toDate) {
        if (fromDate === void 0) { fromDate = undefined; }
        if (toDate === void 0) { toDate = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var fromBlock, _a, toBlock, _b, startTime, endTime, elapsedTime, elapsedSeconds, elapsedMinutes, elapsedMilli;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!fromDate) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.timeToBlock(fromDate)];
                    case 1:
                        _a = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = 0;
                        _c.label = 3;
                    case 3:
                        fromBlock = _a;
                        if (!toDate) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.timeToBlock(toDate)];
                    case 4:
                        _b = _c.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this._provider.getBlockNumber()];
                    case 6:
                        _b = _c.sent();
                        _c.label = 7;
                    case 7:
                        toBlock = _b;
                        this._event = this._contract.interface.events[eventName];
                        console.log("Start logging " + eventName + " events");
                        startTime = new Date();
                        if (!this._clearDB) return [3 /*break*/, 9];
                        console.log("Update cache...");
                        return [4 /*yield*/, this.getEvents(eventName, fromBlock, toBlock)];
                    case 8:
                        _c.sent();
                        return [3 /*break*/, 11];
                    case 9:
                        console.log("Reload from cache...");
                        return [4 /*yield*/, this.importCSV()
                                .then(function () { return __awaiter(_this, void 0, void 0, function () {
                                var latestInDB, earliestInDB, upperBlock, lowerBlock;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log("Cached reloaded, updating...");
                                            this._clearDB = false;
                                            return [4 /*yield*/, this._dbService.executeQuery({ query: "MATCH ()-[r:TRANSFER]->() RETURN max(r.blockheight) as result" })];
                                        case 1:
                                            latestInDB = _a.sent();
                                            return [4 /*yield*/, this._dbService.executeQuery({ query: "MATCH ()-[r:TRANSFER]->() RETURN min(r.blockheight) as result" })];
                                        case 2:
                                            earliestInDB = _a.sent();
                                            // console.log(earliestInDB, latestInDB);
                                            this._infos.set("fromBlock", fromBlock);
                                            this._infos.set("toBlock", toBlock);
                                            this._infos.set("fromDate", fromDate);
                                            this._infos.set("toDate", toDate);
                                            upperBlock = latestInDB ? parseInt(latestInDB[0].get("result")) : undefined;
                                            lowerBlock = earliestInDB ? parseInt(earliestInDB[0].get("result")) : undefined;
                                            if (!(lowerBlock && upperBlock)) return [3 /*break*/, 10];
                                            if (!(fromBlock > upperBlock || toBlock < lowerBlock)) return [3 /*break*/, 4];
                                            console.log("The required range is outside DB's range");
                                            return [4 /*yield*/, this.getEvents(eventName, fromBlock, toBlock)];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4:
                                            if (!(fromBlock >= lowerBlock && toBlock <= upperBlock)) return [3 /*break*/, 6];
                                            console.log("The required range is inside DB's range");
                                            return [4 /*yield*/, this.getEvents(eventName, fromBlock, toBlock)];
                                        case 5:
                                            _a.sent();
                                            _a.label = 6;
                                        case 6:
                                            if (!(fromBlock != 0 && fromBlock < lowerBlock)) return [3 /*break*/, 8];
                                            console.log("The required fromBlock is earlier than DB's earliest block");
                                            return [4 /*yield*/, this.getEvents(eventName, fromBlock, lowerBlock)];
                                        case 7:
                                            _a.sent();
                                            _a.label = 8;
                                        case 8:
                                            if (!(toBlock > upperBlock)) return [3 /*break*/, 10];
                                            console.log("The required toBlock is more recent than DB's latest block");
                                            return [4 /*yield*/, this.getEvents(eventName, upperBlock, toBlock)];
                                        case 9:
                                            _a.sent();
                                            _a.label = 10;
                                        case 10: return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(function (reason) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log("Cache not loaded or corrupted, updating...");
                                            this._clearDB = true;
                                            return [4 /*yield*/, this.getEvents(eventName, fromBlock, toBlock)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 10:
                        _c.sent();
                        _c.label = 11;
                    case 11:
                        endTime = new Date();
                        elapsedTime = endTime.getTime() - startTime.getTime();
                        elapsedSeconds = elapsedTime / 1000;
                        elapsedMinutes = elapsedSeconds / 60;
                        elapsedMilli = (elapsedSeconds - Math.floor(elapsedSeconds)) * 1000;
                        console.log("Finished in " + Math.trunc(elapsedMinutes) + " mins " + Math.trunc(elapsedSeconds) + " s " + Math.round(elapsedMilli) + " ms");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Convert timestimp to blocknumber
     * @param {Date} date
     */
    EthereumWatcher.prototype.timeToBlock = function (date) {
        return __awaiter(this, void 0, void 0, function () {
            var latestBlockNo, upperBlock, lowerBlock, blockTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._provider.getBlockNumber()];
                    case 1:
                        latestBlockNo = _a.sent();
                        return [4 /*yield*/, this._provider.getBlock(latestBlockNo)];
                    case 2:
                        upperBlock = _a.sent();
                        return [4 /*yield*/, this._provider.getBlock(1)];
                    case 3:
                        lowerBlock = _a.sent();
                        blockTime = (upperBlock.timestamp - lowerBlock.timestamp) / latestBlockNo;
                        return [2 /*return*/, latestBlockNo - Math.ceil((upperBlock.timestamp - date.getTime() * 1000) / blockTime)];
                }
            });
        });
    };
    /**
     * Export to CSV
     */
    EthereumWatcher.prototype.exportCSV = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._dbService.executeQuery({
                        query: "CALL apoc.export.csv.query({query}, {file}, {config}) YIELD file, source, format, nodes, relationships, properties, time, rows, data",
                        params: {
                            query: "MATCH (src:Account)-[r:TRANSFER]->(tgt:Account) RETURN r.amount AS amount, r.blockheight as blockheight, r.date as datetime , tgt.address AS receiver, src.address AS sender",
                            file: this._exportDir + this._contractAddr + ".csv",
                            config: null
                        }
                    })];
            });
        });
    };
    /**
     * Import from CSV
     */
    EthereumWatcher.prototype.importCSV = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cypher;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.refreshDB();
                        return [4 /*yield*/, this._dbService.dbClearAll()];
                    case 1:
                        _a.sent();
                        cypher = {
                            query: "LOAD CSV WITH HEADERS FROM 'file:///" + this._contractAddr + ".csv' AS row\n" +
                                "MERGE (src:Account {address: row.sender})\n" +
                                "MERGE (tgt:Account {address: row.receiver})\n" +
                                "MERGE (src)-[r:TRANSFER]->(tgt) ON CREATE SET r.amount = row.amount, r.blockheight = row.blockheight, r.date = row.datetime"
                        };
                        return [2 /*return*/, this._dbService.executeQuery(cypher)];
                }
            });
        });
    };
    /**
     * Get basic information about the contract
     * @returns {Map} the object containing information
     */
    EthereumWatcher.prototype.getInfos = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._infos];
            });
        });
    };
    /**
     * Assemble a selection of data out of a log part
     * @param {ethers.providers.Log[]} logPart the extracted log part
     * @returns { EventInfoDataStruct } the required information to build a db node
     */
    EthereumWatcher.prototype.getLogData = function (logPart) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!logPart) return [3 /*break*/, 2];
                        if (logPart.length == 0) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, Promise.all(logPart.map(function (logEntry) { return _this.extractData(logEntry); }))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result ? result : undefined];
                    case 2: return [2 /*return*/, undefined];
                }
            });
        });
    };
    /**
     * Get events from provider and store data to database
     * @param {string} eventName
     * @param {number} fromBlock
     * @param {number} toBlock
     */
    EthereumWatcher.prototype.getEvents = function (eventName, fromBlock, toBlock) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getEvents(eventName, fromBlock, toBlock)
                            .then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var queries;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        queries = [];
                                        result.logs.forEach(function (event) {
                                            queries.push({
                                                query: "MERGE (src:Account {address: {sender}})\n MERGE (tgt:Account {address: {receiver}})\n MERGE (src)-[r:TRANSFER]->(tgt) ON CREATE SET r.amount = toFloat({amount}), r.blockheight = toInteger({blockheight}), r.date = {date}",
                                                params: { sender: event.from, receiver: event.to, amount: event.value, blockheight: event.blockNumber, date: event.date }
                                            });
                                        });
                                        // console.log(queries);
                                        return [4 /*yield*/, this._dbService.executeQueries(queries)];
                                    case 1:
                                        // console.log(queries);
                                        _a.sent();
                                        return [4 /*yield*/, this.exportCSV()];
                                    case 2:
                                        _a.sent();
                                        console.log("Database updated!");
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .catch(function (reason) {
                            console.error("Could not retrieve " + eventName + " events", reason);
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EthereumWatcher.prototype.initOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _b = (_a = this._infos).set;
                        _c = ["contractName"];
                        return [4 /*yield*/, this._contract.name()];
                    case 1:
                        _b.apply(_a, _c.concat([_k.sent()]));
                        _e = (_d = this._infos).set;
                        _f = ["contractDecimals"];
                        return [4 /*yield*/, this._contract.decimals()];
                    case 2:
                        _e.apply(_d, _f.concat([_k.sent()]));
                        _h = (_g = this._infos).set;
                        _j = ["totalSupply"];
                        return [4 /*yield*/, this._contract.totalSupply()];
                    case 3:
                        _h.apply(_g, _j.concat([_k.sent()]));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh the database connection, do an action then close connection
     * @param {function} callback the action to perform once the connection is interupted
     */
    EthereumWatcher.prototype.refreshDB = function () {
        if (this._dbService !== undefined) {
            this._dbService.dbReconnect();
        }
        else {
            this._dbService = DatabaseFactory_1.DatabaseFactory.createDbInstance(this._dbType);
            this._dbService.dbCreateModel(this._dbType.model);
        }
    };
    /**
     * Get events from log
     * @param {string} eventName the event name to watch
     * @param {number} fromBlock the start block, default is 0
     * @param {number} toBlock  the ending block, default is 'lastest'
     * @returns {Promise<{logs: ethers.providers.Log[]; steps: number;}>} the graph data and the number of steps required to process the log
     */
    EthereumWatcher.prototype._getEvents = function (eventName, fromBlock, toBlock) {
        return __awaiter(this, void 0, void 0, function () {
            function blockTagToNumber(blkTag) {
                return typeof (blkTag) == "string" ? parseInt(blkTag) : blkTag;
            }
            var latestBlock, tBlock, fBlock, logs, self, start, end, steps, startTime, log, elapsedTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.refreshDB(); // Open new session
                        if (!this._clearDB) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._dbService.dbClearAll()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this._provider.getBlockNumber()];
                    case 3:
                        latestBlock = _a.sent();
                        tBlock = toBlock === "latest" ? latestBlock : blockTagToNumber(toBlock);
                        fBlock = fromBlock === "earliest" ? 0 : blockTagToNumber(fromBlock);
                        logs = [];
                        self = this;
                        console.log("Latest block in blockchain is #" + tBlock);
                        start = fBlock;
                        end = tBlock;
                        steps = 0;
                        _a.label = 4;
                    case 4:
                        if (!(start != end)) return [3 /*break*/, 9];
                        startTime = new Date();
                        return [4 /*yield*/, self.getEventPatch(eventName, start, end)];
                    case 5:
                        log = _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(log === undefined)) return [3 /*break*/, 8];
                        if (start == end) {
                            console.error("Too many events in 1 blocks!");
                            return [3 /*break*/, 8];
                        }
                        end = start + Math.floor((end - start) / 2);
                        return [4 /*yield*/, self.getEventPatch(eventName, start, end)];
                    case 7:
                        log = _a.sent();
                        steps += 1;
                        elapsedTime = new Date().getTime() - startTime.getTime();
                        if (elapsedTime > this._timeout) {
                            throw new Error(("timeout after " + elapsedTime + " ms"));
                        }
                        return [3 /*break*/, 6];
                    case 8:
                        logs = logs.concat(log);
                        start = end == tBlock ? end : end + 1;
                        end = tBlock;
                        steps += 1;
                        return [3 /*break*/, 4];
                    case 9:
                        console.log(logs.length + " event(s) detected!", "required " + steps + " steps");
                        return [2 /*return*/, { logs: logs, steps: steps }];
                }
            });
        });
    };
    /**
     * Extract data from log entry
     * @param {ethers.providers.Log} logEntry a log entry
     * @returns {EventInfoDataStruct} the required information to build a db node
     */
    EthereumWatcher.prototype.extractData = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var data, sender, receiver, value, decimals, displayValue, blockNumber, block, unix_timestamp, jsDate, neoDate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = this._event.decode(logEntry.data, logEntry.topics);
                        sender = data.from;
                        receiver = data.to;
                        value = data.value;
                        decimals = this._infos.get("contractDecimals");
                        displayValue = ethers_1.ethers.utils.formatUnits(value, decimals);
                        blockNumber = logEntry.blockNumber;
                        return [4 /*yield*/, this._provider.getBlock(blockNumber)];
                    case 1:
                        block = _a.sent();
                        unix_timestamp = ethers_1.ethers.utils.bigNumberify(block.timestamp).toNumber();
                        jsDate = new Date(unix_timestamp * 1000);
                        neoDate = neo4j_driver_1.v1.types.DateTime.fromStandardDate(jsDate);
                        // console.log(data);
                        return [2 /*return*/, {
                                blockNumber: logEntry.blockNumber,
                                date: neoDate,
                                from: sender,
                                to: receiver,
                                value: displayValue
                            }];
                }
            });
        });
    };
    /**
     * Get the smaller batch of events
     * @param {string} eventName
     * @param {number} fromBlock
     * @param {number} toBlock
     * @returns {Promise<ethers.providers.Log[]>}
     */
    EthereumWatcher.prototype.getEventPatch = function (eventName, fromBlock, toBlock) {
        return __awaiter(this, void 0, void 0, function () {
            var logs, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("Getting events '" + eventName + "' from block #" + fromBlock + " to block #" + toBlock);
                        return [4 /*yield*/, this._provider.getLogs({
                                fromBlock: fromBlock,
                                toBlock: toBlock,
                                address: this._contractAddr,
                                topics: [this._event.topic]
                            }).catch(function () { })];
                    case 1:
                        logs = _b.sent();
                        if (!logs) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getLogData(logs)];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = undefined;
                        _b.label = 4;
                    case 4: return [2 /*return*/, _a];
                }
            });
        });
    };
    return EthereumWatcher;
}(Watcher_1.Watcher));
exports.EthereumWatcher = EthereumWatcher;
exports.default = EthereumWatcher;
