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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Neode = require("neode");
var Database_1 = __importDefault(require("./Database"));
var Neo4J = /** @class */ (function (_super) {
    __extends(Neo4J, _super);
    /**
     * Create a connection to Neo4J database
     * @param {string} connection neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @param {boolean} enterpriseMode neo4j enterprise mode
     * @param {object} settings neo4 driver settings
     */
    function Neo4J(connection, username, password, enterpriseMode, settings) {
        var _this = _super.call(this) || this;
        _this._dbInstance = new Neode(connection, username, password, enterpriseMode);
        _this._dbSession = _this._dbInstance.session();
        return _this;
    }
    /**
     * Create a connection to Neo4J database
     * @param {string} connection neo4j bolt
     * @param {string} username neo4j username
     * @param {string} password neo4j password
     * @param {boolean} enterpriseMode neo4j enterprise mode
     * @param {object} settings neo4 driver settings
     */
    Neo4J.createInstance = function (connection, username, password, enterpriseMode, settings) {
        if (enterpriseMode === void 0) { enterpriseMode = false; }
        if (settings === void 0) { settings = {}; }
        return new Neo4J(connection, username, password, enterpriseMode, settings);
    };
    /**
     * Connect to the database
     */
    Neo4J.prototype.dbConnect = function () {
        return Promise.all([
            this._dbSession = this._dbInstance.session()
        ]);
    };
    /**
     * Reconnect to the database
     */
    Neo4J.prototype.dbReconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbTerminate()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.dbConnect()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close connection to the database
     */
    Neo4J.prototype.dbTerminate = function () {
        return Promise.all([
            this._dbSession.close()
        ]);
    };
    /**
     * Load a model
     * @param {DatabaseModel} model loaded model using require()
     */
    Neo4J.prototype.dbCreateModel = function (model) {
        // console.log('Model: ', model);
        this._dbInstance.with(model);
    };
    /**
     * Delete all entry in the database
     */
    Neo4J.prototype.dbClearAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._dbInstance.deleteAll("Account").then(function () {
                            console.log("Reset database");
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Relate two given nodes
     * @param {Neode.Node<any>} start start node
     * @param {Neode.Node<any>} end end node
     * @param {string} relType relationship name from model
     * @param {object} relProps relationship properties
     * @return {Promise<void | Neode.Relationship>} the ongoing process
     */
    Neo4J.prototype.dbRelateNodes = function (start, end, relType, relProps) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Create relationships
                return [2 /*return*/, start.relateTo(end, relType, relProps).catch(function (error) { console.log("Could not relate nodes", error); })];
            });
        });
    };
    /**
     * Create a pair of nodes then relate them
     * @param {object} startProps conditions to match start node
     * @param {object} endProps conditions to match end node
     * @param {string} relType relationship name from model
     * @param {object} relProps conditions to relate nodes
     */
    Neo4J.prototype.dbCreateNodes = function (startProps, endProps, relType, relProps) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, start, end;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this._dbInstance.mergeOn("Account", startProps, startProps),
                            this._dbInstance.mergeOn("Account", endProps, endProps)
                        ])];
                    case 1:
                        _a = _b.sent(), start = _a[0], end = _a[1];
                        return [4 /*yield*/, this.dbRelateNodes(start, end, relType, relProps)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tell the database to execute a query
     * @param {QueryData} queryData where parameters
     * @returns {Promise<any>} the result of queries
     */
    Neo4J.prototype.executeQuery = function (queryData) {
        return __awaiter(this, void 0, void 0, function () {
            var summary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbReconnect()];
                    case 1:
                        _a.sent();
                        console.log(queryData);
                        return [4 /*yield*/, this._dbInstance.cypher(queryData.query, queryData.params)];
                    case 2:
                        summary = _a.sent();
                        return [2 /*return*/, summary.records];
                }
            });
        });
    };
    /**
     * Tell the database to execute a query
     * @param {QueryData[]} queries a string query
     * @returns {Promise<any>} the result of queries
     */
    Neo4J.prototype.executeQueries = function (queries) {
        return __awaiter(this, void 0, void 0, function () {
            var summary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbReconnect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._dbInstance.batch(queries)];
                    case 2:
                        summary = _a.sent();
                        return [2 /*return*/, summary.records];
                }
            });
        });
    };
    return Neo4J;
}(Database_1.default));
exports.Neo4J = Neo4J;
exports.default = Neo4J;
